/**
 * Give every candle the Bugg Off product-page layout: the same "Key Features" and "Candle Care" tabs
 * and the "A Note on Uniqueness" box. Each candle keeps its own name and price, and its description
 * becomes the text of its own "Fragrance Story" / "Fragrance Profile" tab (kept as is when it has none).
 *   node server/scripts/apply-candle-layout.js          # preview only
 *   node server/scripts/apply-candle-layout.js --apply  # write to the DB
 *
 * The tabs come from server/data/product-updates/bugg-off.json. Lines that only describe Bugg Off
 * (its fragrance, weights, box size, burn time) and the "two designs" sentence are left out, so no
 * other candle shows Bugg Off's numbers.
 */
import { readFile } from 'node:fs/promises'
import { query } from '../config/db.js'

const apply = process.argv[2] === '--apply'
const template = JSON.parse(await readFile('server/data/product-updates/bugg-off.json', 'utf8'))

const BUGG_OFF_ONLY = /^•\s*(Fragrance|Net Candle Weight|Gross Weight|Packaging Dimensions|Burn Time):/
const sections = template.details.sections.map((s) =>
  s.title === 'Key Features'
    ? { ...s, content: s.content.split('\n').filter((line) => !BUGG_OFF_ONLY.test(line.trim())).join('\n') }
    : s,
)
const note = {
  ...template.details.note,
  content: template.details.note.content.split('\n')[0], // drop "may arrive in either of the two designs shown"
}

const candles = await query(
  "SELECT id, slug, name, short_story, description, details_json FROM products WHERE collection_slug = 'candles' AND name NOT LIKE :skip ORDER BY name",
  { skip: `%${template.match}%` },
)

/** The candle's own "Fragrance Story" / "Fragrance Profile" tab text, as one plain paragraph. */
function fragranceStory(prevSections = []) {
  const tab = prevSections.find((s) => /fragrance\s*(story|profile)/i.test(s.title ?? ''))
  if (!tab?.content?.trim()) return null
  return tab.content
    .split('\n')
    .map((line) => line.trim().replace(/^(?:•|-\s)\s*/, ''))
    .filter(Boolean)
    .join(' ')
}

console.log('Key Features for every candle:\n' + sections.find((s) => s.title === 'Key Features').content)
console.log('\nNote: ' + note.content + '\n')
for (const row of candles) {
  const prev = typeof row.details_json === 'string' ? JSON.parse(row.details_json) : (row.details_json ?? {})
  const before = (prev.sections ?? []).map((s) => s.title).join(', ') || '(default tabs)'
  const story = fragranceStory(prev.sections)
  console.log(`\n${row.id}  ${row.name}\n  tabs: ${before}  →  ${sections.map((s) => s.title).join(', ')}`)
  console.log(story ? `  description → ${story}` : '  description: no fragrance tab found, kept as is')
  if (apply) {
    await query(
      'UPDATE products SET short_story = :story, description = :story, details_json = :details WHERE id = :id',
      {
        story: story ?? row.short_story,
        details: JSON.stringify({ ...prev, sections, note }),
        id: row.id,
      },
    )
  }
}

console.log(apply ? `\nSaved ${candles.length} candles.` : `\nPreview only (${candles.length} candles). Re-run with --apply to save.`)
process.exit(0)
