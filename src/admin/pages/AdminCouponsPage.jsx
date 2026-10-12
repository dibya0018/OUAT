import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { createCoupon, deleteCoupon, fetchCoupons, updateCoupon } from '../services/adminService'

const emptyForm = {
  code: '',
  discountType: 'percent',
  discountValue: '15',
  expiresAt: '',
  showOnSite: false,
}

function isCouponExpired(coupon) {
  if (!coupon?.expires_at) return false
  return new Date(coupon.expires_at).getTime() < Date.now()
}

function formatExpires(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function discountLabel(c) {
  return c.discount_type === 'percent' ? `${c.discount_value}% off` : `₹${c.discount_value} off`
}

function CouponModal({ title, form, setForm, onClose, onSave, saving }) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-labelledby="coupon-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="coupon-modal-title" className="text-lg font-medium text-admin-text">
            {title}
          </h2>
          <button type="button" className="admin-btn-ghost px-2 py-1" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="admin-field-label">Coupon code</span>
            <input
              className="admin-input uppercase"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="admin-field-label">Discount type</span>
              <select
                className="admin-input"
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount (₹)</option>
              </select>
            </label>
            <label className="block">
              <span className="admin-field-label">Value</span>
              <input
                type="number"
                min={1}
                className="admin-input"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="admin-field-label">Expires</span>
            <input
              type="datetime-local"
              className="admin-input"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-admin-border p-3">
            <input
              type="checkbox"
              checked={form.showOnSite}
              onChange={(e) => setForm((f) => ({ ...f, showOnSite: e.target.checked }))}
              className="mt-1 h-4 w-4 accent-[var(--color-admin-gold)]"
            />
            <span>
              <span className="text-sm font-medium text-admin-text">Show on website</span>
              <span className="mt-1 block text-xs text-admin-muted">
                Display in product page &quot;Available offers&quot;. Hidden coupons still work at checkout.
              </span>
            </span>
          </label>

          <button type="button" className="admin-btn-gold mt-2 w-full py-3" disabled={saving} onClick={onSave}>
            {saving ? 'Saving…' : 'Save coupon'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchCoupons()
      setCoupons(res.coupons ?? [])
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (c) => {
    setForm({
      code: c.code,
      discountType: c.discount_type,
      discountValue: String(c.discount_value),
      expiresAt: toDatetimeLocalValue(c.expires_at),
      showOnSite: Boolean(c.show_on_site),
    })
    setModal({ mode: 'edit', id: c.id })
  }

  const payloadFromForm = () => ({
    code: form.code.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    showOnSite: form.showOnSite,
    isActive: true,
  })

  const onSave = async () => {
    setSaving(true)
    try {
      const body = payloadFromForm()
      if (modal.mode === 'create') {
        await createCoupon(body)
      } else {
        await updateCoupon(modal.id, body)
      }
      setModal(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminPageHeader title="Coupons" onRefresh={load} refreshing={loading}>
        <button type="button" className="admin-btn-gold" onClick={openCreate}>
          + New coupon
        </button>
      </AdminPageHeader>

      <ul className="grid gap-4 lg:grid-cols-2">
        {!loading && coupons.length === 0 && (
          <li className="admin-panel p-8 text-center text-admin-muted lg:col-span-2">No coupons yet.</li>
        )}
        {coupons.map((c) => {
          const expired = isCouponExpired(c)
          const expiresLine = formatExpires(c.expires_at)
          return (
            <li key={c.id} className="admin-panel relative p-5 md:p-6">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  type="button"
                  className="admin-btn-ghost h-9 w-9 rounded-full p-0"
                  aria-label={`Edit ${c.code}`}
                  onClick={() => openEdit(c)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="admin-btn-ghost h-9 w-9 rounded-full p-0"
                  aria-label={`Delete ${c.code}`}
                  onClick={() => deleteCoupon(c.id).then(load)}
                >
                  ×
                </button>
              </div>

              <p className="font-display text-2xl text-admin-gold md:text-3xl">{c.code}</p>
              <p className="mt-1 text-admin-muted">{discountLabel(c)}</p>
              <p className="mt-3 text-xs text-admin-muted">
                {expiresLine ? `Expires ${expiresLine}` : 'No expiry'}
                {' · '}
                Used {c.use_count ?? 0}x
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {expired ? (
                  <span className="admin-pill admin-pill-expired">EXPIRED</span>
                ) : c.is_active ? (
                  <span className="admin-pill admin-pill-live">Active</span>
                ) : (
                  <span className="admin-pill admin-pill-archived">Inactive</span>
                )}
                {!c.show_on_site && <span className="admin-pill admin-pill-hidden">HIDDEN ON SITE</span>}
              </div>
            </li>
          )
        })}
      </ul>

      {modal && (
        <CouponModal
          title={modal.mode === 'create' ? 'New coupon' : 'Edit coupon'}
          form={form}
          setForm={setForm}
          onClose={() => setModal(null)}
          onSave={onSave}
          saving={saving}
        />
      )}
    </>
  )
}
