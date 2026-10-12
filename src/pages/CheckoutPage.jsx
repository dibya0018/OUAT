import { useEffect } from 'react'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { useCart } from '../hooks/useCart'
import { useCheckout } from '../hooks/useCheckout'

/** Opens the on-page checkout modal; no separate checkout UI. */
export default function CheckoutPage() {
  const { lines } = useCart()
  const { open, openCheckout } = useCheckout()

  useEffect(() => {
    if (lines.length && !open) {
      openCheckout({ lines, clearCartAfter: true })
    }
  }, [lines, open, openCheckout])

  return (
    <>
      <Seo title="Checkout" description="Complete your order." path="/checkout" noIndex />
      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          {lines.length === 0 ? (
            <div className="flex flex-col items-start gap-6">
              <p className="font-display text-2xl text-primary">Your cart is empty.</p>
              <Button to="/shop">Shop the collection</Button>
            </div>
          ) : (
            <p className="text-ink-soft">Complete your order in the checkout window.</p>
          )}
        </Container>
      </section>
    </>
  )
}
