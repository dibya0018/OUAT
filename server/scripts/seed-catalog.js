import 'dotenv/config'
import { collections, products } from '../data/catalogSeed.js'
import { callProcedure } from '../config/db.js'
import { collectionImageBase64, productImagesBase64 } from '../lib/catalogImages.js'
import { replaceProductImages } from '../lib/productImagesDb.js'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function syncPublicImages() {
  const script = path.join(__dirname, 'sync-catalog-images.js')
  spawnSync(process.execPath, [script], { stdio: 'inherit' })
}

async function seedCollections() {
  for (const c of collections) {
    await callProcedure('sp_collection_upsert', {
      p_id: c.id,
      p_slug: c.slug,
      p_name: c.name,
      p_tagline: c.tagline,
      p_description: c.description,
      p_hero_title_accent: c.heroTitleAccent ?? null,
      p_hero_title_rest: c.heroTitleRest ?? null,
      p_audience_line: c.audienceLine ?? null,
      p_image_json: JSON.stringify(collectionImageBase64(c.slug, c.name)),
      p_sort_order: c.sortOrder ?? 0,
    })
  }
}

async function seedProducts() {
  for (const p of products) {
    const availableQuantity = p.availableQuantity ?? 24
    const isActive = p.active !== false ? 1 : 0

    await callProcedure('sp_product_upsert', {
      p_id: p.id,
      p_slug: p.slug,
      p_collection_slug: p.collection,
      p_name: p.name,
      p_price: p.price,
      p_available_quantity: availableQuantity,
      p_is_active: isActive,
      p_is_new: p.isNew ? 1 : 0,
      p_featured: p.featured ? 1 : 0,
      p_created_at: p.createdAt,
      p_origin: p.origin,
      p_colour: p.colour,
      p_short_story: p.shortStory,
      p_description: p.description,
      p_details_json: JSON.stringify(p.details),
    })

    await replaceProductImages(p.id, productImagesBase64(p))
  }
}

async function main() {
  syncPublicImages()
  await seedCollections()
  await seedProducts()
  const [counts] = await callProcedure('sp_catalog_counts')
  console.info(`Catalog seeded. Products: ${counts.product_count}, images: ${counts.image_count}`)
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
