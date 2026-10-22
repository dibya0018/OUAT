/**
 * Collection URL map — each product type has its own top-level page.
 * Keep in sync with routes in App.jsx and collections in data/products.js.
 */
export const COLLECTION_PATHS = {
  glassware: '/glassware',
  candles: '/candles',
  'kitchen-storage': '/kitchen-storage',
  jewellery: '/jewellery',
}

export const COLLECTION_SLUGS = Object.keys(COLLECTION_PATHS)

export function getCollectionPath(slug) {
  return COLLECTION_PATHS[slug] ?? '/shop'
}

export function isCollectionSlug(slug) {
  return slug in COLLECTION_PATHS
}

/** Shop menu labels, in the order the menu lists them. */
export const SHOP_MENU = [
  { slug: 'candles', label: 'Candles' },
  { slug: 'kitchen-storage', label: 'Kitchenware' },
  { slug: 'glassware', label: 'Glassware' },
  { slug: 'jewellery', label: 'Jewellery' },
]

/** Collections in Shop-menu order, each carrying its short menu `label`. */
export function shopMenuCollections(collections) {
  return SHOP_MENU.map(({ slug, label }) => {
    const c = collections.find((col) => col.slug === slug)
    return c ? { ...c, label } : null
  }).filter(Boolean)
}
