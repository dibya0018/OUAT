import { Router } from 'express'
import { callProcedure, query } from '../config/db.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { logAdminActivity } from '../lib/adminLog.js'
import { createRazorpayOrder, getRazorpayCredentials, refundRazorpayPayment } from '../lib/razorpay.js'
import { imagesByProductIds, replaceProductImages } from '../lib/productImagesDb.js'
import { deductOrderStock, restoreOrderStock } from '../lib/checkoutOrders.js'

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

function mapAdminProductDetail(row, images = []) {
  const details = jsonField(row.details_json, {})
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    collection: row.collection_slug,
    price: row.price,
    compareAtPrice: details.compareAtPrice ?? null,
    stock: row.available_quantity ?? 0,
    active: Boolean(row.is_active),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    origin: row.origin,
    colour: row.colour,
    shortStory: row.short_story,
    description: row.description,
    details,
    benefits: Array.isArray(details.benefits) ? details.benefits : [],
    packOptions: Array.isArray(details.packOptions) ? details.packOptions : [],
    videoUrl: details.videoUrl ?? '',
    images,
  }
}

const router = Router()
const adminApi = Router()
adminApi.use(requireAdmin)

function mapAdminProduct(row, images = []) {
  const cover = images[0]
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    collection: row.collection_slug,
    price: row.price,
    stock: row.available_quantity ?? 0,
    active: Boolean(row.is_active),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    imageSrc: cover?.src ?? null,
  }
}

async function settingsMap() {
  const rows = await query('SELECT setting_key, setting_value FROM admin_settings')
  const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? '']))
  return map
}

adminApi.get('/dashboard', async (_req, res, next) => {
  try {
    const [rev] = await query(
      `SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status IN ('completed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered')`,
    )
    const [customers] = await query('SELECT COUNT(*) AS n FROM users')
    const [pending] = await query(`SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending', 'payment_pending')`)
    const [completed] = await query(`SELECT COUNT(*) AS n FROM orders WHERE status IN ('completed', 'delivered')`)
    const activity = await query(
      'SELECT message, created_at FROM admin_activity_log ORDER BY created_at DESC LIMIT 12',
    )
    res.json({
      ok: true,
      stats: {
        totalRevenue: Number(rev?.total ?? 0),
        customers: Number(customers?.n ?? 0),
        pendingOrders: Number(pending?.n ?? 0),
        completedOrders: Number(completed?.n ?? 0),
      },
      activity: activity.map((a) => ({
        message: a.message,
        at: a.created_at,
      })),
    })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/visitors', async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 90)
    const byDay = await query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
       FROM page_view_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      { days },
    )
    const totals = await query(
      `SELECT COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors,
              COUNT(DISTINCT path) AS pages
       FROM page_view_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)`,
      { days },
    )
    const topPages = await query(
      `SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
       FROM page_view_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
       GROUP BY path
       ORDER BY views DESC
       LIMIT 15`,
      { days },
    )
    res.json({
      ok: true,
      days,
      totals: {
        pageViews: Number(totals[0]?.views ?? 0),
        uniqueVisitors: Number(totals[0]?.visitors ?? 0),
        pagesVisited: Number(totals[0]?.pages ?? 0),
      },
      byDay,
      topPages,
    })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/products', async (_req, res, next) => {
  try {
    const rows = await callProcedure('sp_products_list', {
      p_collection: '',
      p_featured_only: 0,
      p_search: '',
      p_include_inactive: 1,
      p_id_list: '',
    })
    const imageMap = await imagesByProductIds(rows.map((r) => r.id))
    res.json({
      ok: true,
      products: rows.map((r) => mapAdminProduct(r, imageMap.get(r.id) ?? [])),
    })
  } catch (err) {
    next(err)
  }
})

