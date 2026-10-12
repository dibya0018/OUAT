import { apiGet, apiPost } from '../lib/api'

export function getPaymentConfig() {
  return apiGet('/payments/config')
}

export function validateCoupon(code, items) {
  return apiPost('/payments/coupon/validate', { code, items })
}

export function checkoutCod(payload) {
  return apiPost('/payments/checkout/cod', payload)
}

export function checkoutRazorpay(payload) {
  return apiPost('/payments/checkout/razorpay', payload)
}

export function verifyRazorpayPayment(body) {
  return apiPost('/payments/razorpay/verify', body)
}
