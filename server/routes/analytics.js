import { Router } from 'express'
import { query } from '../config/db.js'

const router = Router()

/** Record a page view from the storefront (anonymous). */
router.post('/analytics/page-view', async (req, res, next) => {
  try {
    const path = String(req.body.path ?? '/').slice(0, 512)
    const visitorId = String(req.body.visitorId ?? '').slice(0, 64) || null
    await query('INSERT INTO page_view_events (path, visitor_id) VALUES (:path, :vid)', {
      path,
      vid: visitorId,
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
