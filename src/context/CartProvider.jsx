import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { CartContext } from './cartContext'
import { trackEvent } from '../lib/analytics'
import { buildCheckoutLine } from '../lib/checkoutLine'
import { apiGet } from '../lib/api'

const STORAGE_KEY = 'ouat.cart.v1'

/** Cart line shape: { id, slug, name, price, image, qty, gift } */
function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item, qty } = action
      const existing = state.find((line) => line.key === item.key)
      if (existing) {
        return state.map((line) =>
          line === existing ? { ...line, qty: Math.min(99, line.qty + qty) } : line,
        )
      }
      return [...state, { ...item, qty }]
    }
    case 'setQty': {
      if (action.qty <= 0) return state.filter((line) => line.key !== action.key)
      return state.map((line) => (line.key === action.key ? { ...line, qty: Math.min(99, action.qty) } : line))
    }
    case 'remove':
      return state.filter((line) => line.key !== action.key)
    case 'clear':
      return []
    default:
      return state
  }
}

function loadInitial() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, loadInitial)
  const [isOpen, setIsOpen] = useState(false)

  // Persist to localStorage on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* storage unavailable (private mode, quota) — cart stays in memory */
    }
  }, [lines])

  // Drop saved lines whose product has since been archived or deleted. The shop API only
  // returns live products, so anything missing from the answer is no longer for sale.
  // If the API can't be reached, the cart is left as it is.
  useEffect(() => {
    const ids = [...new Set(lines.map((line) => line.id).filter(Boolean))]
    if (!ids.length) return
    let alive = true
    apiGet(`/products?ids=${ids.map(encodeURIComponent).join(',')}`)
      .then((live) => {
        if (!alive || !Array.isArray(live)) return
        const liveIds = new Set(live.map((p) => String(p.id)))
        for (const line of lines) {
          if (line.id && !liveIds.has(String(line.id))) dispatch({ type: 'remove', key: line.key })
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
    // Only on first load: lines added later come from live product pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addItem = useCallback((product, { qty = 1, gift = false, open = true, option } = {}) => {
    const item = buildCheckoutLine(product, { qty: 1, gift, option })
    dispatch({ type: 'add', item, qty })
    trackEvent('AddToCart', {
      currency: 'INR',
      value: item.price * qty,
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      items: [{ item_id: product.id, item_name: item.name, price: item.price, quantity: qty }],
    })
    if (open) setIsOpen(true)
  }, [])

  const setQty = useCallback((key, qty) => dispatch({ type: 'setQty', key, qty }), [])
  const removeItem = useCallback((key) => dispatch({ type: 'remove', key }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0)
    const subtotal = lines.reduce((sum, line) => sum + line.qty * line.price, 0)
    return { lines, count, subtotal, addItem, setQty, removeItem, clear, isOpen, openCart, closeCart }
  }, [lines, addItem, setQty, removeItem, clear, isOpen, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
