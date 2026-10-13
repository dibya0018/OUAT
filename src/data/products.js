/**
 * Mock catalogue — re-exports seed data from server/data and attaches public image paths.
 * Access through /src/services/productService.js only.
 */
import { collections as seedCollections, products as seedProducts } from '../../server/data/catalogSeed.js'
import { collectionImagePublic, productImagesPublic } from '../lib/productGallery'

const collectionUi = {
  glassware: {
    heroTitleAccent: 'Every pour',
    heroTitleRest: 'tells a story.',
  },
  candles: {
    heroTitleAccent: 'Light the evening,',
    heroTitleRest: 'keep the glass.',
  },
  'kitchen-storage': {
    heroTitleAccent: 'Everyday rituals,',
    heroTitleRest: 'considered vessels.',
  },
  jewellery: {
    heroTitleAccent: 'The coast inspires,',
    heroTitleRest: 'sea glass adorns.',
  },
}

export const collections = seedCollections.map((c) => ({
  ...collectionUi[c.id],
  ...c,
  image: collectionImagePublic(c.slug, c.name),
}))

export const products = seedProducts.map((p) => ({
  ...p,
  images: productImagesPublic(p),
}))
