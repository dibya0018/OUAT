import { createContext } from 'react'

/**
 * Cart context object. Provided by <CartProvider> (CartProvider.jsx) and
 * consumed via the useCart hook (hooks/useCart.js).
 */
export const CartContext = createContext(null)
