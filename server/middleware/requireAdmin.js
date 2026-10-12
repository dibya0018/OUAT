import { requireAuth } from './auth.js'
import { isAdminUser } from '../lib/adminAccess.js'

/** Requires authenticated user with users.role = admin in DB. */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err)
    if (res.headersSent) return
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ ok: false, error: 'Admin access required.' })
    }
    next()
  })
}
