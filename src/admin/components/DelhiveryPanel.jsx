import { useCallback, useEffect, useState } from 'react'
import {
  cancelDelhiveryShipment,
  checkDelhiveryPincode,
  fetchDelhiveryLabel,
  fetchDelhiveryStatus,
  shipWithDelhivery,
  trackDelhivery,
} from '../services/adminService'
import { formatPrice } from '../../lib/format'

// Settings are the same for every order, so fetch them once per page load.
let settingsPromise = null
function loadSettings() {
  settingsPromise ??= fetchDelhiveryStatus().catch((err) => {
    settingsPromise = null
    return { configured: false, error: err.message }
  })
  return settingsPromise
}

const STEPS = ['Booked', 'In transit', 'Out for delivery', 'Delivered']

/** Where the parcel is, from Delhivery's status + status type. */
function shipmentStage(dl, status, statusType) {
  const s = String(status ?? '').toLowerCase()
  const t = String(statusType ?? '').toUpperCase()
  if (dl?.cancelled || t === 'CN' || s.includes('cancel')) return { key: 'cancelled', label: 'Cancelled', tone: 'cancelled', step: -1 }
  if (t === 'RT' || s === 'rto') return { key: 'return', label: s === 'rto' ? 'Returned to you' : 'Returning to you', tone: 'warn', step: -1 }
  if (t === 'DL' && s === 'delivered') return { key: 'delivered', label: 'Delivered', tone: 'done', step: 3 }
  if (s === 'dispatched' || s.includes('out for delivery')) return { key: 'ofd', label: 'Out for delivery', tone: 'progress', step: 2 }
  if (s === 'in transit' || s === 'pending' || s.includes('picked up')) return { key: 'transit', label: 'In transit', tone: 'progress', step: 1 }
  if (s === 'not picked') return { key: 'notpicked', label: 'Awaiting pickup (missed)', tone: 'warn', step: 0 }
  return { key: 'booked', label: 'Awaiting pickup', tone: 'new', step: 0 }
}

