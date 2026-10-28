import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchDashboard } from '../services/adminService'
import { formatPrice } from '../../lib/format'

function formatWhen(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchDashboard())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = data?.stats

  return (
    <>
      <AdminPageHeader title="Dashboard" onRefresh={load} refreshing={loading} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          { label: 'Total revenue', value: stats ? formatPrice(stats.totalRevenue) : '—' },
          { label: 'Customers', value: stats?.customers ?? '—' },
          { label: 'Pending orders', value: stats?.pendingOrders ?? '—' },
          { label: 'Completed orders', value: stats?.completedOrders ?? '—' },
        ].map((card) => (
          <div key={card.label} className="admin-panel min-w-0 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-widest text-admin-muted">{card.label}</p>
            <p className="admin-stat-value mt-3">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="admin-panel mt-8 p-5 md:p-6">
        <h2 className="text-sm uppercase tracking-widest text-admin-muted">Recent activity</h2>
        <ul className="mt-4 divide-y divide-admin-border">
          {(data?.activity ?? []).length === 0 && (
            <li className="py-8 text-center text-sm text-admin-muted">
              {loading ? 'Loading…' : 'No activity yet. Changes in admin will appear here.'}
            </li>
          )}
          {(data?.activity ?? []).map((row, i) => (
            <li key={i} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:justify-between">
              <span className="text-admin-text">{row.message}</span>
              <span className="shrink-0 text-admin-muted">{formatWhen(row.at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
