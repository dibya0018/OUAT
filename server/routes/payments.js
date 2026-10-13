import { Router } from 'express'
import { query } from '../config/db.js'
import {
  applyCoupon,
  completeRazorpayPayment,
  createCodOrder,
  createRazorpayCheckout,
  validateLineItems,
} from '../lib/checkoutOrders.js'
import { logAdminActivity } from '../lib/adminLog.js'

const router = Router()

/** Public checkout config (no secrets). */
router.get('/payments/config', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT setting_key, setting_value FROM admin_settings
       WHERE setting_key IN ('cod_enabled', 'razorpay_key_id')`,
    )
    const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? '']))
    const keyId = map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || ''
    res.json({
      ok: true,
      codEnabled: map.cod_enabled !== '0',
      razorpayKeyId: keyId,
      razorpayEnabled: Boolean(keyId),
    })
  } catch (err) {
    next(err)
  }
})

/** Coupons marked "Show on website" in the admin, shown as offers on product pages. */
router.get('/payments/offers', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT code, discount_type, discount_value, expires_at FROM coupons
       WHERE is_active = 1 AND show_on_site = 1
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR use_count < max_uses)
       ORDER BY created_at DESC LIMIT 10`,
    )
    res.json({
      ok: true,
      offers: rows.map((r) => ({
        code: r.code,
        discountType: r.discount_type,
        discountValue: r.discount_value,
        expiresAt: r.expires_at,
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/payments/coupon/validate', async (req, res, next) => {
  try {
    const { code, items } = req.body ?? {}
    const { subtotal } = await validateLineItems(items)
    const result = await applyCoupon(code, subtotal)
    res.json({
      ok: true,
      code: result.code,
      discount: result.discount,
      subtotal,
      total: result.total,
    })
  } catch (err) {
    if (err.code?.startsWith('COUPON_') || err.code === 'EMPTY_CART') {
      return res.status(400).json({ ok: false, error: err.message })
    }
    if (err.code === 'PRODUCT_UNAVAILABLE') {
      return res.status(409).json({ ok: false, error: err.message })
    }
    next(err)
  }
})

router.post('/payments/checkout/cod', async (req, res, next) => {
  try {
    const userId = req.user?.userId ?? null
    const result = await createCodOrder(req.body ?? {}, userId)
    res.json({ ok: true, ...result })
  } catch (err) {
    if (err.code === 'COD_DISABLED' || err.code === 'EMPTY_CART' || err.code?.startsWith('COUPON_')) {
      return res.status(400).json({ ok: false, error: err.message })
    }
    if (err.code === 'PRODUCT_UNAVAILABLE') {
      return res.status(409).json({ ok: false, error: err.message })
    }
    next(err)
  }
})

router.post('/payments/checkout/razorpay', async (req, res, next) => {
  try {
    const userId = req.user?.userId ?? null
    const result = await createRazorpayCheckout(req.body ?? {}, userId)
    res.json({ ok: true, ...result })
  } catch (err) {
    if (err.code === 'RAZORPAY_NOT_CONFIGURED') {
      return res.status(503).json({ ok: false, error: err.message })
    }
    if (err.code === 'EMPTY_CART' || err.code?.startsWith('COUPON_')) {
      return res.status(400).json({ ok: false, error: err.message })
    }
    if (err.code === 'PRODUCT_UNAVAILABLE') {
      return res.status(409).json({ ok: false, error: err.message })
    }
    next(err)
  }
})

router.post('/payments/razorpay/verify', async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, signature } = req.body ?? {}
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
      return res.status(400).json({ ok: false, error: 'Missing payment fields' })
    }
    const result = await completeRazorpayPayment({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    })
    if (!result.alreadyPaid) {
      await logAdminActivity(
        `Payment confirmed — order ${result.orderNumber} (₹${result.total})`,
        null,
      )
    }
    res.json({ ok: true, ...result })
  } catch (err) {
    if (err.code === 'PAYMENT_INVALID' || err.code === 'ORDER_NOT_FOUND' || err.code === 'ORDER_MISMATCH') {
      return res.status(400).json({ ok: false, error: err.message })
    }
    next(err)
  }
})

export default router
