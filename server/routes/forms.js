import { Router } from 'express'
import { query } from '../config/db.js'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/newsletter', async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, errors: { email: 'Please enter a valid email address.' } })
    }
    await query(
      'INSERT INTO newsletter_subscribers (email, source) VALUES (:email, :source) ON DUPLICATE KEY UPDATE email = email',
      { email, source: req.body?.source ?? 'website' },
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/contact', async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const email = String(req.body?.email ?? '').trim()
    const subject = String(req.body?.subject ?? '').trim()
    const message = String(req.body?.message ?? '').trim()
    const errors = {}
    if (!name) errors.name = 'This field is required.'
    if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
    if (!subject) errors.subject = 'This field is required.'
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    // The table has no subject column, so the subject leads the stored message (message itself is optional).
    await query(
      'INSERT INTO contact_messages (name, email, message) VALUES (:name, :email, :message)',
      { name, email, message: message ? `Subject: ${subject}\n\n${message}` : `Subject: ${subject}` },
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/enquiries', async (req, res, next) => {
  try {
    const payload = req.body ?? {}
    const name = String(payload.name ?? '').trim()
    const email = String(payload.email ?? '').trim()
    const subject = String(payload.subject ?? '').trim()
    const message = String(payload.message ?? '').trim()

    const errors = {}
    if (!name) errors.name = 'This field is required.'
    if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
    if (!subject) errors.subject = 'This field is required.'
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    // The gifting form only asks for name, email, subject and an optional message. The table's older
    // business columns are NOT NULL, so they get fixed gifting values and the subject leads the message.
    await query(
      `INSERT INTO b2b_enquiries
        (name, email, company, business_type, quantity, product_interest, message)
       VALUES (:name, :email, '', 'corporate-gifting', '', 'gift-boxes', :message)`,
      { name, email, message: message ? `Subject: ${subject}\n\n${message}` : `Subject: ${subject}` },
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
