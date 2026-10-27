import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '../components/AdminPageHeader'
import { deleteProduct, fetchAdminProducts, patchProduct } from '../services/adminService'
import { formatPrice } from '../../lib/format'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminProducts()
      setProducts(res.products ?? [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleActive = async (p) => {
    await patchProduct(p.id, { active: !p.active })
    load()
  }

  const removeProduct = async (p) => {
    const sure = window.confirm(
      `Delete "${p.name}" permanently?

Its photos and reviews will be removed too. This can't be undone.`,
    )
    if (!sure) return
    setError('')
    setDeletingId(p.id)
    try {
      await deleteProduct(p.id)
      setProducts((list) => list.filter((x) => x.id !== p.id))
    } catch (err) {
      setError(err.message || 'Could not delete this product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <AdminPageHeader title="Products" onRefresh={load} refreshing={loading}>
        <Link to="/admin/products/new" className="admin-btn-gold">
          + New product
        </Link>
      </AdminPageHeader>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="admin-panel overflow-x-auto">
        <table className="admin-table admin-table--stack admin-table--products w-full md:min-w-[640px]">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-admin-muted">
                  Loading products…
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-admin-muted">
                  No products in database. Run npm run db:seed.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-admin-panel-2">
                      {p.imageSrc ? (
                        <img src={p.imageSrc} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-admin-text">{p.name}</p>
                      <p className="text-xs capitalize text-admin-muted">{p.collection}</p>
                    </div>
                  </div>
                </td>
                <td className="tabular-nums">{formatPrice(p.price)}</td>
                <td className="tabular-nums">{p.stock}</td>
                <td>
                  <span className={p.active ? 'admin-pill admin-pill-live' : 'admin-pill admin-pill-archived'}>
                    {p.active ? 'Live' : 'Archived'}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/products/${p.id}`} className="admin-btn-ghost text-xs">
                      Manage
                    </Link>
                    <button type="button" className="admin-btn-ghost text-xs" onClick={() => toggleActive(p)}>
                      {p.active ? 'Archive' : 'Restore'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs text-red-400"
                      disabled={deletingId === p.id}
                      onClick={() => removeProduct(p)}
                    >
                      {deletingId === p.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
