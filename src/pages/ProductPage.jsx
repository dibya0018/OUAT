import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle, { splitEditorialTitle } from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import Accordion from '../components/ui/Accordion'
import Icon from '../components/ui/Icon'
import Reveal from '../components/ui/Reveal'
import ProductGallery from '../components/product/ProductGallery'
import ProductGrid from '../components/product/ProductGrid'
import NotFoundPage from './NotFoundPage'
import { useCart } from '../hooks/useCart'
import { useCheckout } from '../hooks/useCheckout'
import { buildCheckoutLine } from '../lib/checkoutLine'
import { getCollectionBySlug, getProductBySlug, getRelatedProducts } from '../services/productService'
import { trackEvent } from '../lib/analytics'
import { cx, formatPrice } from '../lib/format'
import JewellerySurface from '../components/shop/JewellerySurface'
import JewelleryGoaDecor from '../components/motifs/JewelleryGoaDecor'
import { getCollectionPath } from '../lib/collections'
import { SITE } from '../lib/site'

/**
 * Loads the product for the current slug, then renders <ProductDetail>.
 * Keying the detail view by product id resets quantity/gift state per product.
 */
export default function ProductPage() {
  const { slug } = useParams()
  const [result, setResult] = useState(null) // { slug, product, collection, related }

  useEffect(() => {
    let cancelled = false
    getProductBySlug(slug).then(async (product) => {
      if (cancelled) return
      if (!product) {
        setResult({ slug, product: null })
        return
      }
      trackEvent('ViewContent', {
        currency: 'INR',
        value: product.price,
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        items: [{ item_id: product.id, item_name: product.name, price: product.price }],
      })
      const [collection, related] = await Promise.all([
        getCollectionBySlug(product.collection),
        getRelatedProducts(product, 4),
      ])
      if (!cancelled) setResult({ slug, product, collection, related })
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  const loaded = result?.slug === slug
  if (loaded && result.product === null) return <NotFoundPage />

  if (!loaded) {
    return (
      <Container className="py-24" aria-busy="true">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="aspect-product bg-sand md:col-span-7" />
          <div className="md:col-span-4 md:col-start-9" />
        </div>
      </Container>
    )
  }

  return (
    <ProductDetail
      key={result.product.id}
      product={result.product}
      collection={result.collection}
      related={result.related}
    />
  )
}

function ProductDetail({ product, collection, related }) {
  const { addItem } = useCart()
  const { openCheckout } = useCheckout()
  const [qty, setQty] = useState(1)
  const [gift, setGift] = useState(false)
  const [added, setAdded] = useState(false)

  const onAdd = () => {
    addItem(product, { qty, gift })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const onBuyNow = () => {
    const line = buildCheckoutLine(product, { qty, gift })
    addItem(product, { qty, gift, open: false })
    openCheckout({ lines: [line], clearCartAfter: false })
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortStory,
    sku: product.id,
    brand: { '@type': 'Brand', name: `${SITE.name} — ${SITE.longName}` },
    image: product.images.filter((i) => i.src).map((i) => i.src),
    material: product.details.material,
    offers: {
      '@type': 'Offer',
      url: `${SITE.url}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  const isJewellery = collection?.slug === 'jewellery'

  const accordionItems = [
    { title: 'Material', content: product.details.material },
    { title: 'Size', content: product.details.size },
    { title: 'Care', content: product.details.care },
    { title: 'Shipping', content: product.details.shipping },
  ]

  return (
    <>
      <Seo
        title={product.name}
        description={product.shortStory}
        path={`/product/${product.slug}`}
        type="product"
        image={product.images[0]?.src ?? undefined}
        jsonLd={jsonLd}
      />

      <article className={cx('relative pb-20 pt-4 md:pb-32 md:pt-8', isJewellery && 'surface-jewellery')}>
        {isJewellery && (
          <>
            <JewellerySurface />
            <JewelleryGoaDecor />
          </>
        )}
        <Container className="relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/shop" className="link-underline">
                  Shop
                </Link>
              </li>
              {collection && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link to={getCollectionPath(collection.slug)} className="link-underline">
                      {collection.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
            {/* Gallery */}
            <div className="md:col-span-7">
              <ProductGallery images={product.images} name={product.name} />
            </div>

            {/* Details */}
            <div className="md:col-span-4 md:col-start-9">
              <div className="md:sticky md:top-28">
                {collection && (
                  <p className={cx('eyebrow', isJewellery && 'text-accent')}>
                    {isJewellery ? 'For her' : collection.name}
                  </p>
                )}
                <EditorialTitle
                  as="h1"
                  size="md"
                  className="mt-3"
                  {...splitEditorialTitle(product.name)}
                />
                <p className="mt-4 font-sans text-lg">{formatPrice(product.price)}</p>

                <p className="mt-8 font-display text-xl leading-snug font-normal text-ink italic md:text-2xl">
                  {product.shortStory}
                </p>
                <p className="mt-6 text-sm text-ink-soft">{product.description}</p>
                {isJewellery && collection?.audienceLine && (
                  <p className="mt-6 font-display text-lg leading-snug text-ink italic">
                    {collection.audienceLine}
                  </p>
                )}

                {/* Purchase controls */}
                <div className="mt-10 flex flex-col gap-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="inline-flex w-fit items-center border border-line" role="group" aria-label="Quantity">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center text-primary hover:bg-sand"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                      >
                        <Icon name="minus" size={14} />
                      </button>
                      <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center text-primary hover:bg-sand"
                        onClick={() => setQty((q) => Math.min(99, q + 1))}
                        aria-label="Increase quantity"
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                    <Button onClick={onAdd} className="w-full sm:flex-1" aria-live="polite">
                      {added ? (
                        <>
                          <Icon name="check" size={16} /> Added
                        </>
                      ) : (
                        'Add to cart'
                      )}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={onBuyNow} fullWidth>
                    Buy now
                  </Button>

                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={gift}
                      onChange={(e) => setGift(e.target.checked)}
                      className="checkbox mt-1 focus-visible:outline-offset-2"
                    />
                    <span>
                      <span className="flex items-center gap-2 text-ink">
                        <Icon name="gift" size={16} className="text-primary" /> Gift this
                      </span>
                      <span className="mt-1 block text-xs text-ink-soft">
                        {isJewellery
                          ? 'Arrives in a cotton pouch inside recycled card — perfect for her birthday, your best friend, or yourself.'
                          : 'Wrapped in recycled card with a handwritten note. Add your message at checkout.'}
                      </span>
                    </span>
                  </label>
                </div>

                <Accordion items={accordionItems} defaultOpen={null} className="mt-12" />

                <p className="mt-8 text-xs text-ink-soft">
                  Handcrafted by local artisans in Goa. Every piece differs slightly from the next; that is the nature of
                  reclaimed glass.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-line py-24 md:py-32" aria-labelledby="related-title">
          <Container>
            <Reveal>
              <p className="eyebrow">You may also like</p>
              <h2 id="related-title" className="mt-4 text-3xl md:text-4xl">
                More from the studio
              </h2>
            </Reveal>
            <div className="mt-10 md:mt-12">
              <ProductGrid products={related} columns={Math.min(related.length, 4) || 2} />
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
