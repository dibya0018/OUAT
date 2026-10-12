/**
 * Catalogue seed data (plain JSON — no Vite imports).
 * Image src uses /images/* served from public/.
 */
export const collections = [
  {
    id: 'glassware',
    slug: 'glassware',
    name: 'Glassware',
    tagline: 'Tumblers, carafes and glasses with a past.',
    description:
      'Each piece began as a bottle poured at a Goan table. Cut, ground and polished by hand, it returns as glassware you will reach for every day.',
    sortOrder: 0,
    image: { src: null, alt: 'Set of reclaimed glass tumblers on a linen cloth', tone: 'sand' },
  },
  {
    id: 'candles',
    slug: 'candles',
    name: 'Candles',
    tagline: 'Soy wax, hand-poured into reclaimed glass.',
    description:
      'Quiet scents poured into bottles that once held wine and whisky. When the wax is gone, the glass stays on as a tumbler or vase.',
    sortOrder: 1,
    image: { src: null, alt: 'Soy candle in a cut amber bottle', tone: 'olive' },
  },
  {
    id: 'kitchen-storage',
    slug: 'kitchen-storage',
    name: 'Kitchen & Storage',
    tagline: 'Jars, pourers and vessels for everyday rituals.',
    description:
      'Pantry jars, oil pourers and planters shaped from reclaimed bottles. Practical pieces that make the ordinary a little more considered.',
    sortOrder: 2,
    image: { src: null, alt: 'Cork-lidded storage jars on an open shelf', tone: 'sand' },
  },
  {
    id: 'jewellery',
    slug: 'jewellery',
    name: 'Jewellery',
    tagline: 'Light on the skin. One of a kind.',
    heroTitleAccent: 'The coast inspires,',
    heroTitleRest: 'sea glass adorns.',
    description:
      'Tumbled fragments from our Goa studio — pendants and earrings made for everyday wear, for gifting, or for keeping something of the sea close.',
    audienceLine: 'Quiet luxury for her: personal pieces that layer from morning to evening.',
    sortOrder: 3,
    image: {
      src: null,
      alt: 'Gold drop earrings and pendant on stone — handcrafted jewellery',
      tone: 'sand',
    },
  },
]

