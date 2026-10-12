import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchOrders, patchOrderStatus } from '../services/adminService'
import { formatPrice } from '../../lib/format'

const FILTERS = [
  'all',
  'pending',
  'payment_pending',
  'completed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

const STATUS_LABELS = {
  all: 'All',
  pending: 'New (COD)',
  payment_pending: 'Awaiting payment',
  completed: 'Paid',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** Colour of the status control: new orders gold, in transit blue, done green. */
function statusTone(status) {
  if (status === 'payment_pending') return 'muted'
  if (status === 'pending' || status === 'completed') return 'new'
  if (status === 'delivered') return 'done'
  if (status === 'cancelled') return 'cancelled'
  return 'progress'
}

/** Statuses that make sense for this order (its current one is always kept). */
function statusOptions(order) {
  const paidOnline = Boolean(order.razorpay_payment_id)
  const cod = order.payment_method === 'cod'
  return FILTERS.filter((s) => {
    if (s === 'all') return false
    if (s === order.status) return true
    if (s === 'payment_pending') return !paidOnline && !cod
    if (s === 'pending') return cod
    if (s === 'completed') return paidOnline
    return true
  })
}

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchOrders(filter)
      setOrders(res.orders ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (order, status) => {
    if (status === 'cancelled' && order.razorpay_payment_id) {
      const sure = window.confirm(
        `Cancel order ${order.order_number ?? order.id} and refund ${formatPrice(order.total)} to the customer via Razorpay? This cannot be undone.`,
      )
      if (!sure) return
    }
    try {
      const res = await patchOrderStatus(order.id, status)
      if (res.refunded) window.alert(`Order cancelled. ${formatPrice(order.total)} refunded via Razorpay.`)
    } catch (err) {
      window.alert(err.message || 'Could not update order status')
    }
    load()
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 20_000)
    return () => window.clearInterval(id)
  }, [load])

  return (
    <>
      <AdminPageHeader title="Orders" onRefresh={load} refreshing={loading} />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className="admin-filter-pill"
            data-active={filter === f ? 'true' : 'false'}
            onClick={() => setFilter(f)}
          >
            {STATUS_LABELS[f] ?? f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="admin-panel overflow-x-auto">
        <table className="admin-table w-full min-w-[720px]">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Razorpay txn</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-admin-muted">
                  No orders yet. Checkout + Razorpay will create orders here.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="font-medium">#{o.order_number ?? o.id}</td>
                <td className="text-admin-muted">{o.customer_email}</td>
                <td>{formatPrice(o.total)}</td>
                <td className="max-w-[8rem] truncate text-xs text-admin-gold">
                  {o.razorpay_payment_id || o.razorpay_order_id || o.payment_method || '—'}
                </td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o, e.target.value)}
                    className="admin-status-select"
                    data-tone={statusTone(o.status)}
                    // A refunded cancellation can't be reopened — the money has gone back.
                    disabled={o.status === 'cancelled' && Boolean(o.razorpay_payment_id)}
                    aria-label={`Update status for order ${o.order_number ?? o.id}`}
                  >
                    {statusOptions(o).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="text-xs text-admin-muted">
                  {o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
