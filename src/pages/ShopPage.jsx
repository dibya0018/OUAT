import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import ShopCatalog from '../components/shop/ShopCatalog'
import { getCollections, getProducts } from '../services/productService'

/** All products — category pages live at /glassware, /candles, etc. */
export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'featured'

  const [collections, setCollections] = useState([])
  const requestKey = `all|${sort}`
  const [result, setResult] = useState(null)

  useEffect(() => {
    getCollections().then(setCollections)
  }, [])

  useEffect(() => {
    let cancelled = false
    getProducts({ sort }).then((list) => {
      if (!cancelled) setResult({ key: requestKey, products: list })
    })
    return () => {
      cancelled = true
    }
  }, [sort, requestKey])

  const loaded = result?.key === requestKey
  const products = loaded ? result.products : null

  return (
    <>
      <Seo
        title="Shop"
        description="Glassware, candles, kitchen pieces and jewellery made from reclaimed bottles. Handcrafted by local artisans in Goa."
        path="/shop"
      />
      <ShopCatalog
        collection={null}
        activeSlug={null}
        collections={collections}
        products={products}
        loading={products === null}
        theme={{ hero: 'section-white', body: 'section-cream', gridColumns: 4, heroAlign: 'left' }}
      />
    </>
  )
}
