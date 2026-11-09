/**
 * Put the candles back after `npm run db:seed` overwrote them (found 2026-11-09).
 *   node server/scripts/restore-candles.js          # preview only
 *   node server/scripts/restore-candles.js --apply  # write to the DB
 *
 * For every candle in server/data/product-updates/_export-candles.json (the 22 Oct snapshot) whose
 * live row still matches the seed data:
 *   - name, short story and description come back from the snapshot, and the price too while it is
 *     still the seed's (later Admin prices and the active flag are kept);
 *   - details_json gets the snapshot's details, then the shared Bugg Off layout ("Key Features",
 *     "Candle Care", "A Note on Uniqueness", as apply-candle-layout.js builds it);
 *   - the candle's "• Fragrance: …" line from candle-fragrances.json goes after "• Wick: …".
 * Stock, images and anything else in details_json stay as they are now.
 */
import { readFile } from 'node:fs/promises'
import { query } from '../config/db.js'
import { products as seedProducts } from '../data/catalogSeed.js'

const apply = process.argv[2] === '--apply'
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))
const snapshot = await readJson('server/data/product-updates/_export-candles.json')
const buggOff = await readJson('server/data/product-updates/bugg-off.json')
const { fragrances } = await readJson('server/data/product-updates/candle-fragrances.json')

const seedById = new Map(seedProducts.map((p) => [p.id, p]))
const isFragranceLine = (line) => /^•\s*Fragrance:/.test(line.trim())

/** The shared candle tabs, with this candle's fragrance line (if any) after the wick line. */
function layoutFor(slug) {
  const fragrance = fragrances[slug]
  const sections = buggOff.details.sections.map((s) => {
    if (s.title !== 'Key Features') return s
    const lines = s.content.split('\n').filter((l) => !isFragranceLine(l))
    if (fragrance) {
      const wick = lines.findIndex((l) => /^•\s*Wick:/.test(l.trim()))
      lines.splice(wick === -1 ? lines.length : wick + 1, 0, `• Fragrance: ${fragrance}`)
    }
    return { ...s, content: lines.join('\n') }
  })
  const note =
    slug === 'bugg-off'
      ? buggOff.details.note
      : { ...buggOff.details.note, content: buggOff.details.note.content.split('\n')[0] } // drop "two designs" line
  return { sections, note }
}

let changed = 0
for (const snap of snapshot) {
  const [row] = await query('SELECT * FROM products WHERE id = :id', { id: snap.id })
  if (!row) {
    console.log(`${snap.id}  ${snap.name}: not in the DB, skipped`)
    continue
  }
  const seed = seedById.get(snap.id)
  if (!seed || seed.description !== row.description) {
    console.log(`${snap.id}  ${row.name}: not overwritten by the seed, left alone`)
    continue
  }

  const current = typeof row.details_json === 'string' ? JSON.parse(row.details_json) : (row.details_json ?? {})
  const details = { ...current, ...snap.details_json, ...layoutFor(snap.slug) }
  // A price still equal to the seed's came from the seed; any other price (and the active flag) was set in Admin since.
  const next = {
    name: snap.name,
    price: Number(row.price) === Number(seed.price) ? snap.price : row.price,
    is_active: row.is_active,
    short_story: snap.short_story,
    description: snap.description,
  }

  console.log(`\n${snap.id}  ${row.name}  (/product/${row.slug})`)
  for (const key of Object.keys(next)) {
    if (String(row[key]) !== String(next[key])) {
      console.log(`  ${key}: ${String(row[key]).slice(0, 70)}  →  ${String(next[key]).slice(0, 70)}`)
    }
  }
  console.log(`  tabs: ${details.sections.map((s) => s.title).join(', ')} + note`)
  const fragranceLine = details.sections[0].content.split('\n').find(isFragranceLine)
  console.log(`  ${fragranceLine ?? '(no fragrance line)'}`)
  changed++

  if (apply) {
    await query(
      `UPDATE products
          SET name = :name, price = :price, is_active = :is_active, short_story = :short_story,
              description = :description, details_json = :details
        WHERE id = :id`,
      { ...next, details: JSON.stringify(details), id: row.id },
    )
  }
}

console.log(apply ? `\nRestored ${changed} candles.` : `\nPreview only (${changed} to restore). Re-run with --apply to save.`)
process.exit(0)
