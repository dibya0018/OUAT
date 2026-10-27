/**
 * Add a "• Fragrance: …" line to each candle's Key Features tab, from server/data/product-updates/candle-fragrances.json.
 *   node server/scripts/add-candle-fragrances.js          # preview only
 *   node server/scripts/add-candle-fragrances.js --apply  # write to the DB
 *
 * The line goes right after "• Wick: …", where Bugg Off has it. A candle that already has a Fragrance line
 * is left alone, so the script is safe to run again.
 */
import { readFile } from 'node:fs/promises'
import { query } from '../config/db.js'

const apply = process.argv[2] === '--apply'
const { fragrances } = JSON.parse(await readFile('server/data/product-updates/candle-fragrances.json', 'utf8'))

const slugs = Object.keys(fragrances)
const rows = await query(
  `SELECT id, slug, name, details_json FROM products WHERE slug IN (${slugs.map((_, i) => `:s${i}`).join(', ')})`,
  Object.fromEntries(slugs.map((s, i) => [`s${i}`, s])),
)

const missing = slugs.filter((s) => !rows.some((r) => r.slug === s))
if (missing.length) console.log('Not found in the DB:', missing.join(', '))

let changed = 0
for (const row of rows) {
  const details = typeof row.details_json === 'string' ? JSON.parse(row.details_json) : (row.details_json ?? {})
  const tab = (details.sections ?? []).find((s) => s.title === 'Key Features')
  if (!tab) {
    console.log(`${row.id}  ${row.name}: no Key Features tab, skipped`)
    continue
  }
  const lines = tab.content.split('\n')
  if (lines.some((l) => /^•\s*Fragrance:/.test(l.trim()))) {
    console.log(`${row.id}  ${row.name}: already has a Fragrance line, skipped`)
    continue
  }
  const line = `• Fragrance: ${fragrances[row.slug]}`
  const wick = lines.findIndex((l) => /^•\s*Wick:/.test(l.trim()))
  lines.splice(wick === -1 ? lines.length : wick + 1, 0, line)
  tab.content = lines.join('\n')
  console.log(`${row.id}  ${row.name}: + ${line}`)
  changed++
  if (apply) {
    await query('UPDATE products SET details_json = :details WHERE id = :id', { details: JSON.stringify(details), id: row.id })
  }
}

console.log(apply ? `\nSaved ${changed} candles.` : `\nPreview only (${changed} to change). Re-run with --apply to save.`)
process.exit(0)
