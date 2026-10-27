import crypto from 'node:crypto'
import { query } from '../config/db.js'
import passportData from '../data/passportData.js'
import { siteUrl } from './appEnv.js'

/** Orders in these states never get (or show) a passport. */
const HIDDEN_STATUSES = ['payment_pending', 'cancelled']

const DAY = 24 * 60 * 60 * 1000

export function passportId(orderItemId) {
  return `OUAT-${String(orderItemId).padStart(4, '0')}`
}

/** `OUAT-0147` → 147, or null. */
export function parsePassportId(id) {
  const m = /^OUAT-(\d{1,12})$/i.exec(String(id ?? '').trim())
  return m ? Number(m[1]) : null
}

// Re-exported so existing imports keep working; the env switch lives in appEnv.js.
export { siteUrl }

export function passportUrl(id) {
  return `${siteUrl()}/passport/${id}`
}

/** Stable small number from a string, so derived details never change between views. */
function pick(seed, n) {
  const h = crypto.createHash('sha1').update(String(seed)).digest()
  return h.readUInt32BE(0) % n
}

const BOTTLES = [
  [/beer/i, 'Amber beer bottle'],
  [/champagne|prosecco|sparkling/i, 'Green champagne bottle'],
  [/\bgin\b/i, 'Clear gin bottle'],
  [/whisk/i, 'Whisky bottle'],
  [/\brum\b/i, 'Rum bottle'],
  [/wine/i, 'Green wine bottle'],
]

const COLLECTION_BOTTLE = {
  candles: 'Amber beer bottle',
  jewellery: 'Clear gin bottle',
}

const NOW_TYPES = [
  [/tumbler/i, 'Tumbler'],
  [/shot glass/i, 'Shot glass'],
  [/candle/i, 'Candle'],
  [/vase/i, 'Vase'],
  [/planter/i, 'Planter'],
  [/lamp|light/i, 'Lamp'],
  [/bowl/i, 'Bowl'],
  [/jar|container|storage/i, 'Storage jar'],
  [/coaster/i, 'Coaster'],
  [/tray|platter/i, 'Tray'],
  [/earring|pendant|necklace|jewel|gem|bracelet/i, 'Jewellery piece'],
  [/glass/i, 'Glass'],
]

const COLLECTION_NOW = {
  glassware: 'Glass',
  candles: 'Candle',
  'kitchen-storage': 'Storage jar',
  jewellery: 'Jewellery piece',
}

function firstMatch(table, text) {
  return table.find(([re]) => re.test(text))?.[1] ?? null
}

function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10)
}

/**
 * Build the passport for one order line.
 * @param {{ itemId: number, productId: string, productName: string, quantity: number, collection?: string|null, orderedAt: Date|string }} line
 */
export function buildPassport(line) {
  const id = passportId(line.itemId)
  const name = String(line.productName ?? '')
  const batch = passportData.batches[`item:${line.itemId}`] ?? passportData.batches[line.productId] ?? {}

  const village =
    passportData.villages.find((v) => v.name === batch.village) ??
    passportData.villages[pick(`v${line.itemId}`, passportData.villages.length)]
  const artisan = batch.artisan ?? passportData.artisans[pick(`a${line.itemId}`, passportData.artisans.length)]
  const was =
    batch.was ?? firstMatch(BOTTLES, name) ?? COLLECTION_BOTTLE[line.collection] ?? 'Green wine bottle'
  const now = batch.now ?? firstMatch(NOW_TYPES, name.split('|')[0]) ?? COLLECTION_NOW[line.collection] ?? 'Keepsake'

  // Derived timeline: finished a few days before the order, each step a few days apart.
  const ordered = new Date(line.orderedAt || Date.now()).getTime()
  const finished = ordered - (3 + pick(`f${line.itemId}`, 4)) * DAY
  const cut = finished - 6 * DAY
  const cleaned = cut - 6 * DAY
  const rescued = cleaned - 2 * DAY
  const dates = {
    rescued: batch.dates?.rescued ?? isoDate(rescued),
    cleaned: batch.dates?.cleaned ?? isoDate(cleaned),
    cut: batch.dates?.cut ?? isoDate(cut),
    finished: batch.dates?.finished ?? isoDate(finished),
  }

  const qty = Math.max(1, Number(line.quantity) || 1)
  return {
    id,
    url: passportUrl(id),
    productName: name.split('|')[0].trim(),
    quantity: qty,
    village: village.name,
    was,
    now,
    headline: `This ${now.toLowerCase()} was a bottle in ${village.name}.`,
    artisan: { name: artisan.name, role: artisan.role, studio: 'O.U.A.T. studio, Goa' },
    journey: [
      { key: 'rescued', title: 'Rescued', text: `Collected in ${village.name} by our team, instead of going to the bin.`, date: dates.rescued },
      { key: 'cleaned', title: 'Soaked and cleaned', text: 'Labels and glue removed, then washed and dried.', date: dates.cleaned },
      { key: 'cut', title: 'Cut and smoothed', text: 'Scored, cut to height and sanded until the rim was safe to use.', date: dates.cut },
      { key: 'finished', title: 'Finished and checked', text: 'Inspected by hand and packed for you.', date: dates.finished },
    ],
    rescuedOn: dates.rescued,
    keptOut: qty,
    villageTotal: village.bottles,
    villages: passportData.villages.map((v) => ({ name: v.name, bottles: v.bottles })),
    isSample: Boolean(passportData.isSample),
  }
}

/** Every passport for an order (one per line), skipping orders that are not confirmed. */
export async function passportsForOrder(orderId) {
  const rows = await query(
    `SELECT oi.id, oi.product_id, oi.product_name, oi.quantity, o.created_at, p.collection_slug
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = :orderId
     ORDER BY oi.id`,
    { orderId },
  )
  return rows.map((r) =>
    buildPassport({
      itemId: r.id,
      productId: r.product_id,
      productName: r.product_name,
      quantity: r.quantity,
      collection: r.collection_slug,
      orderedAt: r.created_at,
    }),
  )
}

/** Public passport lookup. Holds no customer details. */
export async function getPublicPassport(id) {
  const itemId = parsePassportId(id)
  if (!itemId) return null
  const rows = await query(
    `SELECT oi.id, oi.product_id, oi.product_name, oi.quantity, o.created_at, o.status, p.collection_slug
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.id = :itemId
     LIMIT 1`,
    { itemId },
  )
  const r = rows[0]
  if (!r || HIDDEN_STATUSES.includes(r.status)) return null
  return buildPassport({
    itemId: r.id,
    productId: r.product_id,
    productName: r.product_name,
    quantity: r.quantity,
    collection: r.collection_slug,
    orderedAt: r.created_at,
  })
}
