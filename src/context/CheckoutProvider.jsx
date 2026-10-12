import { useCallback, useMemo, useState } from 'react'
import { CheckoutContext } from './checkoutContext'
import { useCart } from '../hooks/useCart'

/** @typedef {{ id: string, slug?: string, name: string, price: number, qty: number, gift?: boolean, image?: unknown, key?: string }} CheckoutLine */

export function CheckoutProvider({ children }) {
  const { lines: cartLines, clear: clearCart } = useCart()
  const [session, setSession] = useState({
    open: false,
    /** Lines frozen when checkout opens (buy-now or cart). */
    lines: [],
    clearCartAfter: true,
  })

  /** While checkout is open, use session lines; otherwise expose cart for any readers. */
  const lines = session.open ? session.lines : cartLines

  const openCheckout = useCallback(
    ({ lines: lineOverride, clearCartAfter = true } = {}) => {
      const checkoutLines =
        lineOverride?.length > 0 ? lineOverride : cartLines.length > 0 ? cartLines : []
      setSession({
        open: true,
        lines: checkoutLines,
        clearCartAfter,
      })
    },
    [cartLines],
  )

  const closeCheckout = useCallback(() => {
    setSession((prev) => ({ ...prev, open: false, lines: [] }))
  }, [])

  const onOrderSuccess = useCallback(() => {
    setSession((prev) => {
      if (prev.clearCartAfter) clearCart()
      return { open: false, lines: [], clearCartAfter: true }
    })
  }, [clearCart])

  const value = useMemo(
    () => ({
      open: session.open,
      lines,
      openCheckout,
      closeCheckout,
      onOrderSuccess,
    }),
    [session.open, lines, openCheckout, closeCheckout, onOrderSuccess],
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}
