import { Fragment, useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../components/AdminPageHeader'
import { fetchOrder, fetchOrders, patchOrderStatus } from '../services/adminService'
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

/** What to pack and where to send it, shown under an order row. */
function OrderDetails({ detail }) {
  if (detail === 'loading') return <p className="text-sm text-admin-muted">Loading order…</p>
  if (!detail) return <p className="text-sm text-red-400">Could not load this order.</p>
  const a = detail.address
  const addressLines = [a.line1, a.line2, [a.city, a.state].filter(Boolean).join(', '), a.pincode].filter(Boolean)
  return (
    <div className="grid gap-6 text-sm md:grid-cols-2">
      <div>
        <p className="admin-field-label">Items</p>
        <ul className="space-y-1">
          {detail.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.qty}
              </span>
              <span className="tabular-nums text-admin-muted">{formatPrice(item.unitPrice * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between gap-4 border-t border-admin-border pt-3 font-medium">
          <span>Total{detail.couponCode ? ` (coupon ${detail.couponCode})` : ''}</span>
          <span className="tabular-nums">{formatPrice(detail.total)}</span>
        </p>
        {(detail.giftItems?.length > 0 || detail.giftNote) && (
          <div className="mt-3 rounded-lg border border-admin-gold/50 p-3">
            <p className="admin-field-label text-admin-gold">Gift wrap this order</p>
            {detail.giftItems?.length > 0 && <p>{detail.giftItems.join(', ')}</p>}
            <p className="mt-1 text-admin-muted">
              {detail.giftNote ? `Note: “${detail.giftNote}”` : 'No message — wrap without a note.'}
            </p>
          </div>
        )}
      </div>
      <div>
        <p className="admin-field-label">Ship to</p>
        <p>{detail.customerName}</p>
        {addressLines.length ? (
          addressLines.map((line, i) => (
            <p key={i} className="text-admin-muted">
              {line}
            </p>
          ))
        ) : (
          <p className="text-admin-muted">No address on this order.</p>
        )}
        <p className="mt-3 text-admin-muted">
          {detail.customerPhone || 'No phone'} · {detail.customerEmail}
        </p>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [details, setDetails] = useState({}) // order id -> 'loading' | order detail | null (failed)

  const toggleDetails = async (id) => {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)
    if (details[id] && details[id] !== 'loading') return
    setDetails((d) => ({ ...d, [id]: 'loading' }))
    try {
      const res = await fetchOrder(id)
      setDetails((d) => ({ ...d, [id]: res.order }))
    } catch {
      setDetails((d) => ({ ...d, [id]: null }))
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchOrders(filter, { from: fromDate, to: toDate })
      setOrders(res.orders ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [filter, fromDate, toDate])

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

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label>
          <span className="admin-field-label">From</span>
          <input
            type="date"
            className="admin-input"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label>
          <span className="admin-field-label">To</span>
          <input
            type="date"
            className="admin-input"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        {(fromDate || toDate) && (
          <button
            type="button"
            className="admin-filter-pill"
            onClick={() => {
              setFromDate('')
              setToDate('')
            }}
          >
            Clear dates
          </button>
        )}
      </div>

      <div className="admin-panel overflow-x-auto">
        <table className="admin-table admin-table--stack admin-table--orders w-full md:min-w-[720px]">
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
                  {fromDate || toDate || filter !== 'all'
                    ? 'No orders match these filters.'
                    : 'No orders yet. Checkout + Razorpay will create orders here.'}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <Fragment key={o.id}>
              <tr>
                <td className="font-medium">
                  <button
                    type="button"
                    className="text-left hover:text-admin-gold"
                    aria-expanded={openId === o.id}
                    onClick={() => toggleDetails(o.id)}
                  >
                    #{o.order_number ?? o.id}
                    <span className="mt-0.5 block text-[10px] font-normal uppercase tracking-widest text-admin-muted">
                      {openId === o.id ? 'Hide details' : 'View details'}
                    </span>
                  </button>
                </td>
                <td className="text-admin-muted">{o.customer_email}</td>
                <td>{formatPrice(o.total)}</td>
                <td className="truncate text-xs text-admin-gold md:max-w-[8rem]">
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
              {openId === o.id && (
                <tr>
                  <td colSpan={6} className="bg-admin-panel-2">
                    <OrderDetails detail={details[o.id]} />
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
