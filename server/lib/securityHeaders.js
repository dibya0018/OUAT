import { isLocal } from './appEnv.js'

/**
 * Basic security headers for every response.
 *
 * Deliberately no full Content-Security-Policy yet: the site loads Google Analytics, Tag Manager,
 * the Meta Pixel and Razorpay Checkout, and a strict policy would need testing against each.
 * `frame-ancestors` alone is safe and stops other sites from embedding our pages (clickjacking).
 */
export function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  })
  // Tell browsers to only use HTTPS for this site from now on (live site over HTTPS only).
  if (!isLocal() && req.secure) {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
}

/**
 * How many proxies sit in front of the app (Hostinger runs Node behind one). Needed so req.ip is
 * the visitor's address, not the proxy's, for rate limits. TRUST_PROXY overrides; defaults to 1 on
 * the live server and off locally (where trusting X-Forwarded-For would let anyone fake their IP).
 */
export function trustProxySetting() {
  const raw = String(process.env.TRUST_PROXY ?? '').trim().toLowerCase()
  if (raw === '') return isLocal() ? false : 1
  if (raw === 'false' || raw === '0' || raw === 'off') return false
  if (raw === 'true') return 1
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : raw
}
