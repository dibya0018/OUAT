import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import { useCheckout } from '../../hooks/useCheckout'
import { useAuth } from '../../hooks/useAuth'
import { cx, formatPrice } from '../../lib/format'
import { trackEvent } from '../../lib/analytics'
import { loadRazorpayScript } from '../../lib/loadRazorpay'
import {
  checkoutCod,
  checkoutRazorpay,
  getPaymentConfig,
  validateCoupon,
  verifyRazorpayPayment,
} from '../../services/checkoutService'

const STEPS = ['contact', 'pincode', 'address', 'pay']

function itemsPayload(lines) {
  return lines.map((l) => ({
    productId: l.id,
    qty: l.qty,
    gift: Boolean(l.gift),
    option: l.option ?? undefined,
    name: l.name,
  }))
}

async function lookupPincode(pin) {
  if (!/^\d{6}$/.test(pin)) return null
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
    const data = await res.json()
    const po = data?.[0]
    if (po?.Status !== 'Success' || !po.PostOffice?.length) return null
    const office = po.PostOffice[0]
    return {
      city: office.District || office.Name,
      state: office.State,
    }
  } catch {
    return null
  }
}

export default function CheckoutModal() {
  const { open, lines, closeCheckout, onOrderSuccess } = useCheckout()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const ORDERS_PATH = '/account#orders'
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  const [stepIndex, setStepIndex] = useState(0)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [payConfig, setPayConfig] = useState({ codEnabled: true, razorpayEnabled: false })
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [couponInput, setCouponInput] = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponBusy, setCouponBusy] = useState(false)

  const [form, setForm] = useState({
    phone: '',
    pincode: '',
    city: '',
    state: '',
    line1: '',
    line2: '',
    name: '',
    email: '',
    giftNote: '',
  })

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines])
  const discount = couponApplied?.discount ?? 0
  const total = couponApplied?.total ?? subtotal
  const giftNames = lines.filter((l) => l.gift).map((l) => l.name)
  const hasGift = giftNames.length > 0

  const resetFlow = useCallback(() => {
    setStepIndex(0)
    setSummaryOpen(false)
    setError('')
    setCouponInput('')
    setCouponApplied(null)
    setCouponError('')
    setForm({
      phone: user?.phone || '',
      pincode: '',
      city: '',
      state: '',
      line1: '',
      line2: '',
      name: user?.name || '',
      email: user?.email || '',
      giftNote: '',
    })
  }, [user])

  useEffect(() => {
    if (!open) return
    resetFlow()
    getPaymentConfig()
      .then((c) => {
        setPayConfig({
          codEnabled: c.codEnabled !== false,
          razorpayEnabled: Boolean(c.razorpayEnabled),
        })
        setPaymentMethod(c.razorpayEnabled ? 'razorpay' : 'cod')
      })
      .catch(() => {})
    trackEvent('InitiateCheckout', {
      currency: 'INR',
      value: subtotal,
      num_items: lines.reduce((n, l) => n + l.qty, 0),
      content_ids: lines.map((l) => l.id),
    })
  }, [open, resetFlow, subtotal, lines])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) closeCheckout()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, busy, closeCheckout])

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const onPincodeBlur = async () => {
    const info = await lookupPincode(form.pincode.trim())
    if (info) setForm((f) => ({ ...f, city: info.city, state: info.state }))
  }

  const applyCoupon = async () => {
    setError('')
    setCouponError('')
    setCouponBusy(true)
    try {
      const res = await validateCoupon(couponInput.trim(), itemsPayload(lines))
      if (!res.ok) {
        setCouponApplied(null)
        setCouponError(res.error || 'Invalid coupon')
        return
      }
      setCouponApplied(res)
    } catch {
      setCouponApplied(null)
      setCouponError('Could not check this coupon. Please try again.')
    } finally {
      setCouponBusy(false)
    }
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponError('')
    setCouponInput('')
  }

  // Typing a different code drops the one already applied, so the total never shows a stale discount.
  const onCouponInput = (value) => {
    setCouponInput(value.toUpperCase())
    setCouponError('')
    if (couponApplied) setCouponApplied(null)
  }

  const buildPayload = () => ({
    items: itemsPayload(lines),
    couponCode: couponApplied?.code || couponInput.trim() || undefined,
    customer: {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    },
    shipping: {
      pincode: form.pincode.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      giftNote: hasGift ? form.giftNote.trim() : '',
    },
  })

  const finishSuccess = ({ hasAccount = false } = {}) => {
    window.dispatchEvent(new Event('ouat:orders-changed'))
    const email = form.email.trim()
    onOrderSuccess()
    closeCheckout()
    // Guests must register or sign in before they can see order status (no order id in URL/state).
    // An email that already has an account goes to sign in; a new email goes to register.
    if (isAuthenticated) navigate(ORDERS_PATH, { replace: true })
    else {
      navigate(hasAccount ? '/login' : '/register', {
        replace: true,
        state: { from: ORDERS_PATH, postCheckout: true, email },
      })
    }
  }

  const payCod = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await checkoutCod(buildPayload())
      if (!res.ok) throw new Error(res.error || 'Order failed')
      finishSuccess({ hasAccount: res.hasAccount })
    } catch (e) {
      setError(e.message || 'Could not place order')
    } finally {
      setBusy(false)
    }
  }

  const payRazorpay = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await checkoutRazorpay(buildPayload())
      if (!res.ok) throw new Error(res.error || 'Could not start payment')
      const Razorpay = await loadRazorpayScript()
      const { razorpay, orderId, orderNumber } = res
      await new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: razorpay.keyId,
          amount: razorpay.amount,
          currency: razorpay.currency,
          order_id: razorpay.orderId,
          name: 'O.U.A.T.',
          description: `Order ${orderNumber}`,
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone.replace(/\D/g, '').slice(-10),
          },
          theme: { color: '#3d4a3a' },
          handler: async (response) => {
            try {
              const verified = await verifyRazorpayPayment({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              })
              if (!verified.ok) throw new Error(verified.error || 'Verification failed')
              finishSuccess({ hasAccount: res.hasAccount })
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        })
        rzp.on('payment.failed', () => reject(new Error('Payment failed')))
        rzp.open()
      })
    } catch (e) {
      if (e.message !== 'Payment cancelled') setError(e.message || 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  const onPay = () => {
    if (paymentMethod === 'cod') payCod()
    else payRazorpay()
  }

  const step = STEPS[stepIndex]

  const canContinue = () => {
    if (step === 'contact') return /^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))
    if (step === 'pincode') return /^\d{6}$/.test(form.pincode.trim())
    if (step === 'address') {
      return form.name.trim() && form.email.trim() && form.line1.trim() && form.city.trim() && form.state.trim()
    }
    return true
  }

  const goNext = () => {
    if (step === 'contact') {
      const digits = form.phone.replace(/\D/g, '').slice(-10)
      setField('phone', digits)
    }
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1)
  }

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" aria-hidden={false}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close checkout"
        className="absolute inset-0 bg-ink/40"
        onClick={() => !busy && closeCheckout()}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className={cx(
          'relative flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden bg-white shadow-xl',
          'rounded-t-lg sm:rounded-xs',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="checkout-title" className="font-display text-xl">
              Checkout
            </h2>
            <p className="text-xs text-ink-soft">Stay on this page, no redirect.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => !busy && closeCheckout()}
            className="inline-flex h-10 w-10 items-center justify-center text-primary"
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {lines.length > 0 && (
          <div className="border-b border-line px-5 py-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left text-sm"
              onClick={() => setSummaryOpen((o) => !o)}
              aria-expanded={summaryOpen}
            >
              <span>
                Order summary · {lines.reduce((n, l) => n + l.qty, 0)} item
                {lines.reduce((n, l) => n + l.qty, 0) !== 1 ? 's' : ''} · {formatPrice(total)}
              </span>
              <Icon
                name="chevronDown"
                size={16}
                className={cx('transition-transform', summaryOpen && 'rotate-180')}
              />
            </button>
            {summaryOpen && (
              <ul className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
                {lines.map((l) => (
                  <li key={l.key ?? l.id} className="flex justify-between gap-2">
                    <span>
                      {l.name} × {l.qty}
                      {l.gift && <span className="block text-xs text-ink-soft">Gift wrapped</span>}
                    </span>
                    <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
                  </li>
                ))}
                {discount > 0 && (
                  <li className="flex justify-between text-ink-soft">
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {lines.length === 0 ? (
            <p className="text-ink-soft">Your cart is empty.</p>
          ) : (
            <>
              {error && (
                <p className="mb-4 rounded-xs border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                  {error}
                </p>
              )}

              {step === 'contact' && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">Enter your mobile number to continue.</p>
                  <FormField
                    label="Mobile number"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    hint="10-digit Indian mobile"
                  />
                </div>
              )}

              {step === 'pincode' && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">Where should we deliver?</p>
                  <FormField
                    label="PIN code"
                    name="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    value={form.pincode}
                    onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onBlur={onPincodeBlur}
                  />
                </div>
              )}

              {step === 'address' && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">Delivery address &amp; contact</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="City"
                      name="city"
                      required
                      value={form.city}
                      onChange={(e) => setField('city', e.target.value)}
                    />
                    <FormField
                      label="State"
                      name="state"
                      required
                      value={form.state}
                      onChange={(e) => setField('state', e.target.value)}
                    />
                  </div>
                  <FormField
                    label="Flat / house no."
                    name="line1"
                    required
                    value={form.line1}
                    onChange={(e) => setField('line1', e.target.value)}
                  />
                  <FormField
                    label="Area, street, landmark"
                    name="line2"
                    value={form.line2}
                    onChange={(e) => setField('line2', e.target.value)}
                  />
                  <FormField
                    label="Full name"
                    name="name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </div>
              )}

              {step === 'pay' && (
                <div className="space-y-6">
                  <div className="rounded-xs border border-line p-4 text-sm">
                    <p className="font-medium">Deliver to</p>
                    <p className="mt-2 text-ink-soft">
                      {form.name}
                      <br />
                      {form.line1}
                      {form.line2 ? `, ${form.line2}` : ''}
                      <br />
                      {form.city}, {form.state} {form.pincode}
                      <br />
                      +91 {form.phone}
                    </p>
                    <button type="button" className="link-underline mt-2 text-xs" onClick={() => setStepIndex(2)}>
                      Change address
                    </button>
                  </div>

                  {hasGift && (
                    <div className="rounded-xs border border-line p-4">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Icon name="gift" size={16} className="text-primary" /> This order is a gift
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {giftNames.join(', ')} will be wrapped in recycled card. Add the message for our handwritten
                        note (optional).
                      </p>
                      <textarea
                        className="mt-3 w-full border border-line bg-transparent p-3 font-sans text-sm focus:border-primary focus:outline-none"
                        rows={3}
                        maxLength={300}
                        placeholder="Your message"
                        aria-label="Gift message"
                        value={form.giftNote}
                        onChange={(e) => setField('giftNote', e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-soft">Coupon</p>
                    <div className="flex gap-2">
                      <input
                        className="w-full border-b border-line bg-transparent py-3 font-sans text-base focus:border-primary focus:outline-none"
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => onCouponInput(e.target.value)}
                        aria-label="Coupon code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={!couponInput.trim() || couponBusy || Boolean(couponApplied)}
                      >
                        {couponBusy ? 'Checking…' : couponApplied ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                    {couponApplied && (
                      <p
                        className="mt-3 flex items-start justify-between gap-3 rounded-xs border border-primary bg-sand/40 px-3 py-2 text-sm text-ink"
                        role="status"
                      >
                        <span className="flex items-start gap-2">
                          <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary" />
                          <span>
                            Coupon <strong className="font-medium">{couponApplied.code}</strong> applied. You save{' '}
                            {formatPrice(discount)}. New total {formatPrice(total)}.
                          </span>
                        </span>
                        <button type="button" className="link-underline shrink-0 text-xs text-primary" onClick={removeCoupon}>
                          Remove
                        </button>
                      </p>
                    )}
                    {couponError && (
                      <p className="mt-3 text-sm text-red-800" role="alert">
                        {couponError}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-soft">Payment</p>
                    <div className="space-y-2">
                      {payConfig.razorpayEnabled && (
                        <label
                          className={cx(
                            'flex cursor-pointer gap-3 rounded-xs border p-4',
                            paymentMethod === 'razorpay' ? 'border-primary bg-sand/40' : 'border-line',
                          )}
                        >
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'razorpay'}
                            onChange={() => setPaymentMethod('razorpay')}
                            className="mt-1"
                          />
                          <span>
                            <span className="block text-sm font-medium">UPI, cards &amp; net banking</span>
                            <span className="text-xs text-ink-soft">Pay {formatPrice(total)} via Razorpay</span>
                          </span>
                        </label>
                      )}
                      {payConfig.codEnabled && (
                        <label
                          className={cx(
                            'flex cursor-pointer gap-3 rounded-xs border p-4',
                            paymentMethod === 'cod' ? 'border-primary bg-sand/40' : 'border-line',
                          )}
                        >
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="mt-1"
                          />
                          <span>
                            <span className="block text-sm font-medium">Cash on delivery</span>
                            <span className="text-xs text-ink-soft">Pay {formatPrice(total)} when your order arrives</span>
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  <dl className="space-y-2 border-t border-line pt-4">
                    {discount > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-ink-soft">
                          <dt>Subtotal</dt>
                          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between text-sm text-primary">
                          <dt>Discount ({couponApplied.code})</dt>
                          <dd className="tabular-nums">−{formatPrice(discount)}</dd>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-base">
                      <dt>Order total</dt>
                      <dd className="tabular-nums font-medium">{formatPrice(total)}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="flex gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {stepIndex > 0 && step !== 'pay' && (
              <Button type="button" variant="outline" onClick={goBack} disabled={busy}>
                Back
              </Button>
            )}
            {step !== 'pay' ? (
              <Button type="button" className="flex-1" onClick={goNext} disabled={!canContinue() || busy}>
                Continue
              </Button>
            ) : (
              <Button type="button" className="flex-1" onClick={onPay} disabled={busy}>
                {busy ? 'Please wait…' : `Pay ${formatPrice(total)}`}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
