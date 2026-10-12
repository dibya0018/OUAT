import { Router } from 'express'
import { query } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { buildTrackingTimeline, isActiveOrderStatus } from '../lib/orderTracking.js'

const router = Router()

function jsonField(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return value
}

async function itemsForOrders(orderIds) {
  if (!orderIds.length) return new Map()
  const placeholders = orderIds.map((_, i) => `:id${i}`).join(', ')
  const params = Object.fromEntries(orderIds.map((id, i) => [`id${i}`, id]))
  const rows = await query(
    `SELECT order_id, product_id, product_name, quantity, unit_price
     FROM order_items WHERE order_id IN (${placeholders})`,
    params,
  )
  const map = new Map()
  for (const row of rows) {
    const list = map.get(row.order_id) ?? []
    list.push({
      productId: row.product_id,
      name: row.product_name,
      qty: row.quantity,
      unitPrice: row.unit_price,
    })
    map.set(row.order_id, list)
  }
  return map
}

function mapOrder(row, items) {
  const shipping = jsonField(row.shipping_json, {})
  const tracking = buildTrackingTimeline(row.status, row.created_at, row.payment_method)
  return {
    id: row.id,
    orderNumber: row.order_number,
    total: row.total,
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    customerName: row.customer_name,
    shipping: {
      line1: shipping.line1 ?? '',
      line2: shipping.line2 ?? '',
      city: shipping.city ?? '',
      state: shipping.state ?? '',
      pincode: shipping.pincode ?? '',
    },
    items,
    tracking,
  }
}

router.get('/account/orders', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const email = req.user.email?.trim().toLowerCase()
    const rows = await query(
      `SELECT id, order_number, customer_email, customer_name, customer_phone, total, currency,
              status, payment_method, shipping_json, created_at, updated_at
       FROM orders
       WHERE user_id = :uid OR (user_id IS NULL AND LOWER(customer_email) = :email)
       ORDER BY created_at DESC
       LIMIT 50`,
      { uid: userId, email },
    )

    const itemMap = await itemsForOrders(rows.map((r) => r.id))
    const orders = rows.map((r) => mapOrder(r, itemMap.get(r.id) ?? []))
    const activeCount = orders.filter((o) => isActiveOrderStatus(o.status)).length

    res.json({ ok: true, orders, activeCount })
  } catch (err) {
    next(err)
  }
})

export default router
