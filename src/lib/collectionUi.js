/** Collection pages sit under the fixed header (Layout skips its own top padding for them). */
export const HEADER_PAD = 'pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-20'

/** Sticky bars on collection pages stop just below the fixed header. */
export const BELOW_HEADER = 'top-[calc(3.5rem+env(safe-area-inset-top,0px))] md:top-20'

const LOW_STOCK_AT = 5

/** 'in' | 'low' | 'out'. Unknown quantity (mock catalogue) counts as in stock. */
export function stockState(product) {
  const qty = product?.availableQuantity
  if (qty == null) return 'in'
  if (qty <= 0) return 'out'
  return qty <= LOW_STOCK_AT ? 'low' : 'in'
}

/** Hero headline per collection, used when the catalogue has none set. */
export const HERO_TITLES = {
  glassware: ['Every pour', 'tells a story.'],
  candles: ['Light the evening,', 'keep the glass.'],
  'kitchen-storage': ['Everyday rituals,', 'considered vessels.'],
  jewellery: ['The coast inspires,', 'sea glass adorns.'],
}
