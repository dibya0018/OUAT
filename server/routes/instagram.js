import { Router } from 'express'

/*
 * Recent posts from @ouat_goa for the home page "From the studio" grid.
 *
 * Uses the Instagram Graph API with a long-lived token kept in .env (INSTAGRAM_ACCESS_TOKEN).
 * The token never leaves the server: the browser only gets image URLs and post links.
 * Results are cached in memory for INSTAGRAM_CACHE_MINUTES. With no token, or when Instagram
 * fails, the route returns { posts: [] } and the grid shows its static tiles instead.
 */

const router = Router()

const GRAPH = 'https://graph.instagram.com'
const FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
const MAX_POSTS = 6
const REFRESH_EVERY_MS = 24 * 60 * 60 * 1000

let cache = { posts: [], expiresAt: 0 }
let pending = null
// Long-lived tokens last 60 days; refreshing once a day keeps them alive while the server runs.
let token = null
let lastRefresh = 0

const cacheMs = () => Math.max(1, Number(process.env.INSTAGRAM_CACHE_MINUTES) || 60) * 60 * 1000

function currentToken() {
  const fromEnv = String(process.env.INSTAGRAM_ACCESS_TOKEN || '').trim()
  if (!fromEnv) return ''
  if (!token) token = fromEnv
  return token
}

async function refreshTokenIfDue() {
  if (Date.now() - lastRefresh < REFRESH_EVERY_MS) return
  lastRefresh = Date.now()
  try {
    const url = `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(currentToken())}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.access_token) token = data.access_token
  } catch {
    // A failed refresh is fine: the current token keeps working until it expires.
  }
}

function toPost(m) {
  const image = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url
  if (!image || !m.permalink) return null
  const caption = String(m.caption || '').replace(/\s+/g, ' ').trim()
  return {
    id: m.id,
    image,
    permalink: m.permalink,
    caption: caption.length > 140 ? `${caption.slice(0, 137)}…` : caption,
    type: m.media_type,
    timestamp: m.timestamp,
  }
}

async function fetchPosts() {
  await refreshTokenIfDue()
  const userId = String(process.env.INSTAGRAM_USER_ID || '').trim() || 'me'
  const url =
    `${GRAPH}/${encodeURIComponent(userId)}/media?fields=${FIELDS}&limit=12` +
    `&access_token=${encodeURIComponent(currentToken())}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || `Instagram ${res.status}`)
  return (data.data || []).map(toPost).filter(Boolean).slice(0, MAX_POSTS)
}

router.get('/instagram/media', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300')
  if (!currentToken()) return res.json({ posts: [], source: 'none' })
  if (Date.now() < cache.expiresAt) return res.json({ posts: cache.posts, source: 'cache' })

  try {
    pending ||= fetchPosts().finally(() => {
      pending = null
    })
    const posts = await pending
    cache = { posts, expiresAt: Date.now() + cacheMs() }
    res.json({ posts, source: 'instagram' })
  } catch (err) {
    console.warn('[instagram] could not load posts:', err.message)
    // Serve the last good posts if we have them; retry Instagram in 5 minutes.
    cache.expiresAt = Date.now() + 5 * 60 * 1000
    res.json({ posts: cache.posts, source: 'fallback' })
  }
})

export default router
