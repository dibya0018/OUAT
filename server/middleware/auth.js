import { query } from '../config/db.js'
import { hashApiKey } from '../lib/ids.js'
import { verifyAccessToken } from '../lib/jwt.js'

function publicUser(row) {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role ?? 'customer',
    isActive: row.is_active == null ? true : Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

const USER_COLS =
  'user_id, full_name, email, role, is_active, created_at'

async function userById(userId) {
  const rows = await query(`SELECT ${USER_COLS} FROM users WHERE user_id = :id LIMIT 1`, {
    id: userId,
  })
  return rows[0] ?? null
}

async function userByApiKey(apiKey) {
  if (!apiKey?.startsWith('ouat_')) return null
  const hash = hashApiKey(apiKey)
  const rows = await query(`SELECT ${USER_COLS} FROM users WHERE api_key_hash = :hash LIMIT 1`, {
    hash,
  })
  return rows[0] ?? null
}

/** Sets req.user when Bearer JWT or X-API-Key is valid; does not fail if missing. */
export async function optionalAuth(req, _res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : null
    const apiKey = req.headers['x-api-key']

    if (bearer) {
      const payload = verifyAccessToken(bearer)
      const row = await userById(payload.sub)
      if (row && row.is_active !== 0) req.user = publicUser(row)
      req.authMethod = 'jwt'
    } else if (apiKey) {
      const row = await userByApiKey(String(apiKey))
      if (row && row.is_active !== 0) req.user = publicUser(row)
      req.authMethod = 'api_key'
    }
    next()
  } catch (err) {
    next(err)
  }
}

/** Requires Authorization: Bearer <jwt> OR X-API-Key header. */
export async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : null
    const apiKey = req.headers['x-api-key']

    if (bearer) {
      let payload
      try {
        payload = verifyAccessToken(bearer)
      } catch {
        return res.status(401).json({ ok: false, error: 'Invalid or expired token' })
      }
      const row = await userById(payload.sub)
      if (!row) return res.status(401).json({ ok: false, error: 'User not found' })
      if (row.is_active === 0) return res.status(403).json({ ok: false, error: 'This account is deactivated.' })
      req.user = publicUser(row)
      req.authMethod = 'jwt'
      return next()
    }

    if (apiKey) {
      const row = await userByApiKey(String(apiKey))
      if (!row) return res.status(401).json({ ok: false, error: 'Invalid API key' })
      if (row.is_active === 0) return res.status(403).json({ ok: false, error: 'This account is deactivated.' })
      req.user = publicUser(row)
      req.authMethod = 'api_key'
      return next()
    }

    return res.status(401).json({
      ok: false,
      error: 'Authentication required. Use Authorization: Bearer <token> or X-API-Key header.',
    })
  } catch (err) {
    next(err)
  }
}
