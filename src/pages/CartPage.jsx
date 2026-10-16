import { useCheckout } from '../hooks/useCheckout'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import CartLineItem from '../components/cart/CartLineItem'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/format'
import { trackEvent } from '../lib/analytics'

export default function CartPage() {
  const { lines, count, subtotal, clear } = useCart()
  const { openCheckout } = useCheckout()

  const goToCheckout = () => {
    trackEvent('InitiateCheckout', {
      currency: 'INR',
      value: subtotal,
      num_items: count,
      content_ids: lines.map((l) => l.id),
    })
    openCheckout({ lines, clearCartAfter: true })
  }

  return (
    <>
      <Seo title="Cart" description="Review the pieces in your cart." path="/cart" noIndex />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          <header>
            <p className="eyebrow">Cart</p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
              <EditorialTitle as="h1" size="lg" accent="Your" rest="cart" />
              {count > 0 && (
                <span className="font-sans text-base text-ink-soft">({count})</span>
              )}
            </div>
          </header>

          {lines.length === 0 ? (
            <div className="mt-16 flex flex-col items-start gap-6 border-t border-line pt-16">
              <p className="font-display text-2xl text-primary">Nothing here yet.</p>
              <p className="max-w-md text-sm text-ink-soft">
                Every piece in the studio began as a bottle. Browse the collection and find one to bring home.
              </p>
              <Button to="/shop">Shop the collection</Button>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12">
              {/* Lines */}
              <div className="md:col-span-7">
                <ul className="divide-y divide-line border-y border-line">
                  {lines.map((line) => (
                    <CartLineItem key={line.key} line={line} />
                  ))}
                </ul>
                <div className="mt-6 flex justify-between text-xs">
                  <Button to="/shop" variant="text" className="text-xs">
                    Continue shopping
                  </Button>
                  <button type="button" onClick={clear} className="link-underline text-ink-soft hover:text-primary">
                    Clear cart
                  </button>
                </div>
              </div>

              {/* Summary */}
              <aside className="md:col-span-4 md:col-start-9" aria-labelledby="summary-title">
                <div className="border border-line p-6 md:sticky md:top-28">
                  <h2 id="summary-title" className="font-display text-2xl">
                    Summary
                  </h2>
                  <dl className="mt-6 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-ink-soft">
                      <dt>Shipping</dt>
                      <dd>Calculated at checkout</dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex justify-between border-t border-line pt-4 text-base">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <Button onClick={goToCheckout} fullWidth className="mt-8">
                    Proceed to checkout
                  </Button>
                  <p className="mt-4 text-xs text-ink-soft">
                    Pieces ship from Goa within 3 to 5 working days, packed in recycled card.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
