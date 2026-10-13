/**
 * Product catalogue derived from `website details .xlsx` (exported to website-details.json).
 */
import rows from './website-details.json' with { type: 'json' }

const SHIPPING = 'Ships from Goa within 3–5 working days, packed in recycled card.'

const CANDLE_JAR_CARE =
  'This handcrafted candle is made from non-toxic, biodegradable natural soy wax housed in an upcycled beer bottle. Due to the natural characteristics of soy wax, slight discoloration and texture variations may occur, which do not affect the candle’s performance or quality. To ensure longevity and prevent evaporation of natural oils, keep the candle covered with the lid when not in use. Over time, the upcycled jar may develop a white film; apply a light coating of oil to restore its matte appearance.'

const CANDLE_BURN_INSTRUCTION =
  'Burn within sight. Keep away from flammable objects. Keep out of reach of children and pets. Place on a stable, heat-resistant surface and burn for no more than 2 hours at a time. Do not move while lit or when wax is hot. Trim the wick to ¼ inch before each use. Our fragrances are crafted to be gentle and subtle rather than overpowering.'

const SOY_MATERIAL =
  'Natural soy wax and cotton wick with essential oils and fragrances, hand-poured into upcycled glass. Gluten-free and kosher; free of parabens, phthalates, and petrochemicals (paraffin, petroleum jelly, etc.).'

export function artisanalCandlesBlurb() {
  const row = rows.find((r) => /handcrafted artisanal\s*soy candles/i.test(r.Product ?? ''))
  return (row?.Features ?? '').replace(/\n+/g, ' ').trim()
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[!?'"…]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const DISPLAY_NAMES = {
  'gin to gems-upcycle glass jewels!': 'Gin to Gems — Upcycled Glass Jewels',
  'nourishing massage candle collection set of 3': 'Nourishing Massage Candle Collection (Set of 3)',
  'lav ylang-70g': 'Lav Ylang Massage Candle (70g)',
  'muscle melt-70g': 'Muscle Melt Massage Candle (70g)',
  'love potion-70g': 'Love Potion Massage Candle (70g)',
  'citrus fragrance tag': 'Citrus Fragrance Tag',
  'repurposed wine bottle vase': 'Repurposed Wine Bottle Vase',
}

function displayName(raw) {
  const n = raw.trim().replace(/\s+/g, ' ')
  const key = n.toLowerCase()
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key]
  if (/^valley of flowers$/i.test(n)) return 'Valley of Flowers'
  if (/^bugg off!$/i.test(n)) return 'Bugg Off!'
  if (n === n.toLowerCase() || /^[a-z]/.test(n)) {
    return n.replace(/\b\w[\w']*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  }
  return n
}

function firstSentence(text) {
  if (!text) return ''
  const trimmed = text.trim()
  const match = trimmed.match(/^[^.!?]+[.!?]/)
  return match ? match[0].trim() : trimmed.slice(0, 200)
}

function mapCollection(category, productName) {
  const c = (category ?? '').toLowerCase().trim()
  if (c === 'kitchenware') return 'kitchen-storage'
  if (c.includes('candle')) return 'candles'
  if (c.includes('jewel')) return 'jewellery'
  if (c.includes('home decor')) return 'glassware'
  if (c.includes('fragrance') || c.includes('wadrobe')) return 'kitchen-storage'
  if (/massage|chakra|nicotina|valley|daffodil|citronella|oud|serenity|bloom|essence|scent|mountain|tropical|oriental|citrus blossom|bugg/i.test(productName)) {
    return 'candles'
  }
  return 'kitchen-storage'
}

function shouldSkip(row) {
  const p = (row.Product ?? '').trim()
  if (!p) return true
  if (p.toLowerCase() === 'candles') return true
  if (/^gifting/i.test(p)) return true
  if (/handcrafted artisanal\s*soy candles/i.test(p)) return true
  return false
}

function inferPrice(row, collection) {
  const name = row.Product.toLowerCase()
  if (name.includes('chakra')) return 4200
  if (name.includes('massage candle collection') || name.includes('set of 3')) return 2890
  if (name.includes('-70g')) return 1290
  if (name.includes('fragrance tag')) return 590
  if (collection === 'jewellery') return 1100
  if (collection === 'glassware') return 850
  if (collection === 'kitchen-storage') {
    if (name.includes('germinator') || name.includes('sprouter')) return 1150
    if (name.includes('sipper')) return 1050
    return 950
  }
  return 950
}

function buildDetails(row, collection) {
  const features = row.Features?.trim()
  const care = row.Care?.trim()
  const instruction = row.Instruction?.trim()
  const sizeWeight = row['size / weight']?.trim()
  const name = row.Product ?? ''

  const isMassage = /massage|70g|muscle melt|love potion|lav ylang/i.test(name)
  const isChakra = /chakra/i.test(name)

  let material = features ?? ''
  let size = sizeWeight ?? ''
  let careText = care ?? ''

  if (collection === 'candles') {
    if (!material) material = SOY_MATERIAL
    if (!size) {
      if (isChakra) size = 'Each box contains seven 50 g chakra candles in upcycled beer-bottle containers.'
      else if (isMassage || /-70g/i.test(name)) size = 'Net qty 70 g massage candle.'
      else size = 'Net qty 200 g. Burn time approx. 60–80 hours.'
    }
    if (!careText || careText === 'all candles same -') careText = CANDLE_JAR_CARE
    const burnNote = isMassage ? instruction : instruction || CANDLE_BURN_INSTRUCTION
    careText = [careText, burnNote].filter(Boolean).join('\n\n')
  } else {
    if (!material && features) material = features
    if (!size && /capacity/i.test(features ?? '')) size = features.match(/capacity[^.]+/i)?.[0] ?? ''
    if (!careText && care) careText = care
    if (instruction) {
      const label = /germinator|sprouter/i.test(name) ? 'Sprouting instructions' : 'Instructions'
      careText = [careText, `${label}:\n${instruction}`].filter(Boolean).join('\n\n')
    }
  }

  return {
    material: material || 'See product description.',
    size: size || 'See product description.',
    care: careText || 'See product description.',
    shipping: SHIPPING,
  }
}

export function buildProductsFromWebsiteRows(sourceRows) {
  const products = []
  let id = 0

  for (const row of sourceRows) {
    if (shouldSkip(row)) continue
    id += 1
    const name = displayName(row.Product)
    const collection = mapCollection(row.category, name)
    const description = (row.Description ?? row.Features ?? '').trim()
    const slug = slugify(name)

    products.push({
      id: `p-${String(id).padStart(3, '0')}`,
      slug,
      name,
      collection,
      price: inferPrice(row, collection),
      isNew: /sprout|chakra|massage|fragrance tag|bugg/i.test(name),
      featured: /greencycled sipper|storage jars|valley of flowers|nicotina|chakra|gin to gems|repurposed wine/i.test(name),
      createdAt: '2026-01-15',
      origin: collection === 'candles' ? 'upcycled beer bottle' : 'upcycled glass bottle',
      colour: 'Assorted',
      shortStory: firstSentence(description) || name,
      description: description || name,
      details: buildDetails(row, collection),
      images: [{ src: null, alt: name, tone: 'sand' }],
    })
  }

  return products
}

export const products = buildProductsFromWebsiteRows(rows)
