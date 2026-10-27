import { useState } from 'react'
import { resendOrderEmails } from '../services/adminService'

const STATE_LABELS = { sent: 'Sent', sending: 'Sending…', failed: 'Failed' }

function when(value) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function Row({ label, state, at, error }) {
  return (
    <p className="flex flex-wrap justify-between gap-2">
      <span>{label}</span>
      <span className={state === 'failed' ? 'text-red-400' : 'text-admin-muted'}>
        {state ? `${STATE_LABELS[state] ?? state}${at ? ` · ${when(at)}` : ''}` : 'Not sent'}
        {state === 'failed' && error ? ` (${error})` : ''}
      </span>
    </p>
  )
}

/** Order confirmation + bottle passport email status, with a resend button. */
export default function OrderEmailsPanel({ detail, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const e = detail.emails ?? {}
  const unpaid = detail.paymentMethod !== 'cod' && detail.status === 'payment_pending'

  async function resend() {
    setBusy(true)
    setMessage(null)
    try {
      await resendOrderEmails(detail.id)
      setMessage({ tone: 'ok', text: `Sent to ${detail.customerEmail}.` })
      onChanged?.()
    } catch (err) {
      setMessage({ tone: 'error', text: err.message || 'Could not send the emails.' })
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="md:col-span-2 rounded-lg border border-admin-border p-4" aria-label="Customer emails">
      <p className="admin-field-label">Customer emails</p>
      <div className="space-y-1">
        <Row label="Order confirmation + invoice" state={e.confirmation} at={e.confirmationAt} error={e.confirmationError} />
        <Row label="Bottle passport" state={e.passport} at={e.passportAt} error={e.passportError} />
      </div>
      {e.mailConfigured === false && (
        <p className="mt-2 text-admin-muted">Email is not set up yet: add the SMTP_* settings to the server .env.</p>
      )}
      {message && (
        <p className={`mt-2 ${message.tone === 'error' ? 'text-red-400' : 'text-admin-muted'}`} role="status">
          {message.text}
        </p>
      )}
      <button
        type="button"
        className="admin-btn-ghost mt-3"
        onClick={resend}
        disabled={busy || unpaid || e.mailConfigured === false}
        title={unpaid ? 'Payment has not been captured for this order' : undefined}
      >
        {busy ? 'Sending…' : e.confirmation || e.passport ? 'Resend confirmation emails' : 'Send confirmation emails'}
      </button>
    </section>
  )
}