function formatWhen(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function formatDay(value) {
  if (!value) return ''
  const d = new Date(String(value).slice(0, 10))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function Alert({ tone = 'error', children, onClose }) {
  return (
    <div className="dl-alert" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button type="button" className="dl-alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
}

function Stepper({ step }) {
  return (
    <ol className="dl-steps" aria-label="Shipment progress">
      {STEPS.map((label, i) => (
        <li key={label} data-state={i < step ? 'done' : i === step ? 'current' : 'todo'}>
          <span className="dl-step-dot" aria-hidden="true" />
          <span className="dl-step-label">{label}</span>
        </li>
      ))}
    </ol>
  )
}

function Timeline({ activities }) {
  const [all, setAll] = useState(false)
  if (!activities?.length) return null
  const shown = all ? activities : activities.slice(0, 5)
  return (
    <div className="mt-4">
      <p className="admin-field-label">Tracking history</p>
      <ol className="dl-timeline">
        {shown.map((a, i) => (
          <li key={i} data-latest={i === 0 ? 'true' : undefined}>
            <p className="text-admin-text">{a.status || 'Update'}</p>
            <p className="text-xs text-admin-muted">
              {formatWhen(a.at)}
              {a.location ? ` · ${a.location}` : ''}
            </p>
          </li>
        ))}
      </ol>
      {activities.length > 5 && (
        <button type="button" className="mt-1 text-xs text-admin-gold hover:underline" onClick={() => setAll((v) => !v)}>
          {all ? 'Show less' : `Show all ${activities.length} updates`}
        </button>
      )}
    </div>
  )
}

/** Ship an order with Delhivery, then follow it: AWB, label, pickup, live tracking, cancel. */
export default function DelhiveryPanel({ detail, onChanged }) {
  const dl = detail.delhivery
  const [settings, setSettings] = useState(null)
  const [service, setService] = useState(null) // null = checking
  const [busy, setBusy] = useState('')
  const [confirm, setConfirm] = useState('') // '' | 'ship' | 'cancel'
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tracking, setTracking] = useState(null)
  const [checkedAt, setCheckedAt] = useState(null)
  const [copied, setCopied] = useState(false)

  const cod = detail.paymentMethod === 'cod'
  const a = detail.address ?? {}
  const phoneDigits = String(detail.customerPhone ?? '').replace(/\D/g, '')
  const missing = [
    !a.line1 && 'street address',
    !/^\d{6}$/.test(String(a.pincode ?? '')) && 'a 6-digit pincode',
    phoneDigits.length < 10 && 'a 10-digit phone number',
  ].filter(Boolean)

  useEffect(() => {
    let live = true
    loadSettings().then((s) => live && setSettings(s))
    return () => {
      live = false
    }
  }, [])

  // Check the pincode as soon as the order opens, so problems show before shipping.
  useEffect(() => {
    if (dl?.awb || !/^\d{6}$/.test(String(a.pincode ?? ''))) return
    let live = true
    setService(null)
    checkDelhiveryPincode(a.pincode)
      .then((res) => live && setService(res.serviceability))
      .catch((err) => live && setService({ error: err.message }))
    return () => {
      live = false
    }
  }, [dl?.awb, a.pincode])

  const refreshTracking = useCallback(
    async ({ quiet = false } = {}) => {
      setBusy((b) => b || 'track')
      if (!quiet) setError('')
      try {
        const res = await trackDelhivery(detail.id)
        setTracking(res.tracking)
        setCheckedAt(new Date())
        if (res.tracking.changed) onChanged()
      } catch (err) {
        if (!quiet) setError(err.message)
      } finally {
        setBusy((b) => (b === 'track' ? '' : b))
      }
    },
    [detail.id, onChanged],
  )

  // Load tracking automatically once a shipment exists.
  useEffect(() => {
    if (dl?.awb && !dl.cancelled) refreshTracking({ quiet: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dl?.awb])

  const ship = async () => {
    setConfirm('')
    setBusy('ship')
    setError('')
    const res = await shipWithDelhivery(detail.id)
    setBusy('')
    if (!res.ok) setError(res.error || 'Could not create the shipment')
    else setNotice(`Shipment booked — AWB ${res.delhivery.awb}. Print the label and pack the parcel.`)
    onChanged()
  }

  const cancel = async () => {
    setConfirm('')
    setBusy('cancel')
    setError('')
    const res = await cancelDelhiveryShipment(detail.id)
    setBusy('')
    if (!res.ok) setError(res.error || 'Could not cancel the shipment')
    else setNotice('Delhivery shipment cancelled. The order itself is unchanged — update its status if needed.')
    onChanged()
  }

  // Delhivery's label links expire, so fetch a fresh one each time.
  const label = async () => {
    const win = window.open('', '_blank')
    setBusy('label')
    setError('')
    try {
      const res = await fetchDelhiveryLabel(detail.id)
      if (!res.url) throw new Error('No label available in mock mode')
      if (win) win.location.href = res.url
      else window.location.href = res.url
    } catch (err) {
      win?.close()
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const copyAwb = async () => {
    try {
      await navigator.clipboard.writeText(dl.awb)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked; the AWB is still selectable */
    }
  }

  const envBadge =
    settings?.env && settings.env !== 'production' ? (
      <span className="dl-badge" data-tone="warn">
        {settings.env === 'mock' ? 'Mock mode' : 'Staging'}
      </span>
    ) : null

  const header = (badge) => (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <p className="font-medium text-admin-text">Delhivery shipping</p>
        {envBadge}
      </div>
      {badge}
    </div>
  )

  const messages = (
    <>
      {notice && (
        <Alert tone="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert onClose={() => setError('')}>
          <p className="font-medium">Something went wrong</p>
          <p className="mt-0.5 break-words opacity-90">{error}</p>
        </Alert>
      )}
    </>
  )

  // ---- Shipped ---------------------------------------------------------
  if (dl?.awb) {
    const status = tracking?.status || dl.status
    const stage = shipmentStage(dl, status, tracking?.statusType || dl.statusType)
    const etd = tracking?.etd || dl.etd
    const canCancel = !dl.cancelled && ['booked', 'notpicked'].includes(stage.key)
    return (
      <section className="dl-card md:col-span-2" aria-label="Delhivery shipping">
        {header(
          <span className="dl-badge" data-tone={stage.tone}>
            {stage.label}
          </span>,
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="admin-field-label">AWB / waybill</p>
            <div className="flex items-center gap-2">
              <span className="dl-awb select-all">{dl.awb}</span>
              <button type="button" className="dl-icon-btn" onClick={copyAwb} aria-label="Copy AWB">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="text-right text-xs text-admin-muted">
            <p>{dl.paymentMode === 'COD' ? `COD · collect ${formatPrice(detail.total)}` : 'Prepaid'}</p>
            {etd && <p>Expected delivery: <span className="text-admin-text">{formatDay(etd)}</span></p>}
          </div>
        </div>

        {stage.step >= 0 && <Stepper step={stage.step} />}

        {!dl.cancelled &&
          (dl.pickupRequested ? (
            stage.step === 0 && (
              <p className="mt-3 text-xs text-admin-muted">
                Pickup from <span className="text-admin-text">{dl.pickupLocation || settings?.pickupLocation}</span>
                {dl.pickupDate ? ` · ${dl.pickupDate}` : ''}. Keep the labelled parcel ready.
              </p>
            )
          ) : (
            <Alert tone="warn">
              <p className="font-medium">Pickup not booked yet</p>
              <p className="mt-0.5 opacity-90">{dl.pickupError || 'The courier has not been asked to collect this parcel.'}</p>
              <button type="button" className="admin-btn-ghost mt-2" disabled={Boolean(busy)} onClick={ship}>
                {busy === 'ship' ? 'Requesting pickup…' : 'Retry pickup request'}
              </button>
            </Alert>
          ))}

        <div className="mt-4 flex flex-wrap gap-2">
          {!dl.cancelled && (
            <button type="button" className="admin-btn-gold" disabled={Boolean(busy)} onClick={label}>
              {busy === 'label' ? 'Getting label…' : 'Print label'}
            </button>
          )}
          <button type="button" className="admin-btn-ghost" disabled={Boolean(busy)} onClick={() => refreshTracking()}>
            {busy === 'track' ? 'Checking…' : 'Refresh tracking'}
          </button>
          {dl.trackUrl && (
            <a className="admin-btn-ghost" href={dl.trackUrl} target="_blank" rel="noreferrer">
              Open on Delhivery ↗
            </a>
          )}
          {canCancel && confirm !== 'cancel' && (
            <button type="button" className="dl-btn-danger-ghost" disabled={Boolean(busy)} onClick={() => setConfirm('cancel')}>
              Cancel shipment
            </button>
          )}
        </div>

        {confirm === 'cancel' && (
          <div className="dl-confirm mt-3" data-tone="danger">
            <p>
              Cancel AWB <span className="tabular-nums">{dl.awb}</span> with Delhivery? The order stays as it is and no refund is
              made.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="dl-btn-danger" disabled={Boolean(busy)} onClick={cancel}>
                {busy === 'cancel' ? 'Cancelling…' : 'Yes, cancel shipment'}
              </button>
              <button type="button" className="admin-btn-ghost" onClick={() => setConfirm('')}>
                Keep it
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-2">{messages}</div>

        <Timeline activities={tracking?.activities} />
        {checkedAt && <p className="mt-2 text-[11px] text-admin-muted">Last checked {formatWhen(checkedAt)}</p>}
      </section>
    )
  }

  // ---- Not shipped -----------------------------------------------------
  const blocked =
    detail.status === 'cancelled'
      ? 'This order is cancelled.'
      : detail.status === 'payment_pending'
        ? 'Ships once payment is received.'
        : null

  const serviceProblem =
    service && !service.error
      ? !service.serviceable
        ? service.embargo
          ? `Delhivery has temporarily paused deliveries to ${service.pincode}.`
          : `Delhivery does not deliver to ${service.pincode}.`
        : cod && !service.cod
          ? `${service.pincode} is prepaid-only — Delhivery can't collect cash there.`
          : !cod && !service.prepaid
            ? `${service.pincode} only accepts COD shipments.`
            : null
      : null

  const notConfigured = settings && !settings.configured
  const noWarehouse = settings && settings.configured && !settings.pickupLocation
  const disabledReason =
    blocked ||
    (notConfigured && 'Delhivery is not set up — add DELHIVERY_API_TOKEN to .env.') ||
    (noWarehouse && 'Set DELHIVERY_PICKUP_LOCATION in .env to your Delhivery warehouse name.') ||
    (missing.length && `Address needs ${missing.join(', ')} before it can ship.`) ||
    serviceProblem

  const pkg = settings?.package
  const isLive = settings?.env === 'production'

  return (
    <section className="dl-card md:col-span-2" aria-label="Delhivery shipping">
      {header(
        <span className="dl-badge" data-tone="muted">
          Not shipped
        </span>,
      )}

      {blocked ? (
        <p className="text-admin-muted">{blocked}</p>
      ) : (
        <>
          <dl className="dl-facts">
            <div>
              <dt>Deliver to</dt>
              <dd>
                {a.pincode || '—'}
                {service === null && /^\d{6}$/.test(String(a.pincode ?? '')) && (
                  <span className="text-admin-muted"> · checking…</span>
                )}
                {service?.serviceable && !serviceProblem && (
                  <span className="text-emerald-400"> · ✓ serviceable{service.district ? ` (${service.district})` : ''}</span>
                )}
                {service?.error && <span className="text-amber-400"> · couldn’t check</span>}
              </dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{cod ? `COD · collect ${formatPrice(detail.total)}` : `Prepaid · ${formatPrice(detail.total)}`}</dd>
            </div>
            <div>
              <dt>Pickup from</dt>
              <dd>{settings?.pickupLocation || (settings ? '—' : '…')}</dd>
            </div>
            <div>
              <dt>Package</dt>
              <dd>
                {pkg
                  ? `${pkg.weightG >= 1000 ? `${pkg.weightG / 1000} kg` : `${pkg.weightG} g`} · ${pkg.lengthCm}×${pkg.breadthCm}×${pkg.heightCm} cm · ${settings.shippingMode}`
                  : '…'}
              </dd>
            </div>
          </dl>

          {disabledReason ? (
            <Alert tone="warn">{disabledReason}</Alert>
          ) : confirm === 'ship' ? (
            <div className="dl-confirm" data-tone={isLive ? 'danger' : 'info'}>
              <p className="font-medium">
                {isLive ? 'Book a real Delhivery shipment?' : 'Book a test shipment?'}
              </p>
              <p className="mt-0.5 text-admin-muted">
                This creates the AWB and asks Delhivery to collect the parcel from your warehouse at the next pickup slot.
                {isLive ? ' Delhivery will charge for it once picked up.' : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="admin-btn-gold" disabled={Boolean(busy)} onClick={ship}>
                  {busy === 'ship' ? 'Booking shipment…' : 'Yes, book shipment'}
                </button>
                <button type="button" className="admin-btn-ghost" disabled={busy === 'ship'} onClick={() => setConfirm('')}>
                  Not yet
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="admin-btn-gold"
              disabled={Boolean(busy) || !settings || service === null}
              onClick={() => setConfirm('ship')}
            >
              Ship with Delhivery
            </button>
          )}
        </>
      )}

      <div className="mt-3 space-y-2">{messages}</div>
    </section>
  )
}
