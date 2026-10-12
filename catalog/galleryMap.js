/**
 * Which image files (in src/components/images/) each product uses.
 * Up to 6 photos per product — add filenames freely; seed encodes as base64, web uses /images/.
 */
export const IMAGE_FILES = {
  'glassware-hero.png': 'Hero glassware on stone',
  'jewellery-hero.png': 'Jewellery lifestyle',
  'jewellery-story.png': 'Coastal story',
  'jewellery-pendant.png': 'Sea glass pendant',
  'jewellery-earrings.png': 'Glass drop earrings',
  'process-rescued.png': 'Rescued bottles',
  'process-reshaped.png': 'Reshaped glass',
  'process-reborn.png': 'Finished piece',
  'goa-sunset.png': 'Goa golden hour',
  'goa.png': 'Goa aerial',
}

const byCollection = {
  glassware: ['glassware-hero.png', 'process-reshaped.png', 'process-reborn.png', 'goa-sunset.png', 'process-rescued.png'],
  candles: ['process-reborn.png', 'goa-sunset.png', 'process-rescued.png', 'glassware-hero.png', 'process-reshaped.png'],
  'kitchen-storage': ['process-rescued.png', 'process-reshaped.png', 'glassware-hero.png', 'goa-sunset.png', 'process-reborn.png'],
  jewellery: [
    'jewellery-pendant.png',
    'jewellery-earrings.png',
    'jewellery-hero.png',
    'jewellery-story.png',
    'goa-sunset.png',
    'process-reborn.png',
  ],
}

/** @type {Record<string, string[]>} */
export const PRODUCT_GALLERY = {
  'tall-tumbler-set': ['glassware-hero.png', 'process-reshaped.png', 'process-reborn.png', 'goa-sunset.png'],
  'short-tumbler-set': ['glassware-hero.png', 'process-rescued.png', 'process-reshaped.png', 'goa-sunset.png'],
  'stemless-wine-glass-pair': ['glassware-hero.png', 'process-reborn.png', 'goa-sunset.png', 'process-reshaped.png'],
  carafe: ['glassware-hero.png', 'process-reshaped.png', 'process-reborn.png', 'goa.png'],
  'amber-soy-candle': ['process-reborn.png', 'goa-sunset.png', 'process-rescued.png', 'glassware-hero.png'],
  'sea-salt-sage-candle': ['process-reborn.png', 'process-reshaped.png', 'goa-sunset.png', 'process-rescued.png'],
  'candle-trio': ['process-reborn.png', 'process-rescued.png', 'goa-sunset.png', 'glassware-hero.png', 'process-reshaped.png'],
  'storage-jar-cork-lid': ['process-rescued.png', 'process-reshaped.png', 'glassware-hero.png', 'goa-sunset.png'],
  'oil-vinegar-pourer-set': ['process-reshaped.png', 'process-rescued.png', 'glassware-hero.png', 'goa-sunset.png'],
  'bottle-vase': ['process-reborn.png', 'glassware-hero.png', 'goa-sunset.png', 'process-reshaped.png'],
  'sea-glass-pendant': [
    'jewellery-pendant.png',
    'jewellery-hero.png',
    'jewellery-story.png',
    'goa-sunset.png',
    'process-reborn.png',
  ],
  'glass-drop-earrings': [
    'jewellery-earrings.png',
    'jewellery-pendant.png',
    'jewellery-hero.png',
    'jewellery-story.png',
    'goa-sunset.png',
  ],
}

const TONES = ['sand', 'olive', 'deep', 'sand', 'olive', 'deep']

export function galleryFilesForProduct(slug, collection) {
  const list = PRODUCT_GALLERY[slug] ?? byCollection[collection] ?? byCollection.glassware
  return list.slice(0, 6)
}

export function collectionHeroFiles(slug) {
  const map = {
    glassware: ['glassware-hero.png', 'process-reshaped.png'],
    candles: ['process-reborn.png', 'goa-sunset.png'],
    'kitchen-storage': ['process-rescued.png', 'glassware-hero.png'],
    jewellery: ['jewellery-hero.png', 'jewellery-story.png'],
  }
  return map[slug] ?? ['goa-sunset.png']
}
