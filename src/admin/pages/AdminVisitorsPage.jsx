import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchVisitors } from '../services/adminService'

const RANGES = [
  { label: 'Today', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

export default function AdminVisitorsPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchVisitors(days))
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    load()
  }, [load])

  const maxViews = Math.max(1, ...(data?.byDay ?? []).map((d) => Number(d.views)))

  return (
    <>
      <AdminPageHeader title="Visitors" onRefresh={load} refreshing={loading} />
      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            className="admin-filter-pill"
            data-active={days === r.days ? 'true' : 'false'}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Page views', value: data?.totals?.pageViews ?? 0 },
          { label: 'Unique visitors', value: data?.totals?.uniqueVisitors ?? 0 },
          { label: 'Pages visited', value: data?.totals?.pagesVisited ?? 0 },
        ].map((c) => (
          <div key={c.label} className="admin-panel p-5">
            <p className="text-xs uppercase tracking-widest text-admin-muted">{c.label}</p>
            <p className="admin-stat-value mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="admin-panel mt-8 p-5">
        <h2 className="text-sm uppercase tracking-widest text-admin-muted">Views by day</h2>
        <ul className="mt-6 space-y-3">
          {(data?.byDay ?? []).map((row) => (
            <li key={row.day} className="grid grid-cols-[4rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="text-admin-muted">
                {new Date(row.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-admin-panel-2">
                <div
                  className="h-full rounded-full bg-admin-gold"
                  style={{ width: `${(Number(row.views) / maxViews) * 100}%` }}
                />
              </div>
              <span className="text-right tabular-nums">{row.views}</span>
            </li>
          ))}
          {!loading && !(data?.byDay ?? []).length && (
            <li className="py-6 text-center text-admin-muted">No views recorded yet.</li>
          )}
        </ul>
      </section>

      <section className="admin-panel mt-6 overflow-x-auto p-5">
        <h2 className="text-sm uppercase tracking-widest text-admin-muted">Top pages</h2>
        <table className="admin-table mt-4 w-full min-w-[480px]">
          <thead>
            <tr>
              <th>Page</th>
              <th>Views</th>
              <th>Unique</th>
            </tr>
          </thead>
          <tbody>
            {(data?.topPages ?? []).map((p) => (
              <tr key={p.path}>
                <td className="text-admin-gold">{p.path}</td>
                <td>{p.views}</td>
                <td>{p.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
