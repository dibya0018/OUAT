/**
 * Which image files (in src/components/images/) each product uses.
 * Up to 6 photos per product — add filenames freely; the seed stores them as /images/<file> URLs.
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
  // Product photography from the previous site (ouatworld.com)
  'product-turtle-drinking-glasses-1.jpg': 'product photo',
  'product-turtle-drinking-glasses-2.png': 'product photo',
  'product-turtle-drinking-glasses-3.jpg': 'product photo',
  'product-turtle-drinking-glasses-4.png': 'product photo',
  'product-turtle-drinking-glasses-5.jpg': 'product photo',
  'product-turtle-drinking-glasses-6.jpg': 'product photo',
  'product-turtle-drinking-glasses-7.png': 'product photo',
  'product-turtle-drinking-glasses-8.jpg': 'product photo',
  'product-morning-shot-glasses-1.jpg': 'product photo',
  'product-morning-shot-glasses-2.jpg': 'product photo',
  'product-morning-shot-glasses-3.jpg': 'product photo',
  'product-morning-shot-glasses-4.jpg': 'product photo',
  'product-morning-shot-glasses-5.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-1.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-2.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-3.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-4.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-5.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-6.png': 'product photo',
  'product-wine-bottle-drinking-glasses-7.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-8.jpg': 'product photo',
  'product-wine-bottle-drinking-glasses-9.jpg': 'product photo',
  'product-nourishing-massage-candle-collection-set-of-3-1.png': 'product photo',
  'product-nourishing-massage-candle-collection-set-of-3-2.png': 'product photo',
  'product-citrus-fragrance-tag-1.png': 'product photo',
  'product-citrus-fragrance-tag-2.jpg': 'product photo',
  'product-oud-woodlands-1.png': 'product photo',
  'product-oud-woodlands-2.jpg': 'product photo',
  'product-serenity-1.png': 'product photo',
  'product-serenity-2.jpg': 'product photo',
  'product-tropical-blossom-1.png': 'product photo',
  'product-tropical-blossom-2.png': 'product photo',
  'product-oriental-bloom-1.jpg': 'product photo',
  'product-oriental-bloom-2.jpg': 'product photo',
  'product-natures-scent-1.jpg': 'product photo',
  'product-natures-scent-2.png': 'product photo',
  'product-earth-essence-1.jpg': 'product photo',
  'product-earth-essence-2.png': 'product photo',
  'product-bugg-off-1.jpg': 'product photo',
  'product-bugg-off-2.png': 'product photo',
  'product-citrus-blossom-1.jpg': 'product photo',
  'product-citrus-blossom-2.jpg': 'product photo',
  'product-mountain-air-1.png': 'product photo',
  'product-mountain-air-2.png': 'product photo',
  'product-kashmir-daffodils-1.jpg': 'product photo',
  'product-kashmir-daffodils-2.jpg': 'product photo',
  'product-nicotina-1.jpg': 'product photo',
  'product-nicotina-2.png': 'product photo',
  'product-valley-of-flowers-1.jpg': 'product photo',
  'product-valley-of-flowers-2.jpg': 'product photo',
  'product-greencycled-storage-jars-1.png': 'product photo',
  'product-greencycled-storage-jars-2.png': 'product photo',
  'product-sproutcycled-glass-germinator-1.png': 'product photo',
  'product-sproutcycled-glass-germinator-2.png': 'product photo',
  'product-greencycled-sipper-1.png': 'product photo',
  'product-greencycled-sipper-2.png': 'product photo',
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
  'greencycled-sipper': ['product-greencycled-sipper-1.png', 'product-greencycled-sipper-2.png'],
  'sproutcycled-glass-germinator': ['product-sproutcycled-glass-germinator-1.png', 'product-sproutcycled-glass-germinator-2.png'],
  'greencycled-storage-jars': ['product-greencycled-storage-jars-1.png', 'product-greencycled-storage-jars-2.png'],
  'valley-of-flowers': ['product-valley-of-flowers-1.jpg', 'product-valley-of-flowers-2.jpg'],
  nicotina: ['product-nicotina-1.jpg', 'product-nicotina-2.png'],
  'nourishing-massage-candle-collection-set-of-3': ['product-nourishing-massage-candle-collection-set-of-3-1.png', 'product-nourishing-massage-candle-collection-set-of-3-2.png'],
  'oud-woodlands': ['product-oud-woodlands-1.png', 'product-oud-woodlands-2.jpg'],
  serenity: ['product-serenity-1.png', 'product-serenity-2.jpg'],
  'tropical-blossom': ['product-tropical-blossom-1.png', 'product-tropical-blossom-2.png'],
  'oriental-bloom': ['product-oriental-bloom-1.jpg', 'product-oriental-bloom-2.jpg'],
  'natures-scent': ['product-natures-scent-1.jpg', 'product-natures-scent-2.png'],
  'earth-essence': ['product-earth-essence-1.jpg', 'product-earth-essence-2.png'],
  'bugg-off': ['product-bugg-off-1.jpg', 'product-bugg-off-2.png'],
  'citrus-blossom': ['product-citrus-blossom-1.jpg', 'product-citrus-blossom-2.jpg'],
  'mountain-air': ['product-mountain-air-1.png', 'product-mountain-air-2.png'],
  'kashmir-daffodils': ['product-kashmir-daffodils-1.jpg', 'product-kashmir-daffodils-2.jpg'],
  'chakra-balancing-candles': ['process-reborn.png', 'goa-sunset.png', 'process-rescued.png', 'glassware-hero.png'],
  'gin-to-gems-upcycle-glass-jewels': [
    'jewellery-pendant.png',
    'jewellery-earrings.png',
    'jewellery-hero.png',
    'jewellery-story.png',
    'goa-sunset.png',
  ],
  'repurposed-wine-bottle-vase': ['process-reborn.png', 'glassware-hero.png', 'goa-sunset.png', 'process-reshaped.png'],
  'citrus-fragrance-tag': ['product-citrus-fragrance-tag-1.png', 'product-citrus-fragrance-tag-2.jpg'],
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
