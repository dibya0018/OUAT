import { useSearchParams } from 'react-router-dom'
import { getCollectionBanner } from '../../../lib/collectionBanners'
import { getCollectionEditorial } from '../../../lib/collectionEditorial'
import { HERO_TITLES } from '../../../lib/collectionUi'
import { SORT_OPTIONS } from '../../../services/productService'

export function useCollectionPage(collectionSlug, collection) {
  const editorial = getCollectionEditorial(collectionSlug)
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'featured'
  const banner = editorial ? getCollectionBanner(editorial.bannerSlug) : null
  const fallbackTitle = HERO_TITLES[collectionSlug]

  const setSort = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'featured') next.delete('sort')
    else next.set('sort', value)
    setSearchParams(next, { replace: true })
  }

  return {
    editorial,
    banner,
    sort,
    setSort,
    sortOptions: SORT_OPTIONS,
    heroAccent: collection?.heroTitleAccent ?? fallbackTitle?.[0] ?? collection?.name ?? 'Discover',
    heroRest: collection?.heroTitleRest ?? (collection?.heroTitleAccent ? '' : (fallbackTitle?.[1] ?? '')),
    description: collection?.description ?? '',
  }
}
