/**
 * Form service — validates client-side, then POSTs to the API when configured.
 */
import { apiBase, apiPost } from '../lib/api.js'

const useApi = Boolean(apiBase() || import.meta.env.VITE_API_BASE_URL === '/api')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns an error message for a value against simple rules, or null. */
function check(value, { required, email, min } = {}) {
  const v = typeof value === 'string' ? value.trim() : value
  if (required && (v === undefined || v === null || v === '')) return 'This field is required.'
  if (email && v && !EMAIL_RE.test(v)) return 'Please enter a valid email address.'
  if (min && v && String(v).length < min) return `Please enter at least ${min} characters.`
  return null
}

function validate(payload, rules) {
  const errors = {}
  for (const [field, rule] of Object.entries(rules)) {
    const err = check(payload[field], rule)
    if (err) errors[field] = err
  }
  return errors
}

/**
 * Corporate gifting enquiry.
 * @param {{ name, email, subject, message? }} payload
 */
export async function submitEnquiry(payload) {
  const errors = validate(payload, {
    name: { required: true },
    email: { required: true, email: true },
    subject: { required: true },
  })
  if (Object.keys(errors).length) return { ok: false, errors }

  if (useApi) {
    const data = await apiPost('/api/enquiries', payload)
    if (data.ok === false) return data
    if (data.ok) return { ok: true }
  }
  console.info('[formService] submitEnquiry', payload)
  return { ok: true }
}

/**
 * General contact message.
 * @param {{ name, email, subject, message? }} payload
 */
export async function submitContact(payload) {
  const errors = validate(payload, {
    name: { required: true },
    email: { required: true, email: true },
    subject: { required: true },
  })
  if (Object.keys(errors).length) return { ok: false, errors }

  if (useApi) {
    const data = await apiPost('/api/contact', payload)
    if (data.ok === false) return data
    if (data.ok) return { ok: true }
  }
  console.info('[formService] submitContact', payload)
  return { ok: true }
}

/**
 * Newsletter signup.
 * @param {{ email }} payload
 */
export async function subscribeNewsletter(payload) {
  const errors = validate(payload, { email: { required: true, email: true } })
  if (Object.keys(errors).length) return { ok: false, errors }

  if (useApi) {
    const data = await apiPost('/api/newsletter', payload)
    if (data.ok === false) return data
    if (data.ok) return { ok: true }
  }
  console.info('[formService] subscribeNewsletter', payload)
  return { ok: true }
}
