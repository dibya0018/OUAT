import { Router } from 'express'
import { callProcedure } from '../config/db.js'
import { imagesByProductIds } from '../lib/productImagesDb.js'

const router = Router()

const SORT_WHITELIST = new Set(['featured', 'newest', 'price-asc', 'price-desc'])

function jsonField(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return value
}

function mapProduct(row, images = []) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    collection: row.collection_slug,
    price: row.price,
    availableQuantity: row.available_quantity ?? 0,
    active: row.is_active == null ? true : Boolean(row.is_active),
    isNew: Boolean(row.is_new),
    featured: Boolean(row.featured),
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : null,
    origin: row.origin,
    colour: row.colour,
    shortStory: row.short_story,
    description: row.description,
    details: jsonField(row.details_json, {}),
    images,
  }
}

function mapCollection(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    heroTitleAccent: row.hero_title_accent,
    heroTitleRest: row.hero_title_rest,
    audienceLine: row.audience_line,
    image: jsonField(row.image_json, { src: null, alt: '', tone: 'sand' }),
  }
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

function parseIds(raw) {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseListQuery(query, { collectionOverride } = {}) {
  const collection =
    collectionOverride ?? (query.collection ? String(query.collection) : null)
  const sort = SORT_WHITELIST.has(query.sort) ? query.sort : 'featured'
  const featuredOnly = query.featured === '1' || query.featured === 'true'
  const search = query.q ? String(query.q).trim() : ''
  const idList = parseIds(query.ids ?? query.id)
  const limit = Math.min(Math.max(Number(query.limit) || 0, 0), 100)
  const includeInactive = query.includeInactive === '1'
  return { collection, sort, featuredOnly, search, idList, limit, includeInactive }
}

async function productsWithImages(rows) {
  const imageMap = await imagesByProductIds(rows.map((r) => r.id))
  return rows.map((row) => mapProduct(row, imageMap.get(row.id) ?? []))
}

async function fetchProductList(options) {
  const { collection, sort, featuredOnly, search, idList, limit, includeInactive } = options
  const rows = await callProcedure('sp_products_list', {
    p_collection: collection ?? '',
    p_featured_only: featuredOnly ? 1 : 0,
    p_search: search,
    p_include_inactive: includeInactive ? 1 : 0,
    p_id_list: idList.length ? idList.join(',') : '',
  })

  let list = sortProducts(await productsWithImages(rows), sort)
  if (limit > 0) list = list.slice(0, limit)
  return list
}

async function fetchProductById(id, { includeInactive = false } = {}) {
  const rows = await callProcedure('sp_product_by_id', { p_id: id })
  if (!rows.length) return null
  const [product] = await productsWithImages(rows)
  if (!product.active && !includeInactive) return null
  return product
}

router.get('/products', async (req, res, next) => {
  try {
    const list = await fetchProductList(parseListQuery(req.query))
    res.json(list)
  } catch (err) {
    next(err)
  }
})

router.get('/products/by-id/:id', async (req, res, next) => {
  try {
    const product = await fetchProductById(req.params.id, {
      includeInactive: req.query.includeInactive === '1',
    })
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
  } catch (err) {
    next(err)
  }
})

router.get('/products/:slug', async (req, res, next) => {
  try {
    const rows = await callProcedure('sp_product_by_slug', { p_slug: req.params.slug })
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    const [product] = await productsWithImages(rows)
    if (!product.active && req.query.includeInactive !== '1') {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json(product)
  } catch (err) {
    next(err)
  }
})

router.get('/collections', async (_req, res, next) => {
  try {
    const rows = await callProcedure('sp_collections_list')
    res.json(rows.map(mapCollection))
  } catch (err) {
    next(err)
  }
})

router.get('/collections/:slug/products', async (req, res, next) => {
  try {
    const slug = String(req.params.slug)
    const colRows = await callProcedure('sp_collection_by_slug', { p_slug: slug })
    if (!colRows.length) return res.status(404).json({ error: 'Not found' })

    const list = await fetchProductList(parseListQuery(req.query, { collectionOverride: slug }))
    res.json(list)
  } catch (err) {
    next(err)
  }
})

router.get('/collections/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug)
    const rows = await callProcedure('sp_collection_by_slug', { p_slug: slug })
    if (!rows.length) return res.status(404).json({ error: 'Not found' })

    const collection = mapCollection(rows[0])
    const withProducts = req.query.products === '1' || req.query.products === 'true'
    if (!withProducts) return res.json(collection)

    const products = await fetchProductList(parseListQuery(req.query, { collectionOverride: slug }))
    res.json({ ...collection, products })
  } catch (err) {
    next(err)
  }
})

export default router
