import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchReviews, patchReview } from '../services/adminService'

const TABS = ['pending', 'approved', 'rejected', 'all']

export default function AdminReviewsPage() {
  const [tab, setTab] = useState('pending')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchReviews(tab)
      setReviews(res.reviews ?? [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <AdminPageHeader title="Reviews" onRefresh={load} refreshing={loading} />
      <p className="mb-4 max-w-2xl text-sm text-admin-muted">
        Approve reviews to show them on product pages. Only <strong className="text-admin-gold">approved</strong>{' '}
        reviews appear in the store.
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className="admin-filter-pill capitalize"
            data-active={tab === t ? 'true' : 'false'}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="admin-panel p-6">
        {!loading && reviews.length === 0 && (
          <p className="py-8 text-center text-admin-muted">No {tab === 'all' ? '' : tab} reviews.</p>
        )}
        <ul className="divide-y divide-admin-border">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{r.author_name}</p>
                <p className="text-xs text-admin-muted">
                  {r.product_id} · ★ {r.rating}
                </p>
                {r.body && <p className="mt-2 text-sm text-admin-muted">{r.body}</p>}
              </div>
              <div className="flex gap-2">
                {r.status !== 'approved' && (
                  <button
                    type="button"
                    className="admin-btn-ghost text-green-400"
                    onClick={() => patchReview(r.id, 'approved').then(load)}
                  >
                    Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    type="button"
                    className="admin-btn-ghost text-red-400"
                    onClick={() => patchReview(r.id, 'rejected').then(load)}
                  >
                    Reject
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
