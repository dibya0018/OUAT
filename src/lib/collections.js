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

/** Shorter labels for mobile category chips. */
export function collectionChipLabel(collection) {
  if (collection.slug === 'kitchen-storage') return 'Kitchen'
  return collection.name
}