function slugifyIdPart(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function newProductId(slug) {
  const base = slugifyIdPart(slug)
  if (base) return `p-${base}`.slice(0, 64)
  return `p-${Date.now().toString(36)}`
}

adminApi.post('/products', async (req, res, next) => {
  try {
    const body = req.body ?? {}
    const name = String(body.name ?? '').trim()
    const slug = slugifyIdPart(body.slug || name)
    const collection = String(body.collection ?? '').trim()

    if (!name || !slug || !collection) {
      return res.status(400).json({ ok: false, error: 'name, slug, and collection are required' })
    }

    const [existingSlug] = await query('SELECT id FROM products WHERE slug = :slug LIMIT 1', { slug })
    if (existingSlug) {
      return res.status(409).json({ ok: false, error: 'A product with this slug already exists' })
    }

    const id = newProductId(slug)
    const details = {
      compareAtPrice: body.compareAtPrice != null && body.compareAtPrice !== '' ? Number(body.compareAtPrice) : null,
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      packOptions: Array.isArray(body.packOptions) ? body.packOptions : [],
      videoUrl: body.videoUrl ?? '',
      ...(body.details && typeof body.details === 'object' ? body.details : {}),
    }

    const today = new Date().toISOString().slice(0, 10)

    await callProcedure('sp_product_upsert', {
      p_id: id,
      p_slug: slug,
      p_collection_slug: collection,
      p_name: name,
      p_price: Number(body.price) || 0,
      p_available_quantity: Number(body.stock) || 0,
      p_is_active: body.active ? 1 : 0,
      p_is_new: body.isNew ? 1 : 0,
      p_featured: body.featured ? 1 : 0,
      p_created_at: today,
      p_origin: body.origin ?? '',
      p_colour: body.colour ?? '',
      p_short_story: body.shortStory ?? '',
      p_description: body.description ?? '',
      p_details_json: JSON.stringify(details),
    })

    await logAdminActivity(`Admin created product ${id}`, req.user.userId)
    res.status(201).json({ ok: true, product: { id, slug } })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/products/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const rows = await callProcedure('sp_product_by_id', { p_id: id })
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Not found' })
    const imageMap = await imagesByProductIds([id])
    const reviews = await query(
      'SELECT * FROM product_reviews WHERE product_id = :id ORDER BY created_at DESC LIMIT 50',
      { id },
    )
    const collections = await callProcedure('sp_collections_list')
    res.json({
      ok: true,
      product: mapAdminProductDetail(rows[0], imageMap.get(id) ?? []),
      reviews,
      collections: collections.map((c) => ({ slug: c.slug, name: c.name })),
    })
  } catch (err) {
    next(err)
  }
})

adminApi.patch('/products/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const existing = await callProcedure('sp_product_by_id', { p_id: id })
    if (!existing.length) return res.status(404).json({ ok: false, error: 'Not found' })

    const row = existing[0]
    const body = req.body ?? {}
    const prevDetails = jsonField(row.details_json, {})

    // The upsert procedure leaves slug and collection alone on an existing product, so those are saved here.
    const nextSlug = body.slug != null && String(body.slug).trim() ? slugifyIdPart(body.slug) : row.slug
    const nextCollection =
      body.collection != null && String(body.collection).trim() ? String(body.collection).trim() : row.collection_slug
    if (nextSlug !== row.slug) {
      const [taken] = await query('SELECT id FROM products WHERE slug = :slug AND id <> :id LIMIT 1', {
        slug: nextSlug,
        id,
      })
      if (taken) return res.status(409).json({ ok: false, error: 'Another product already uses this slug.' })
    }
    if (nextCollection !== row.collection_slug) {
      const [known] = await query('SELECT slug FROM collections WHERE slug = :slug LIMIT 1', { slug: nextCollection })
      if (!known) return res.status(400).json({ ok: false, error: 'Unknown collection.' })
    }

    const details = {
      ...prevDetails,
      ...(body.details && typeof body.details === 'object' ? body.details : {}),
    }
    if (body.compareAtPrice !== undefined) {
      details.compareAtPrice = body.compareAtPrice === null ? null : Number(body.compareAtPrice)
    }
    if (body.benefits !== undefined) details.benefits = body.benefits
    if (body.packOptions !== undefined) details.packOptions = body.packOptions
    if (body.videoUrl !== undefined) details.videoUrl = body.videoUrl

    await callProcedure('sp_product_upsert', {
      p_id: id,
      p_slug: nextSlug,
      p_collection_slug: nextCollection,
      p_name: body.name ?? row.name,
      p_price: body.price ?? row.price,
      p_available_quantity: body.stock ?? row.available_quantity,
      p_is_active: body.active != null ? (body.active ? 1 : 0) : row.is_active,
      p_is_new: body.isNew != null ? (body.isNew ? 1 : 0) : row.is_new,
      p_featured: body.featured != null ? (body.featured ? 1 : 0) : row.featured,
      p_created_at: row.created_at,
      p_origin: body.origin ?? row.origin,
      p_colour: body.colour ?? row.colour,
      p_short_story: body.shortStory ?? row.short_story,
      p_description: body.description ?? row.description,
      p_details_json: JSON.stringify(details),
    })

    if (nextSlug !== row.slug || nextCollection !== row.collection_slug) {
      await query('UPDATE products SET slug = :slug, collection_slug = :collection WHERE id = :id', {
        slug: nextSlug,
        collection: nextCollection,
        id,
      })
    }

    if (Array.isArray(body.images)) {
      await replaceProductImages(id, body.images.filter((img) => img?.src))
    }

    await logAdminActivity(`Admin updated product ${id}`, req.user.userId)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.post('/products/:id/reviews', async (req, res, next) => {
  try {
    const productId = req.params.id
    const { authorName, authorEmail, rating, title, body: reviewBody, status } = req.body ?? {}
    if (!authorName || !rating) {
      return res.status(400).json({ ok: false, error: 'authorName and rating required' })
    }
    await query(
      `INSERT INTO product_reviews (product_id, author_name, author_email, rating, body, status)
       VALUES (:pid, :name, :email, :rating, :body, :status)`,
      {
        pid: productId,
        name: String(authorName),
        email: String(authorEmail || 'admin@ouat.in'),
        rating: Math.min(5, Math.max(1, Number(rating))),
        body: [title, reviewBody].filter(Boolean).join('\n\n'),
        status: status === 'pending' ? 'pending' : 'approved',
      },
    )
    await logAdminActivity(`Admin added review for product ${productId}`, req.user.userId)
    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/orders', async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status) : null
    let sql = `SELECT id, order_number, customer_email, customer_name, total, status,
                      payment_method, razorpay_order_id, razorpay_payment_id, created_at
               FROM orders`
    const params = {}
    const where = []
    if (status && status !== 'all') {
      where.push('status = :status')
      params.status = status
    }
    // from / to are instants (ISO strings): from is inclusive, to is exclusive.
    const from = req.query.from ? new Date(String(req.query.from)) : null
    const to = req.query.to ? new Date(String(req.query.to)) : null
    if (from && !Number.isNaN(from.getTime())) {
      where.push('created_at >= :from')
      params.from = from
    }
    if (to && !Number.isNaN(to.getTime())) {
      where.push('created_at < :to')
      params.to = to
    }
    if (where.length) sql += ` WHERE ${where.join(' AND ')}`
    sql += ' ORDER BY created_at DESC LIMIT 200'
    const rows = await query(sql, params)
    res.json({ ok: true, orders: rows })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/orders/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const [order] = await query(
      `SELECT id, order_number, customer_email, customer_name, customer_phone, total, status,
              payment_method, shipping_json, created_at
       FROM orders WHERE id = :id LIMIT 1`,
      { id },
    )
    if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })
    const items = await query(
      'SELECT product_id, product_name, quantity, unit_price FROM order_items WHERE order_id = :id ORDER BY id',
      { id },
    )
    const shipping = jsonField(order.shipping_json, {}) ?? {}
    res.json({
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone ?? '',
        total: order.total,
        status: order.status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        couponCode: shipping.couponCode ?? null,
        giftNote: shipping.giftNote ?? '',
        giftItems: Array.isArray(shipping.giftItems) ? shipping.giftItems : [],
        address: {
          line1: shipping.line1 ?? '',
          line2: shipping.line2 ?? '',
          city: shipping.city ?? '',
          state: shipping.state ?? '',
          pincode: shipping.pincode ?? '',
        },
        items: items.map((i) => ({
          productId: i.product_id,
          name: i.product_name,
          qty: i.quantity,
          unitPrice: i.unit_price,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
})

adminApi.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const status = String(req.body.status ?? '')
    if (!status) return res.status(400).json({ ok: false, error: 'status required' })
    const id = Number(req.params.id)
    const [order] = await query(
      'SELECT status, order_number, payment_method, razorpay_payment_id FROM orders WHERE id = :id LIMIT 1',
      { id },
    )
    if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })

    // Cancelling an order that was paid online sends the money back first;
    // if the refund fails the order is left as it was.
    let refund = null
    if (status === 'cancelled' && order.status !== 'cancelled' && order.razorpay_payment_id) {
      try {
        refund = await refundRazorpayPayment({
          paymentId: order.razorpay_payment_id,
          notes: { orderNumber: order.order_number ?? String(id) },
        })
      } catch (err) {
        return res.status(502).json({ ok: false, error: `Refund failed, order not cancelled: ${err.message}` })
      }
    }

    await query('UPDATE orders SET status = :status WHERE id = :id', { status, id })
    // Cancelling puts the items back into stock; reopening a cancelled order takes them out again.
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await restoreOrderStock(id)
    } else if (order.status === 'cancelled' && status !== 'cancelled') {
      if (order.payment_method === 'cod' || order.razorpay_payment_id) await deductOrderStock(id)
    }
    await logAdminActivity(`Admin updated order #${id} status to ${status}`, req.user.userId)
    if (refund) {
      await logAdminActivity(
        refund.alreadyRefunded
          ? `Order #${id} payment ${order.razorpay_payment_id} was already refunded`
          : `Refunded order #${id} via Razorpay (${refund.id})`,
        req.user.userId,
      )
    }
    res.json({ ok: true, refunded: Boolean(refund), refundId: refund?.id ?? null })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/coupons', async (_req, res, next) => {
  try {
    const rows = await query('SELECT * FROM coupons ORDER BY created_at DESC')
    res.json({ ok: true, coupons: rows })
  } catch (err) {
    next(err)
  }
})

adminApi.post('/coupons', async (req, res, next) => {
  try {
    const { code, discountType, discountValue, expiresAt, maxUses, showOnSite } = req.body ?? {}
    const cleanCode = String(code ?? '').trim().toUpperCase()
    const value = Number(discountValue)
    if (!cleanCode || !Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ ok: false, error: 'Enter a coupon code and a discount value above 0.' })
    }
    if (discountType !== 'fixed' && value > 100) {
      return res.status(400).json({ ok: false, error: 'A percentage discount cannot be more than 100.' })
    }
    const [dupe] = await query('SELECT id FROM coupons WHERE UPPER(code) = :code LIMIT 1', { code: cleanCode })
    if (dupe) return res.status(409).json({ ok: false, error: `Coupon ${cleanCode} already exists.` })
    const expiry = expiresAt ? new Date(expiresAt) : null
    await query(
      `INSERT INTO coupons (code, discount_type, discount_value, expires_at, max_uses, show_on_site)
       VALUES (:code, :type, :value, :expires, :maxUses, :show)`,
      {
        code: cleanCode,
        type: discountType === 'fixed' ? 'fixed' : 'percent',
        value,
        expires: expiry && !Number.isNaN(expiry.getTime()) ? expiry : null,
        maxUses: maxUses ?? null,
        show: showOnSite ? 1 : 0,
      },
    )
    await logAdminActivity(`Admin created coupon ${cleanCode}`, req.user.userId)
    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.patch('/coupons/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const body = req.body ?? {}
    const rows = await query('SELECT * FROM coupons WHERE id = :id LIMIT 1', { id })
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Not found' })
    const row = rows[0]

    const code = body.code != null ? String(body.code).trim().toUpperCase() : row.code
    const discountType =
      body.discountType === 'fixed' ? 'fixed' : body.discountType === 'percent' ? 'percent' : row.discount_type
    const discountValue = body.discountValue != null ? Number(body.discountValue) : row.discount_value
    let expiresAt = row.expires_at
    if ('expiresAt' in body) {
      expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (!code || !Number.isFinite(discountValue) || discountValue <= 0) {
      return res.status(400).json({ ok: false, error: 'Enter a coupon code and a discount value above 0.' })
    }
    if (discountType === 'percent' && discountValue > 100) {
      return res.status(400).json({ ok: false, error: 'A percentage discount cannot be more than 100.' })
    }
    const [dupe] = await query('SELECT id FROM coupons WHERE UPPER(code) = :code AND id <> :id LIMIT 1', { code, id })
    if (dupe) return res.status(409).json({ ok: false, error: `Coupon ${code} already exists.` })
    const maxUses = body.maxUses !== undefined ? body.maxUses : row.max_uses
    const showOnSite = body.showOnSite != null ? (body.showOnSite ? 1 : 0) : row.show_on_site
    const isActive = body.isActive != null ? (body.isActive ? 1 : 0) : row.is_active

    await query(
      `UPDATE coupons SET code = :code, discount_type = :type, discount_value = :value,
       expires_at = :expires, max_uses = :maxUses, show_on_site = :show, is_active = :active
       WHERE id = :id`,
      {
        id,
        code,
        type: discountType,
        value: discountValue,
        expires: expiresAt,
        maxUses,
        show: showOnSite,
        active: isActive,
      },
    )
    await logAdminActivity(`Admin updated coupon ${code}`, req.user.userId)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.delete('/coupons/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM coupons WHERE id = :id', { id: Number(req.params.id) })
    await logAdminActivity(`Admin deleted coupon #${req.params.id}`, req.user.userId)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/reviews', async (req, res, next) => {
  try {
    const status = req.query.status ?? 'pending'
    let sql = `SELECT r.*, p.name AS product_name, p.slug AS product_slug
               FROM product_reviews r LEFT JOIN products p ON p.id = r.product_id`
    const params = {}
    if (status !== 'all') {
      sql += ' WHERE r.status = :status'
      params.status = status
    }
    sql += ' ORDER BY r.created_at DESC LIMIT 100'
    const rows = await query(sql, params)
    res.json({ ok: true, reviews: rows })
  } catch (err) {
    next(err)
  }
})

adminApi.patch('/reviews/:id', async (req, res, next) => {
  try {
    const status = req.body.status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' })
    }
    await query('UPDATE product_reviews SET status = :status WHERE id = :id', {
      status,
      id: Number(req.params.id),
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/team', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT user_id, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 500`,
    )
    res.json({
      ok: true,
      members: rows.map((r) => ({
        userId: r.user_id,
        email: r.email,
        role: r.role ?? 'customer',
        active: Boolean(r.is_active),
        joinedAt: r.created_at,
      })),
    })
  } catch (err) {
    next(err)
  }
})

adminApi.patch('/team/:userId', async (req, res, next) => {
  try {
    const { role, active } = req.body ?? {}
    const self = req.params.userId === req.user.userId
    if (self && ((role != null && role !== 'admin') || active === false)) {
      return res
        .status(400)
        .json({ ok: false, error: 'You cannot remove your own admin access or deactivate your own account.' })
    }
    if (role != null) {
      await query('UPDATE users SET role = :role WHERE user_id = :id', {
        role: role === 'admin' ? 'admin' : 'customer',
        id: req.params.userId,
      })
    }
    if (active != null) {
      await query('UPDATE users SET is_active = :active WHERE user_id = :id', {
        active: active ? 1 : 0,
        id: req.params.userId,
      })
    }
    await logAdminActivity(`Admin updated team member ${req.params.userId}`, req.user.userId)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

adminApi.get('/settings', async (_req, res, next) => {
  try {
    const s = await settingsMap()
    const creds = await getRazorpayCredentials()
    res.json({
      ok: true,
      settings: {
        codEnabled: s.cod_enabled !== '0',
        razorpayKeyId: s.razorpay_key_id || process.env.RAZORPAY_KEY_ID || '',
        razorpayConfigured: Boolean(creds),
      },
    })
  } catch (err) {
    next(err)
  }
})

adminApi.put('/settings', async (req, res, next) => {
  try {
    const { codEnabled, razorpayKeyId, razorpayKeySecret } = req.body ?? {}
    if (codEnabled != null) {
      await query(
        `INSERT INTO admin_settings (setting_key, setting_value) VALUES ('cod_enabled', :v)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        { v: codEnabled ? '1' : '0' },
      )
    }
    if (razorpayKeyId != null) {
      await query(
        `INSERT INTO admin_settings (setting_key, setting_value) VALUES ('razorpay_key_id', :v)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        { v: String(razorpayKeyId) },
      )
    }
    if (razorpayKeySecret != null && String(razorpayKeySecret).trim()) {
      await query(
        `INSERT INTO admin_settings (setting_key, setting_value) VALUES ('razorpay_key_secret', :v)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        { v: String(razorpayKeySecret) },
      )
    }
    await logAdminActivity('Admin updated payment settings', req.user.userId)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

/** Test Razorpay connectivity (creates a ₹1 test order). */
adminApi.post('/settings/razorpay-test', async (_req, res, next) => {
  try {
    const order = await createRazorpayOrder({
      amountPaise: 100,
      receipt: `test_${Date.now()}`,
    })
    res.json({ ok: true, orderId: order.id })
  } catch (err) {
    if (err.code === 'RAZORPAY_NOT_CONFIGURED') {
      return res.status(400).json({ ok: false, error: err.message })
    }
    next(err)
  }
})

router.use('/admin', adminApi)

export default router
