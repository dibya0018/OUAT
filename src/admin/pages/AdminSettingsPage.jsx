import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchSettings, saveSettings } from '../services/adminService'
import { IconSettings } from '../components/AdminIcons'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null)
  const [codEnabled, setCodEnabled] = useState(true)
  const [keyId, setKeyId] = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetchSettings()
      setSettings(res.settings)
      setCodEnabled(res.settings?.codEnabled ?? true)
      setKeyId(res.settings?.razorpayKeyId ?? '')
    } catch {
      setSettings(null)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await saveSettings({
        codEnabled,
        razorpayKeyId: keyId,
        razorpayKeySecret: keySecret || undefined,
      })
      setKeySecret('')
      setMessage('Settings saved.')
      load()
    } catch (err) {
      setMessage(err.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminPageHeader title="Settings" onRefresh={load} />
      <form onSubmit={onSave} className="admin-panel max-w-xl p-6">
        <div className="flex items-center gap-2 text-admin-gold">
          <IconSettings />
          <h2 className="text-lg font-medium text-admin-text">Payment settings</h2>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Cash on Delivery (COD)</p>
            <p className="mt-1 text-sm text-admin-muted">
              When enabled, customers can pay in cash on delivery. When disabled, checkout uses Razorpay online
              payment.
            </p>
          </div>
          <button
            type="button"
            className={`admin-btn-ghost shrink-0 ${codEnabled ? 'border-green-500/50 text-green-400' : ''}`}
            onClick={() => setCodEnabled((v) => !v)}
          >
            {codEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        {codEnabled && (
          <p className="mt-3 text-sm text-green-400">✓ COD is ON — available at checkout when cities allow it.</p>
        )}

        <hr className="my-8 border-admin-border" />

        <p className="font-medium">Razorpay</p>
        <p className="mt-1 text-sm text-admin-muted">
          Key ID is public in checkout. Secret stays on the server only. You can also set{' '}
          <code className="text-admin-gold">RAZORPAY_KEY_ID</code> in server .env.
        </p>
        <label className="mt-4 block text-xs uppercase tracking-widest text-admin-muted">
          Key ID
          <input
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-admin-border bg-admin-panel-2 px-3 py-2 text-sm text-admin-text"
            placeholder="rzp_test_…"
          />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-widest text-admin-muted">
          Key secret (leave blank to keep current)
          <input
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            className="mt-2 w-full rounded-lg border border-admin-border bg-admin-panel-2 px-3 py-2 text-sm text-admin-text"
            autoComplete="new-password"
          />
        </label>
        {settings?.razorpayConfigured && (
          <p className="mt-2 text-sm text-green-400">Razorpay credentials are configured.</p>
        )}

        <button type="submit" className="admin-btn-gold mt-8" disabled={saving}>
          {saving ? 'Saving…' : 'Save payment settings'}
        </button>
        {message && <p className="mt-3 text-sm text-admin-muted">{message}</p>}
      </form>
    </>
  )
}
