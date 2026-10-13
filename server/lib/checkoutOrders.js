import crypto from 'node:crypto'
import { callProcedure, query } from '../config/db.js'
import { createRazorpayOrder, getRazorpayCredentials, verifyRazorpaySignature } from './razorpay.js'

function orderNumber() {
  const n = Date.now().toString(36).toUpperCase()
  const r = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `OUAT-${n}-${r}`
}

/** Whether the checkout email already belongs to an account (decides sign in vs register after a guest order). */
async function emailHasAccount(email) {
  const value = String(email ?? '').trim().toLowerCase()
  if (!value) return false
  const rows = await query('SELECT user_id FROM users WHERE email = :email LIMIT 1', { email: value })
  return rows.length > 0
}

function parseJson(value, fallback) {
  if (value == null) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

/** Size / pack options set in the admin product editor (only ones with a name). */
function packOptionsOf(row) {
  const details = parseJson(row.details_json, {})
  const list = Array.isArray(details?.packOptions) ? details.packOptions : []
  return list.filter((o) => o && String(o.size ?? '').trim()).map((o) => ({ ...o, size: String(o.size).trim() }))
}

/**
 * Move stock for an order's lines: direction -1 takes it out (order placed / paid),
 * +1 puts it back (order cancelled). Option stock lives in the product's details JSON.
 */
async function adjustStock(lines, direction) {
  for (const line of lines) {
    const delta = direction * (Number(line.qty) || 0)
    if (!delta) continue
    if (!line.option) {
      await query(
        'UPDATE products SET available_quantity = GREATEST(0, available_quantity + :delta) WHERE id = :id',
        { delta, id: line.productId },
      )
      continue
    }
    const rows = await query('SELECT details_json FROM products WHERE id = :id LIMIT 1', { id: line.productId })
    if (!rows.length) continue
    const details = parseJson(rows[0].details_json, {}) ?? {}
    if (!Array.isArray(details.packOptions)) continue
    details.packOptions = details.packOptions.map((o) =>
      String(o?.size ?? '').trim() === line.option
        ? { ...o, stock: Math.max(0, (Number(o.stock) || 0) + delta) }
        : o,
    )
    await query('UPDATE products SET details_json = :json WHERE id = :id', {
      json: JSON.stringify(details),
      id: line.productId,
    })
  }
}

/** Take an order's items out of stock once (COD: when placed; Razorpay: when paid). */
export async function deductOrderStock(orderId) {
  const rows = await query('SELECT shipping_json FROM orders WHERE id = :id LIMIT 1', { id: orderId })
  if (!rows.length) return
  const shipping = parseJson(rows[0].shipping_json, {}) ?? {}
  if (shipping.stockDeducted || !Array.isArray(shipping.stockLines)) return
  await adjustStock(shipping.stockLines, -1)
  await query('UPDATE orders SET shipping_json = :json WHERE id = :id', {
    json: JSON.stringify({ ...shipping, stockDeducted: true }),
    id: orderId,
  })
}

/** Put an order's items back into stock when it is cancelled (only if they were taken out). */
export async function restoreOrderStock(orderId) {
  const rows = await query('SELECT shipping_json FROM orders WHERE id = :id LIMIT 1', { id: orderId })
  if (!rows.length) return false
  const shipping = parseJson(rows[0].shipping_json, {}) ?? {}
  if (!shipping.stockDeducted || !Array.isArray(shipping.stockLines)) return false
  await adjustStock(shipping.stockLines, 1)
  await query('UPDATE orders SET shipping_json = :json WHERE id = :id', {
    json: JSON.stringify({ ...shipping, stockDeducted: false }),
    id: orderId,
  })
  return true
}

export async function validateLineItems(items) {
  if (!Array.isArray(items) || !items.length) {
    const err = new Error('Cart is empty')
    err.code = 'EMPTY_CART'
    throw err
  }
  const normalized = []
  const requested = new Map() // product (+ pack option) -> units asked for across all lines (gift + non-gift)
  let subtotal = 0
  for (const line of items) {
    const productId = String(line.productId ?? line.id ?? '')
    const qty = Math.min(99, Math.max(1, Number(line.qty) || 1))
    if (!productId) continue
    const rows = await callProcedure('sp_product_by_id', { p_id: productId })
    if (!rows.length || !rows[0].is_active) {
      const err = new Error(
        `${line.name ? String(line.name).slice(0, 120) : 'An item in your cart'} is no longer available. Please remove it from your cart to continue.`,
      )
      err.code = 'PRODUCT_UNAVAILABLE'
      throw err
    }
    const row = rows[0]

    // A product with size / pack options is priced and stocked per option.
    const options = packOptionsOf(row)
    let option = null
    if (options.length) {
      const wantedSize = String(line.option ?? '').trim()
      option =
        options.find((o) => o.size === wantedSize) ?? (wantedSize ? null : options.find((o) => o.isDefault) ?? options[0])
      if (!option) {
        const err = new Error(`${row.name} (${wantedSize}) is no longer available. Please remove it from your cart to continue.`)
        err.code = 'PRODUCT_UNAVAILABLE'
        throw err
      }
    }
    const label = option ? `${row.name} — ${option.size}` : row.name
    const available = Number(option ? option.stock : row.available_quantity) || 0
    const stockKey = `${row.id}::${option?.size ?? ''}`
    const wanted = (requested.get(stockKey) ?? 0) + qty
    requested.set(stockKey, wanted)
    if (wanted > available) {
      const err = new Error(
        available <= 0
          ? `${label} is sold out. Please remove it from your cart to continue.`
          : `Only ${available} of ${label} left in stock. Please reduce the quantity to continue.`,
      )
      err.code = 'PRODUCT_UNAVAILABLE'
      throw err
    }
    const unitPrice = Number(option ? option.price : row.price)
    normalized.push({
      productId: row.id,
      name: label,
      option: option?.size ?? null,
      qty,
      unitPrice,
      gift: Boolean(line.gift),
    })
    subtotal += unitPrice * qty
  }
  if (!normalized.length) {
    const err = new Error('Cart is empty')
    err.code = 'EMPTY_CART'
    throw err
  }
  return { lines: normalized, subtotal }
}

export async function applyCoupon(code, subtotal) {
  if (!code || !String(code).trim()) return { discount: 0, code: null, total: subtotal }
  const rows = await query(
    `SELECT * FROM coupons WHERE UPPER(code) = UPPER(:code) AND is_active = 1 LIMIT 1`,
    { code: String(code).trim() },
  )
  const c = rows[0]
  if (!c) {
    const err = new Error('Invalid coupon code')
    err.code = 'COUPON_INVALID'
    throw err
  }
  if (c.expires_at && new Date(c.expires_at) < new Date()) {
    const err = new Error('This coupon has expired')
    err.code = 'COUPON_EXPIRED'
    throw err
  }
  if (c.max_uses != null && c.use_count >= c.max_uses) {
    const err = new Error('This coupon has reached its usage limit')
    err.code = 'COUPON_MAX_USES'
    throw err
  }
  let discount = 0
  if (c.discount_type === 'percent') {
    discount = Math.round((subtotal * Number(c.discount_value)) / 100)
  } else {
    discount = Math.min(subtotal, Number(c.discount_value))
  }
  return {
    couponId: c.id,
    code: c.code,
    discount,
    total: Math.max(0, subtotal - discount),
  }
}

async function insertOrderRecord({
  userId,
  customer,
  shipping,
  lines,
  total,
  paymentMethod,
  status,
  razorpayOrderId,
  couponCode,
}) {
  const num = orderNumber()
  const shippingJson = JSON.stringify({
    ...shipping,
    couponCode: couponCode ?? null,
    // Lines the customer ticked "Gift this" on, so the studio knows to wrap them even without a note.
    giftItems: lines.filter((l) => l.gift).map((l) => l.name),
    // What to take out of (and, on cancel, put back into) stock for this order.
    stockLines: lines.map((l) => ({ productId: l.productId, option: l.option ?? null, qty: l.qty })),
    stockDeducted: false,
  })

  const result = await query(
    `INSERT INTO orders (
      order_number, user_id, customer_email, customer_name, customer_phone,
      total, currency, status, payment_method, razorpay_order_id, shipping_json
    ) VALUES (
      :num, :uid, :email, :name, :phone,
      :total, 'INR', :status, :method, :rzOrder, :shipping
    )`,
    {
      num,
      uid: userId || null,
      email: customer.email,
      name: customer.name,
      phone: customer.phone || null,
      total,
      status,
      method: paymentMethod,
      rzOrder: razorpayOrderId || null,
      shipping: shippingJson,
    },
  )

  const orderId = result.insertId
  for (const line of lines) {
    await query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES (:oid, :pid, :name, :qty, :price)`,
      {
        oid: orderId,
        pid: line.productId,
        name: line.name,
        qty: line.qty,
        price: line.unitPrice,
      },
    )
  }
  return { orderId, orderNumber: num }
}

export async function createCodOrder(payload, userId) {
  const { lines, subtotal } = await validateLineItems(payload.items)
  const coupon = await applyCoupon(payload.couponCode, subtotal)
  const rows = await query(`SELECT setting_value FROM admin_settings WHERE setting_key = 'cod_enabled' LIMIT 1`)
  if (rows[0]?.setting_value === '0') {
    const err = new Error('Cash on delivery is not available')
    err.code = 'COD_DISABLED'
    throw err
  }

  const { orderId, orderNumber: num } = await insertOrderRecord({
    userId,
    customer: payload.customer,
    shipping: payload.shipping,
    lines,
    total: coupon.total,
    paymentMethod: 'cod',
    status: 'pending',
    couponCode: coupon.code,
  })
  await deductOrderStock(orderId)

  if (coupon.couponId) {
    await query('UPDATE coupons SET use_count = use_count + 1 WHERE id = :id', { id: coupon.couponId })
  }

  return {
    orderId,
    orderNumber: num,
    total: coupon.total,
    hasAccount: await emailHasAccount(payload.customer?.email),
  }
}

export async function createRazorpayCheckout(payload, userId) {
  const creds = await getRazorpayCredentials()
  if (!creds) {
    const err = new Error('Online payments are not configured yet')
    err.code = 'RAZORPAY_NOT_CONFIGURED'
    throw err
  }

  const { lines, subtotal } = await validateLineItems(payload.items)
  const coupon = await applyCoupon(payload.couponCode, subtotal)
  const total = coupon.total

  const { orderId, orderNumber: num } = await insertOrderRecord({
    userId,
    customer: payload.customer,
    shipping: payload.shipping,
    lines,
    total,
    paymentMethod: 'razorpay',
    status: 'payment_pending',
    couponCode: coupon.code,
  })

  const rz = await createRazorpayOrder({
    amountPaise: Math.round(total * 100),
    receipt: num,
    notes: { orderId: String(orderId) },
  })

  await query('UPDATE orders SET razorpay_order_id = :rz WHERE id = :id', {
    rz: rz.id,
    id: orderId,
  })

  if (coupon.couponId) {
    await query('UPDATE coupons SET use_count = use_count + 1 WHERE id = :id', { id: coupon.couponId })
  }

  return {
    orderId,
    orderNumber: num,
    total,
    hasAccount: await emailHasAccount(payload.customer?.email),
    razorpay: {
      orderId: rz.id,
      amount: rz.amount,
      currency: rz.currency,
      keyId: rz.keyId,
    },
  }
}

export async function completeRazorpayPayment({ orderId, razorpayOrderId, razorpayPaymentId, signature }) {
  const ok = await verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature,
  })
  if (!ok) {
    const err = new Error('Payment verification failed')
    err.code = 'PAYMENT_INVALID'
    throw err
  }

  const rows = await query('SELECT * FROM orders WHERE id = :id LIMIT 1', { id: Number(orderId) })
  const order = rows[0]
  if (!order) {
    const err = new Error('Order not found')
    err.code = 'ORDER_NOT_FOUND'
    throw err
  }
  if (order.razorpay_order_id && order.razorpay_order_id !== razorpayOrderId) {
    const err = new Error('Order mismatch')
    err.code = 'ORDER_MISMATCH'
    throw err
  }

  if (order.razorpay_payment_id) {
    return {
      orderNumber: order.order_number,
      total: order.total,
      status: order.status,
      alreadyPaid: true,
    }
  }

  await query(
    `UPDATE orders SET status = 'completed', razorpay_payment_id = :pid, razorpay_order_id = :oid WHERE id = :id`,
    { pid: razorpayPaymentId, oid: razorpayOrderId, id: order.id },
  )
  await deductOrderStock(order.id)

  return { orderNumber: order.order_number, total: order.total, status: 'completed', alreadyPaid: false }
}
