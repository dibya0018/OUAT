const TRACK_STEPS = [
  { key: 'confirmed', label: 'Order confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
]

/**
 * Map DB order status → index of the step currently in progress (0–4).
 * Steps before it are done; 5 means every step is done (delivered).
 * Note `completed` means "paid", not delivered — the order still has to be packed.
 */
export function trackingStepIndex(status) {
  switch (status) {
    case 'payment_pending':
    case 'pending':
      return 0
    case 'completed':
    case 'processing':
      return 1
    case 'packed':
      return 2
    case 'shipped':
      return 3
    case 'out_for_delivery':
      return 4
    case 'delivered':
      return TRACK_STEPS.length
    case 'cancelled':
      return -1
    default:
      return 0
  }
}

export function trackingHeadline(status) {
  if (status === 'cancelled') return 'Order cancelled'
  if (status === 'payment_pending') return 'Awaiting payment'
  if (status === 'pending') return 'Order placed'
  if (status === 'completed') return 'Order confirmed'
  if (status === 'processing') return 'Preparing your order'
  if (status === 'packed') return 'Packed'
  if (status === 'shipped') return 'Shipped'
  if (status === 'out_for_delivery') return 'Out for delivery'
  if (status === 'delivered') return 'Delivered'
  return 'Order update'
}

export function trackingDetail(status, paymentMethod) {
  if (status === 'cancelled') {
    return 'This order was cancelled. If you paid online, your refund will reach your account in 5–7 working days. Contact us if you need help.'
  }
  if (status === 'payment_pending') {
    return 'Complete payment to start preparing your shipment.'
  }
  if (status === 'pending') {
    return paymentMethod === 'cod'
      ? 'We will confirm your cash on delivery order shortly.'
      : 'Your order is confirmed and will be packed soon.'
  }
  if (status === 'completed') return 'Payment received. Your order is confirmed and will be packed soon.'
  if (status === 'processing') return 'Your pieces are being packed and will ship soon.'
  if (status === 'packed') return 'Your order is packed and waiting for the courier.'
  if (status === 'shipped') return 'Your order is on its way.'
  if (status === 'out_for_delivery') return 'Your order is out for delivery and should reach you today.'
  if (status === 'delivered') return 'Your order has been delivered. Thank you for shopping with us.'
  return 'We will update tracking as your order moves.'
}

export function buildTrackingTimeline(status, createdAt, paymentMethod = '') {
  const active = trackingStepIndex(status)
  const cancelled = status === 'cancelled'
  const created = createdAt ? new Date(createdAt) : new Date()

  const steps = TRACK_STEPS.map((step, i) => {
    let state = 'upcoming'
    if (cancelled) state = i === 0 ? 'done' : 'upcoming'
    else if (i < active) state = 'done'
    else if (i === active) state = 'current'
    return {
      ...step,
      state,
      at: i === 0 && (state === 'done' || state === 'current') ? created.toISOString() : null,
    }
  })

  const est = new Date(created)
  est.setDate(est.getDate() + 5)
  const estDelivery = cancelled ? null : est.toISOString()

  return {
    steps,
    headline: trackingHeadline(status),
    detail: trackingDetail(status, paymentMethod),
    estDelivery,
    activeStep: active,
    cancelled,
  }
}

export function isActiveOrderStatus(status) {
  return !['delivered', 'cancelled'].includes(status)
}
