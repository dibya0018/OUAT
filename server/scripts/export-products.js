/**
 * Read-only: save one collection's products (name, price, copy, details_json) to a JSON file.
 *   node server/scripts/export-products.js candles
 * Writes server/data/product-updates/_export-<collection>.json
 */
import { writeFile } from 'node:fs/promises'
import { query } from '../config/db.js'

const collection = process.argv[2]
if (!collection) {
  console.error('Usage: node server/scripts/export-products.js <collection-slug>')
  process.exit(1)
}

const rows = await query(
  `SELECT id, slug, name, price, is_active, short_story, description, details_json
     FROM products WHERE collection_slug = :collection ORDER BY name`,
  { collection },
)
const out = rows.map((r) => ({
  ...r,
  details_json: typeof r.details_json === 'string' ? JSON.parse(r.details_json) : r.details_json,
}))
const file = `server/data/product-updates/_export-${collection}.json`
await writeFile(file, JSON.stringify(out, null, 2) + '\n')
console.log(`Saved ${out.length} products to ${file}`)
process.exit(0)
