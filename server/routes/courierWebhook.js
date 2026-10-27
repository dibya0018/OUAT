import crypto from 'node:crypto'
import express, { Router } from 'express'
import { handleTrackingWebhook } from '../lib/delhivery.js'

const router = Router()

function tokenMatches(given) {
  const expected = process.env.DELHIVERY_WEBHOOK_TOKEN?.trim()
  if (!expected || !given) return false
  const a = Buffer.from(String(given))
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Accepts the token as "Authorization: Bearer|Token <t>" or "x-api-key: <t>". */
function givenToken(req) {
  const auth = req.get('authorization') ?? ''
  const m = auth.match(/^(?:Bearer|Token)\s+(.+)$/i)
  return m ? m[1].trim() : req.get('x-api-key')
}

/**
 * Delhivery scan-push (shipment status) webhook at /api/webhooks/courier-tracking.
 * Delhivery sets it up from their Webhook Requirement Document, where you give
 * this URL and DELHIVERY_WEBHOOK_TOKEN as the authorization header.
 */
router.post('/webhooks/courier-tracking', express.json({ limit: '256kb' }), async (req, res) => {
  if (!tokenMatches(givenToken(req))) return res.status(401).json({ ok: false })
  try {
    // Delhivery may batch several shipments in one push.
    const bodies = Array.isArray(req.body) ? req.body : [req.body ?? {}]
    for (const body of bodies) await handleTrackingWebhook(body)
  } catch (err) {
    console.error('Courier webhook failed:', err.message)
  }
  // Always 200 so Delhivery keeps pushing.
  res.json({ ok: true })
})

export default router