export const products = [
  {
    id: 'p-001',
    slug: 'tall-tumbler-set',
    name: 'Tall Tumbler, Set of 4',
    collection: 'glassware',
    price: 1850,
    isNew: false,
    featured: true,
    createdAt: '2026-03-02',
    origin: 'wine bottle',
    colour: 'Olive green',
    shortStory:
      'This was once a wine bottle, emptied over a long dinner somewhere in Goa. Cut at the shoulder and ground smooth, it holds about 350ml.',
    description:
      'Our signature tumbler. The natural tint of the original bottle gives each set a soft green cast that changes with the light. Dishwasher safe, and heavier in the hand than you expect.',
    details: {
      material: 'Reclaimed soda-lime glass. Rim ground and fire-polished by hand.',
      size: 'Approx. 13 cm tall × 7.5 cm diameter. Capacity 350 ml. Set of four.',
      care: 'Dishwasher safe on a gentle cycle. Avoid sudden temperature changes.',
      shipping: 'Ships from Goa within 3–5 working days, packed in recycled card.',
    },
    images: [
      { src: null, alt: 'Four tall green tumblers lined up on a white table', tone: 'sand' },
      { src: null, alt: 'Close-up of the ground, polished rim of a tumbler', tone: 'olive' },
    ],
  },
  {
    id: 'p-002',
    slug: 'short-tumbler-set',
    name: 'Short Tumbler, Set of 4',
    collection: 'glassware',
    price: 1650,
    isNew: false,
    featured: true,
    createdAt: '2026-02-18',
    origin: 'gin bottle',
    colour: 'Clear',
    shortStory:
      'This was once a gin bottle. Its thick base makes a low, steady glass that suits a slow evening drink.',
    description:
      'Shorter and wider than our tall tumbler, with the weight concentrated in the base. The clear glass shows the subtle ripples left by the original mould.',
    details: {
      material: 'Reclaimed soda-lime glass. Rim ground and fire-polished by hand.',
      size: 'Approx. 9 cm tall × 8 cm diameter. Capacity 280 ml. Set of four.',
      care: 'Dishwasher safe on a gentle cycle.',
      shipping: 'Ships from Goa within 3–5 working days, packed in recycled card.',
    },
    images: [
      { src: null, alt: 'Four short clear tumblers on a timber surface', tone: 'olive' },
      { src: null, alt: 'Short tumbler base showing original mould seams', tone: 'sand' },
    ],
  },
  {
    id: 'p-003',
    slug: 'stemless-wine-glass-pair',
    name: 'Stemless Wine Glass, Pair',
    collection: 'glassware',
    price: 1450,
    isNew: true,
    featured: true,
    createdAt: '2026-09-10',
    origin: 'champagne bottle',
    colour: 'Deep green',
    shortStory:
      'This was once a champagne bottle, opened for a celebration. Its sloped shoulder becomes a wide bowl for wine.',
    description:
      'Cut just below the neck so the natural curve of the bottle forms the bowl. Sold as a pair.',
    details: {
      material: 'Reclaimed champagne glass, heavier gauge than wine bottles.',
      size: 'Approx. 11 cm tall × 8.5 cm diameter. Capacity 400 ml. Set of two.',
      care: 'Hand wash recommended to keep the rim finish.',
      shipping: 'Ships from Goa within 3–5 working days, packed in recycled card.',
    },
    images: [
      { src: null, alt: 'Pair of deep green stemless wine glasses', tone: 'sand' },
      { src: null, alt: 'Stemless glass with the bottle it was cut from', tone: 'deep' },
    ],
  },
  {
    id: 'p-004',
    slug: 'carafe',
    name: 'Carafe',
    collection: 'glassware',
    price: 1250,
    isNew: true,
    featured: false,
    createdAt: '2026-09-22',
    origin: '1-litre vodka bottle',
    colour: 'Clear',
    shortStory:
      'This was once a one-litre vodka bottle. With the neck shortened and the lip softened, it pours cleanly and sits well on a table.',
    description:
      'A simple water carafe. Pair with the short tumblers for a table set that shares the same origin.',
    details: {
      material: 'Reclaimed soda-lime glass. Neck cut and polished by hand.',
      size: 'Approx. 24 cm tall. Capacity 900 ml.',
      care: 'Dishwasher safe on a gentle cycle.',
      shipping: 'Ships from Goa within 3–5 working days, packed in recycled card.',
    },
    images: [
      { src: null, alt: 'Clear glass carafe filled with water', tone: 'olive' },
      { src: null, alt: 'Carafe neck detail', tone: 'sand' },
    ],
  },
  {
    id: 'p-005',
    slug: 'amber-soy-candle',
    name: 'Soy Candle in Amber Glass',
    collection: 'candles',
    price: 950,
    isNew: false,
    featured: true,
    createdAt: '2026-01-15',
    origin: 'whisky bottle',
    colour: 'Amber',
    shortStory:
      'This was once a whisky bottle. The amber glass warms the flame, and when the wax is finished, you keep the tumbler.',
    description:
      'Hand-poured soy wax with a cotton wick. Scented with cedar and a trace of orange peel. Roughly 40 hours of burn time.',
    details: {
      material: 'Reclaimed amber glass, soy wax, cotton wick.',
      size: 'Approx. 9 cm tall × 7.5 cm diameter. 200 g wax.',
      care: 'Trim wick to 5 mm before each burn. Do not burn for more than 4 hours at a time.',
      shipping: 'Ships from Goa within 3–5 working days.',
    },
    images: [
      { src: null, alt: 'Lit soy candle in an amber glass tumbler', tone: 'sand' },
      { src: null, alt: 'Amber candle glass with the wax removed, used as a tumbler', tone: 'olive' },
    ],
  },
  {
    id: 'p-006',
    slug: 'sea-salt-sage-candle',
    name: 'Sea Salt & Sage Candle',
    collection: 'candles',
    price: 1050,
    isNew: true,
    featured: false,
    createdAt: '2026-08-30',
    origin: 'wine bottle',
    colour: 'Olive green',
    shortStory:
      'This was once a wine bottle. Its green glass now holds a scent that borrows from the Goan coast: salt air and dry sage.',
    description:
      'Soy wax poured into a cut wine bottle. A clean, grounding scent for mornings. Roughly 45 hours of burn time.',
    details: {
      material: 'Reclaimed green glass, soy wax, cotton wick.',
      size: 'Approx. 10 cm tall × 7.5 cm diameter. 220 g wax.',
      care: 'Trim wick to 5 mm before each burn. Keep away from drafts.',
      shipping: 'Ships from Goa within 3–5 working days.',
    },
    images: [
      { src: null, alt: 'Green glass candle on a windowsill', tone: 'olive' },
      { src: null, alt: 'Candle flame close-up', tone: 'deep' },
    ],
  },
  {
    id: 'p-007',
    slug: 'candle-trio',
    name: 'Candle Trio',
    collection: 'candles',
    price: 2400,
    isNew: false,
    featured: false,
    createdAt: '2026-02-01',
    origin: 'wine, whisky and gin bottles',
    colour: 'Assorted',
    shortStory:
      'These were once three different bottles: wine, whisky and gin. Together they make a set that doesn’t quite match, which is the point.',
    description:
      'Three candles in three glass tones: green, amber and clear. Cedar, sea salt and sage, and unscented. Our most-gifted piece.',
    details: {
      material: 'Reclaimed glass, soy wax, cotton wicks.',
      size: 'Three candles, approx. 9–10 cm tall. 200–220 g wax each.',
      care: 'Trim wicks to 5 mm before each burn.',
      shipping: 'Ships from Goa within 3–5 working days in a gift-ready box.',
    },
    images: [
      { src: null, alt: 'Three candles in green, amber and clear glass', tone: 'sand' },
      { src: null, alt: 'Candle trio in open gift box', tone: 'olive' },
    ],
  },
  {
    id: 'p-008',
    slug: 'storage-jar-cork-lid',
    name: 'Storage Jar with Cork Lid',
    collection: 'kitchen-storage',
    price: 850,
    isNew: false,
    featured: true,
    createdAt: '2026-01-20',
    origin: '750 ml gin bottle',
    colour: 'Clear',
    shortStory:
      'This was once a 750 ml gin bottle. Cut tall and fitted with a natural cork lid, it keeps coffee, grains or sea salt close to hand.',
    description:
      'A pantry staple with a wide mouth and a snug cork. Stack a few on an open shelf and they quietly make the kitchen look better.',
    details: {
      material: 'Reclaimed glass, natural cork lid.',
      size: 'Approx. 16 cm tall × 7.5 cm diameter. Capacity 600 ml.',
      care: 'Glass is dishwasher safe. Wipe cork with a damp cloth only.',
      shipping: 'Ships from Goa within 3–5 working days.',
    },
    images: [
      { src: null, alt: 'Clear storage jar with cork lid filled with coffee beans', tone: 'sand' },
      { src: null, alt: 'Row of three storage jars on a shelf', tone: 'olive' },
    ],
  },
  {
    id: 'p-009',
    slug: 'oil-vinegar-pourer-set',
    name: 'Oil & Vinegar Pourer, Set of 2',
    collection: 'kitchen-storage',
    price: 1350,
    isNew: false,
    featured: false,
    createdAt: '2026-04-05',
    origin: 'olive oil bottles',
    colour: 'Deep green',
    shortStory:
      'These were once olive oil bottles. We kept the slender neck and fitted a stainless steel pourer, so they return to their first job.',
    description:
      'Two slim green bottles with drip-free stainless steel spouts. Oil and vinegar, or whatever your table needs.',
    details: {
      material: 'Reclaimed green glass, stainless steel pourer with silicone seal.',
      size: 'Approx. 22 cm tall. Capacity 250 ml each. Set of two.',
      care: 'Hand wash. Remove pourer before washing.',
      shipping: 'Ships from Goa within 3–5 working days.',
    },
    images: [
      { src: null, alt: 'Two green glass pourers on a kitchen counter', tone: 'olive' },
      { src: null, alt: 'Stainless pourer spout detail', tone: 'sand' },
    ],
  },
  {
    id: 'p-010',
    slug: 'bottle-vase',
    name: 'Bottle Vase',
    collection: 'kitchen-storage',
    price: 750,
    isNew: false,
    featured: true,
    createdAt: '2026-03-14',
    origin: 'wine bottle',
    colour: 'Olive green',
    shortStory:
      'This was once a wine bottle. Cut just above the shoulder, it holds a single stem or a loose handful of garden cuttings.',
    description:
      'The simplest thing we make. The cut line is softened by hand and the base is left exactly as the bottle maker intended.',
    details: {
      material: 'Reclaimed green glass.',
      size: 'Approx. 18 cm tall × 7.5 cm diameter.',
      care: 'Hand wash. Not for use with hot water.',
      shipping: 'Ships from Goa within 3–5 working days.',
    },
    images: [
      { src: null, alt: 'Green bottle vase with a single stem of eucalyptus', tone: 'sand' },
      { src: null, alt: 'Vase on a bedside table', tone: 'olive' },
    ],
  },
  {
    id: 'p-011',
    slug: 'sea-glass-pendant',
    name: 'Sea Glass Pendant',
    collection: 'jewellery',
    price: 1200,
    isNew: true,
    featured: true,
    createdAt: '2026-09-01',
    origin: 'wine bottle',
    colour: 'Olive green',
    shortStory:
      'This was once a green wine bottle. A fragment from our cutting bench, tumbled for days until it looks like it washed up on a beach.',
    description:
      'A single tumbled olive-glass fragment, wire-wrapped and hung on a fine brass chain. Each piece is a different shape.',
    details: {
      material: 'Reclaimed olive glass, brass wire and chain.',
      size: 'Pendant approx. 2–2.5 cm. Chain 45 cm with extender.',
      care: 'Keep dry. Polish brass with a soft cloth.',
      shipping: 'Ships from Goa within 3–5 working days in a small cotton pouch.',
    },
    images: [
      { src: '/images/jewellery-pendant.png', alt: 'Olive sea-glass pendant on a brass chain', tone: 'sand' },
      { src: null, alt: 'Pendant worn against a white linen shirt', tone: 'sand' },
    ],
  },
  {
    id: 'p-012',
    slug: 'glass-drop-earrings',
    name: 'Glass Drop Earrings',
    collection: 'jewellery',
    price: 980,
    isNew: false,
    featured: false,
    createdAt: '2026-05-11',
    origin: 'wine bottle',
    colour: 'Olive green',
    shortStory:
      'These were once part of a green bottle. Two small drops, tumbled smooth and matched by eye so they sit as a pair.',
    description:
      'Light, matte olive-glass drops on brass hooks with a petal cap. They catch the light without asking for attention.',
    details: {
      material: 'Reclaimed olive glass, brass hooks.',
      size: 'Drops approx. 1.5 cm. Total length approx. 3.5 cm.',
      care: 'Keep dry. Store in the pouch provided.',
      shipping: 'Ships from Goa within 3–5 working days in a small cotton pouch.',
    },
    images: [
      { src: '/images/jewellery-earrings.png', alt: 'Pair of olive sea-glass drop earrings on brass hooks', tone: 'sand' },
      { src: null, alt: 'Earrings on a linen cloth beside a tumbler', tone: 'olive' },
    ],
  },
]
