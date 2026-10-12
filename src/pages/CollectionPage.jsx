import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import ShopCatalog from '../components/shop/ShopCatalog'
import JewelleryCollectionLayout from '../components/shop/JewelleryCollectionLayout'
import GlasswareCollectionLayout from '../components/shop/GlasswareCollectionLayout'
import CandlesCollectionLayout from '../components/shop/CandlesCollectionLayout'
import KitchenStorageCollectionLayout from '../components/shop/KitchenStorageCollectionLayout'
import NotFoundPage from './NotFoundPage'
import { getCollectionPath } from '../lib/collections'
import { getCollectionTheme } from '../lib/collectionThemes'
import { getCollectionBySlug } from '../services/productService'

/** One route per collection — layout comes from collectionThemes.js */
export default function CollectionPage() {
  const { pathname } = useLocation()
  const collectionSlug = pathname.replace(/^\//, '')
  const [searchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'featured'

  const requestKey = `${collectionSlug}|${sort}`
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    getCollectionBySlug(collectionSlug, { products: true, sort }).then((data) => {
      if (cancelled || !data) {
        if (!cancelled) setResult({ key: requestKey, collection: null, products: [] })
        return
      }
      const { products: list, ...c } = data
      if (!cancelled) setResult({ key: requestKey, collection: c, products: list ?? [] })
    })
    return () => {
      cancelled = true
    }
  }, [collectionSlug, sort, requestKey])

  const loaded = result?.key === requestKey
  const collection = loaded ? result.collection : null
  const products = loaded ? result.products : null

  if (loaded && collection === null) {
    return <NotFoundPage />
  }

  const theme = getCollectionTheme(collectionSlug)

  const collectionLayouts = {
    glassware: GlasswareCollectionLayout,
    candles: CandlesCollectionLayout,
    'kitchen-storage': KitchenStorageCollectionLayout,
    jewellery: JewelleryCollectionLayout,
  }
  const ThemedLayout = collectionLayouts[collectionSlug]

  return (
    <>
      <Seo
        title={collection?.name ?? 'Shop'}
        description={collection?.description ?? ''}
        path={getCollectionPath(collectionSlug)}
      />
      {ThemedLayout ? (
        <ThemedLayout
          collection={collection}
          products={products}
          loading={products === null}
          collectionSlug={collectionSlug}
        />
      ) : (
        <ShopCatalog
          collection={collection}
          activeSlug={collectionSlug}
          collections={[]}
          products={products}
          loading={products === null}
          theme={theme}
        />
      )}
    </>
  )
}
