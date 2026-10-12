import { useContext } from 'react'
import { CheckoutContext } from '../context/checkoutContext'

export function useCheckout() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider')
  return ctx
}
