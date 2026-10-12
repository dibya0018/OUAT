/**
 * Visual identity per collection page (layout + hero treatment).
 * Keeps each category feeling distinct while sharing the same catalog logic.
 */
export const COLLECTION_THEMES = {
  glassware: {
    hero: 'section-cream',
    body: 'section-white',
    gridColumns: 3,
    heroAlign: 'left',
    introClass: 'text-ink-soft',
  },
  candles: {
    hero: 'bg-ink text-cream',
    body: 'section-cream',
    gridColumns: 3,
    heroAlign: 'left',
    introClass: 'text-cream/90',
    titleOnDark: true,
  },
  'kitchen-storage': {
    hero: 'section-white border-b border-line',
    body: 'section-white',
    gridColumns: 3,
    heroAlign: 'left',
    introClass: 'text-ink-soft',
  },
  jewellery: {
    hero: 'surface-jewellery',
    body: 'surface-jewellery-body',
    gridColumns: 2,
    heroAlign: 'center',
    introClass: 'text-ink-soft',
    goaDecor: true,
    texture: 'jewellery',
    eyebrow: 'For her',
  },
}

export function getCollectionTheme(slug) {
  return COLLECTION_THEMES[slug] ?? COLLECTION_THEMES.glassware
}
