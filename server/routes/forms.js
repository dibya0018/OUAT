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
    const message = String(req.body?.message ?? '').trim()
    const errors = {}
    if (!name) errors.name = 'This field is required.'
    if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
    if (!message || message.length < 10) errors.message = 'Please enter at least 10 characters.'
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    await query(
      'INSERT INTO contact_messages (name, email, message) VALUES (:name, :email, :message)',
      { name, email, message },
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
    const company = String(payload.company ?? '').trim()
    const businessType = String(payload.businessType ?? '').trim()
    const quantity = String(payload.quantity ?? '').trim()
    const productInterest = String(payload.productInterest ?? '').trim()
    const message = String(payload.message ?? '').trim()

    const errors = {}
    if (!name) errors.name = 'This field is required.'
    if (!email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.'
    if (!company) errors.company = 'This field is required.'
    if (!businessType) errors.businessType = 'This field is required.'
    if (!quantity) errors.quantity = 'This field is required.'
    if (!productInterest) errors.productInterest = 'This field is required.'
    if (message && message.length < 10) errors.message = 'Please enter at least 10 characters.'
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    await query(
      `INSERT INTO b2b_enquiries
        (name, email, company, business_type, quantity, product_interest, message)
       VALUES (:name, :email, :company, :businessType, :quantity, :productInterest, :message)`,
      { name, email, company, businessType, quantity, productInterest, message: message || null },
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
