/**
 * Apply copy changes for one product from a JSON file in server/data/product-updates/.
 *   node server/scripts/update-product.js server/data/product-updates/bugg-off.json          # preview only
 *   node server/scripts/update-product.js server/data/product-updates/bugg-off.json --apply  # write to the DB
 *
 * The file's `id` (or, failing that, `match` on the name) finds exactly one product. `name`, `price`, `shortStory` and `description`
 * replace the current values when present; `details` keys are merged into details_json (so `sections`
 * replaces the product's tabs and everything else in details_json is kept).
 */
import { readFile } from 'node:fs/promises'
import { query } from '../config/db.js'

const [file, flag] = process.argv.slice(2)
if (!file) {
  console.error('Usage: node server/scripts/update-product.js <update.json> [--apply]')
  process.exit(1)
}
const apply = flag === '--apply'
const update = JSON.parse(await readFile(file, 'utf8'))

const rows = update.id
  ? await query('SELECT * FROM products WHERE id = :id', { id: update.id })
  : await query('SELECT * FROM products WHERE name LIKE :match', { match: `%${update.match}%` })
if (rows.length !== 1) {
  console.error(`Expected exactly one product matching "${update.id ?? update.match}", found ${rows.length}:`)
  for (const r of rows) console.error(`  ${r.id}  ${r.name}`)
  process.exit(1)
}

const row = rows[0]
const prevDetails = typeof row.details_json === 'string' ? JSON.parse(row.details_json) : (row.details_json ?? {})
const next = {
  name: update.name ?? row.name,
  price: update.price ?? row.price,
  short_story: update.shortStory ?? row.short_story,
  description: update.description ?? row.description,
  details_json: { ...prevDetails, ...(update.details ?? {}) },
}

console.log(`Product ${row.id} (/product/${row.slug})`)
for (const key of ['name', 'price', 'short_story', 'description']) {
  if (String(row[key]) !== String(next[key])) console.log(`\n${key}:\n  before: ${row[key]}\n  after:  ${next[key]}`)
}
console.log('\ntabs before:', (prevDetails.sections ?? []).map((s) => s.title).join(', ') || '(none, default tabs)')
console.log('tabs after: ', (next.details_json.sections ?? []).map((s) => s.title).join(', ') || '(none, default tabs)')

if (!apply) {
  console.log('\nPreview only. Re-run with --apply to save.')
  process.exit(0)
}

await query(
  `UPDATE products
      SET name = :name, price = :price, short_story = :short_story, description = :description, details_json = :details_json
    WHERE id = :id`,
  { ...next, details_json: JSON.stringify(next.details_json), id: row.id },
)
console.log('\nSaved.')
process.exit(0)
