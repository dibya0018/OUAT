/**
 * Catalogue seed data (plain JSON — no Vite imports).
 * Product copy sourced from `website details .xlsx` via websiteCatalog.js.
 */
import { artisanalCandlesBlurb, products } from './websiteCatalog.js'

const candleIntro =
  artisanalCandlesBlurb() ||
  'Hand-poured soy candles with natural essential oils and fragrances, in upcycled glass. When the wax is gone, the glass stays on as a tumbler or vase.'

export const collections = [
  {
    id: 'glassware',
    slug: 'glassware',
    name: 'Glassware & Décor',
    tagline: 'Vases and vessels reborn from wine bottles.',
    description:
      'Artisan pieces cut and finished by hand from reclaimed bottles, each one unique in height, shape, and finish.',
    sortOrder: 0,
    image: { src: null, alt: 'Repurposed wine bottle vase on a shelf', tone: 'sand' },
  },
  {
    id: 'candles',
    slug: 'candles',
    name: 'Candles',
    tagline: 'Handcrafted artisanal soy candles.',
    heroTitleAccent: 'Light the evening,',
    heroTitleRest: 'keep the glass.',
    description: candleIntro,
    sortOrder: 1,
    image: { src: null, alt: 'Soy candle in upcycled glass', tone: 'olive' },
  },
  {
    id: 'kitchen-storage',
    slug: 'kitchen-storage',
    name: 'Kitchen & Storage',
    tagline: 'Greencycled sippers, sprouters, and jars.',
    description:
      'Upcycled glass for everyday rituals: sippers with bioplastic lids, sprouting jars, storage containers, and wardrobe fragrance tags.',
    sortOrder: 2,
    image: { src: null, alt: 'Upcycled kitchen glass on an open shelf', tone: 'sand' },
  },
  {
    id: 'jewellery',
    slug: 'jewellery',
    name: 'Jewellery',
    tagline: 'From gin to gems.',
    heroTitleAccent: 'The coast inspires,',
    heroTitleRest: 'sea glass adorns.',
    description:
      'Eco-chic jewellery crafted from upcycled wine, champagne, and gin bottles. Once waste, now timeless, one-of-a-kind treasures.',
    audienceLine: 'Quiet luxury for her: personal pieces that layer from morning to evening.',
    sortOrder: 3,
    image: {
      src: null,
      alt: 'Upcycled glass jewellery on stone',
      tone: 'sand',
    },
  },
]

export { products }
