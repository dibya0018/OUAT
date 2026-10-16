import glasswareHero from '../components/images/glassware-hero.png'
import goaSunset from '../components/images/goa-sunset.png'
import processRescued from '../components/images/process-rescued.png'
import jewelleryHero from '../components/images/jewellery-hero.png'

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
    alt: 'Reclaimed green glass tumblers and carafe on a stone ledge in sunlight',
    objectPosition: '88% center',
    objectClass: 'object-[82%_center] lg:object-[right_center]',
  },
  candles: {
    variant: 'candles',
    src: goaSunset,
    alt: 'Golden hour light on the coast, an evening mood for soy candles in glass',
    objectPosition: '55% center',
    objectClass: 'object-[60%_center] lg:object-[65%_center]',
  },
  'kitchen-storage': {
    variant: 'kitchen',
    src: processRescued,
    alt: 'Rescued glass bottles gathered before reshaping into kitchen vessels',
    objectPosition: '65% center',
    objectClass: 'object-[70%_center] lg:object-[right_center]',
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
