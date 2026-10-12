/**
 * Razorpay Orders API (server-side). Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env
 * or store in admin_settings via Settings page.
 */

import crypto from 'node:crypto'
import { query } from '../config/db.js'

async function getSetting(key) {
  const rows = await query('SELECT setting_value FROM admin_settings WHERE setting_key = :k LIMIT 1', {
    k: key,
  })
  return rows[0]?.setting_value?.trim() ?? ''
}

export async function getRazorpayCredentials() {
  const envId = process.env.RAZORPAY_KEY_ID?.trim()
  const envSecret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (envId && envSecret) return { keyId: envId, keySecret: envSecret, source: 'env' }

  const keyId = await getSetting('razorpay_key_id')
  const keySecret = await getSetting('razorpay_key_secret')
  if (keyId && keySecret) return { keyId, keySecret, source: 'db' }

  return null
}

export async function createRazorpayOrder({ amountPaise, receipt, notes = {} }) {
  const creds = await getRazorpayCredentials()
  if (!creds) {
    const err = new Error('Razorpay is not configured')
    err.code = 'RAZORPAY_NOT_CONFIGURED'
    throw err
  }

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64')
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error?.description || 'Razorpay order creation failed')
    err.code = 'RAZORPAY_API_ERROR'
    throw err
  }
  return { ...data, keyId: creds.keyId }
}

/** Full refund of a captured payment. Resolves `{ id, alreadyRefunded }`. */
export async function refundRazorpayPayment({ paymentId, notes = {} }) {
  const creds = await getRazorpayCredentials()
  if (!creds) {
    const err = new Error('Razorpay is not configured')
    err.code = 'RAZORPAY_NOT_CONFIGURED'
    throw err
  }

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64')
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const description = data.error?.description || 'Razorpay refund failed'
    if (/fully refunded/i.test(description)) return { id: null, alreadyRefunded: true }
    const err = new Error(description)
    err.code = 'RAZORPAY_API_ERROR'
    throw err
  }
  return { id: data.id, alreadyRefunded: false }
}

export async function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const creds = await getRazorpayCredentials()
  if (!creds || !orderId || !paymentId || !signature) return false
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', creds.keySecret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)))
  } catch {
    return false
  }
}
