import glasswareHero from '../components/images/glassware-tumblers-hero.webp'
import candlesBeachHero from '../components/images/candles-beach-hero.webp'
import kitchenBeachHero from '../components/images/kitchen-beach-bottles-hero.webp'
import jewelleryHero from '../components/images/jewellery-hero.webp'

/**
 * @typedef {Object} CollectionBannerConfig
 * @property {'glassware'|'candles'|'kitchen'|'jewellery'} variant
 * @property {string} src
 * @property {string} alt
 * @property {string} [objectPosition]
 * @property {string} [objectClass]
 */

/** Photo banners per collection (subject on the right, copy on the left). */
export const COLLECTION_BANNERS = {
  glassware: {
    variant: 'glassware',
    src: glasswareHero,
    alt: 'Green, amber and clear tumblers cut from bottles on a sunlit beige table, with tulips in two bottle vases',
    objectPosition: '80% 60%',
    objectClass: 'object-[80%_60%]',
  },
  candles: {
    variant: 'candles',
    src: candlesBeachHero,
    alt: 'Friends laughing on a Goa beach at sunset, raising green glass wine bottles in a toast',
    objectPosition: '62% center',
    objectClass: 'object-[62%_center] lg:object-[center_28%]',
  },
  'kitchen-storage': {
    variant: 'kitchen',
    src: kitchenBeachHero,
    alt: 'Green and amber wine bottles washed up in the sand on a Goa beach at sunset, palms and rocks behind',
    objectPosition: '72% 70%',
    objectClass: 'object-[72%_70%]',
  },
  jewellery: {
    variant: 'jewellery',
    src: jewelleryHero,
    alt: 'Model wearing sea-glass jewellery at the beach at golden hour',
    objectPosition: '70% center',
    objectClass: 'object-[70%_center] lg:object-[right_center]',
  },
}

export function getCollectionBanner(slug) {
  return COLLECTION_BANNERS[slug] ?? null
}
