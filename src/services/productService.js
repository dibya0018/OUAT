/**
 * Product service — catalogue from API with mock fallback.
 */
import { collections, products as mockProducts } from '../data/products'
import { apiGet, apiPost } from '../lib/api'

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

function catalogMode() {
  const mode = import.meta.env.VITE_CATALOG_SOURCE ?? 'auto'
  return mode === 'mock' || mode === 'api' || mode === 'auto' ? mode : 'auto'
}

function sortProducts(list, sort) {
  const copy = [...list]
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'featured':
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured))
  }
}

function filterMockProducts({ collection, featured, q, ids } = {}) {
  let list = collection ? mockProducts.filter((p) => p.collection === collection) : [...mockProducts]
  if (ids?.length) list = list.filter((p) => ids.includes(p.id))
  if (featured) list = list.filter((p) => p.featured)
  if (q) {
    const needle = q.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.shortStory?.toLowerCase().includes(needle) ||
        p.description?.toLowerCase().includes(needle),
    )
  }
  return list
}

function buildProductsQuery({ collection, sort, featured, ids, limit, q } = {}) {
  const params = new URLSearchParams()
  if (collection) params.set('collection', collection)
  if (sort) params.set('sort', sort)
  if (featured) params.set('featured', '1')
  if (ids?.length) params.set('ids', ids.join(','))
  if (limit) params.set('limit', String(limit))
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `/products?${qs}` : '/products'
}

function buildCollectionProductsQuery({ sort, featured, ids, limit, q } = {}) {
  const params = new URLSearchParams()
  if (sort) params.set('sort', sort)
  if (featured) params.set('featured', '1')
  if (ids?.length) params.set('ids', ids.join(','))
  if (limit) params.set('limit', String(limit))
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function fetchProductsFromApi(options = {}) {
  const path = buildProductsQuery(options)
  const list = await apiGet(path)
  return Array.isArray(list) ? list : null
}

async function fetchCollectionProductsFromApi(collectionSlug, options = {}) {
  const path = `/collections/${encodeURIComponent(collectionSlug)}/products${buildCollectionProductsQuery(options)}`
  const list = await apiGet(path)
  return Array.isArray(list) ? list : null
}

async function withCatalog(apiFn, mockFn) {
  const mode = catalogMode()
  if (mode === 'mock') {
    await delay()
    return mockFn()
  }
  try {
    const data = await apiFn()
    if (mode === 'api') return data ?? mockFn()
    if (Array.isArray(data) && data.length === 0) return mockFn()
    return data ?? mockFn()
  } catch {
    await delay()
    return mockFn()
  }
}

/**
 * All-shop listing (no collection filter). Prefer getCollectionProducts on category pages.
 */
export async function getProducts({ collection, sort = 'featured', featured, q, limit, ids } = {}) {
  if (collection) {
    return getCollectionProducts(collection, { sort, featured, q, limit, ids })
  }
  return withCatalog(
    () => fetchProductsFromApi({ sort, featured, q, limit, ids }),
    () => {
      let list = filterMockProducts({ featured, q, ids })
      list = sortProducts(list, sort)
      if (limit) list = list.slice(0, limit)
      return list
    },
  )
}

/** Products for one collection only — server filters by collection slug. */
export async function getCollectionProducts(collectionSlug, { sort = 'featured', featured, q, limit, ids } = {}) {
  if (!collectionSlug) return []
  return withCatalog(
    () => fetchCollectionProductsFromApi(collectionSlug, { sort, featured, q, limit, ids }),
    () => {
      let list = filterMockProducts({ collection: collectionSlug, featured, q, ids })
      list = sortProducts(list, sort)
      if (limit) list = list.slice(0, limit)
      return list
    },
  )
}

export async function getProductById(id) {
  if (!id) return null
  return withCatalog(
    async () => {
      try {
        return await apiGet(`/products/by-id/${encodeURIComponent(id)}`)
      } catch {
        return null
      }
    },
    () => mockProducts.find((p) => p.id === id) ?? null,
  )
}

export async function getProductBySlug(slug) {
  return withCatalog(
    async () => {
      try {
        return await apiGet(`/products/${encodeURIComponent(slug)}`)
      } catch {
        return null
      }
    },
    () => mockProducts.find((p) => p.slug === slug) ?? null,
  )
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ sort: 'featured', featured: true, limit })
}

export async function getRelatedProducts(product, limit = 4) {
  const inCollection = await getCollectionProducts(product.collection, {
    sort: 'featured',
    limit: limit + 8,
  })
  return inCollection.filter((p) => p.id !== product.id).slice(0, limit)
}

export async function getCollections() {
  return withCatalog(
    () => apiGet('/collections'),
    () => collections,
  )
}

/**
 * @param {string} slug
 * @param {{ products?: boolean, sort?: string, featured?: boolean, q?: string, limit?: number }} [options]
 *   When products is true, returns collection metadata plus a products array (one request).
 */
export async function getCollectionBySlug(slug, { products, sort = 'featured', featured, q, limit } = {}) {
  const query = new URLSearchParams()
  if (products) query.set('products', '1')
  if (sort) query.set('sort', sort)
  if (featured) query.set('featured', '1')
  if (q) query.set('q', q)
  if (limit) query.set('limit', String(limit))
  const qs = query.toString()
  const path = `/collections/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`

  return withCatalog(
    async () => {
      try {
        return await apiGet(path)
      } catch {
        return null
      }
    },
    () => {
      const collection = collections.find((c) => c.slug === slug) ?? null
      if (!collection || !products) return collection
      let list = filterMockProducts({ collection: slug, featured, q })
      list = sortProducts(list, sort)
      if (limit) list = list.slice(0, limit)
      return { ...collection, products: list }
    },
  )
}

export async function getProductsByIds(ids) {
  if (!ids?.length) return []
  if (ids.length === 1) {
    const one = await getProductById(ids[0])
    return one ? [one] : []
  }
  return withCatalog(
    () => fetchProductsFromApi({ ids }),
    () => mockProducts.filter((p) => ids.includes(p.id)),
  )
}

/** Approved reviews for a product: { count, average, reviews }. Empty when the API is unavailable. */
export async function getProductReviews(productId) {
  const empty = { count: 0, average: 0, reviews: [] }
  if (!productId || catalogMode() === 'mock') return empty
  try {
    const res = await apiGet(`/products/${encodeURIComponent(productId)}/reviews`)
    return { count: res.count ?? 0, average: res.average ?? 0, reviews: res.reviews ?? [] }
  } catch {
    return empty
  }
}

/** Submit a customer review; it appears on the site once approved in the admin. */
export function submitProductReview(productId, values) {
  return apiPost(`/products/${encodeURIComponent(productId)}/reviews`, values)
}

/** Coupons the admin has marked "Show on website". Empty when the API is unavailable. */
export async function getOffers() {
  if (catalogMode() === 'mock') return []
  try {
    const res = await apiGet('/payments/offers')
    return res.offers ?? []
  } catch {
    return []
  }
}
