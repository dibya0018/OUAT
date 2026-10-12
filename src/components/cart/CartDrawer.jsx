import { useEffect, useRef } from 'react'
import { useCheckout } from '../../hooks/useCheckout'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import CartLineItem from './CartLineItem'
import { useCart } from '../../hooks/useCart'
import { formatPrice, cx } from '../../lib/format'
import { trackEvent } from '../../lib/analytics'

/**
 * Slide-in cart panel. Opens automatically after "Add to cart".
 * Focus is moved into the panel on open and restored on close; Escape closes.
 */
export default function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart } = useCart()
  const { openCheckout } = useCheckout()
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') closeCart()
      // Rudimentary focus trap.
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen, closeCart])

  const goToCheckout = () => {
    trackEvent('InitiateCheckout', {
      currency: 'INR',
      value: subtotal,
      num_items: count,
      content_ids: lines.map((l) => l.id),
    })
    closeCart()
    openCheckout({ lines, clearCartAfter: true })
  }

  return (
    <div
      className={cx('fixed inset-0 z-50', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!isOpen}
    >
      {/* Scrim */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close cart"
        onClick={closeCart}
        className={cx(
          'absolute inset-0 bg-ink/30 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cx(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white transition-transform duration-300 ease-[var(--ease-out-soft)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="cart-drawer-title" className="font-display text-2xl">
            Your cart{count > 0 && <span className="ml-2 font-sans text-sm text-ink-soft">({count})</span>}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            className="inline-flex h-10 w-10 items-center justify-center text-primary"
            aria-label="Close cart"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
            <p className="font-display text-2xl text-primary">Your cart is empty.</p>
            <p className="text-sm text-ink-soft">Every piece begins as a bottle. Find yours.</p>
            <Button to="/shop" variant="outline" onClick={closeCart}>
              Shop the collection
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((line) => (
                <CartLineItem key={line.key} line={line} compact onNavigate={closeCart} />
              ))}
            </ul>
            <div className="border-t border-line px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Shipping calculated at checkout.</p>
              <div className="mt-6 flex flex-col gap-3">
                <Button onClick={goToCheckout} fullWidth>
                  Checkout
                </Button>
                <Button to="/cart" variant="outline" onClick={closeCart} fullWidth>
                  View cart
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
