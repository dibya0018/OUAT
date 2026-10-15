import { useCallback, useEffect, useRef, useState } from 'react'
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
import PriceTag from '../components/product/PriceTag'
import ProductImpact from '../components/product/ProductImpact'
import ProductOffers from '../components/product/ProductOffers'
import ProductReviews from '../components/product/ProductReviews'
import ProductVideo from '../components/product/ProductVideo'
import NotFoundPage from './NotFoundPage'
import { useCart } from '../hooks/useCart'
import { useCheckout } from '../hooks/useCheckout'
import { buildCheckoutLine } from '../lib/checkoutLine'
import { getCollectionBySlug, getProductBySlug, getRelatedProducts } from '../services/productService'
import { trackEvent } from '../lib/analytics'
import { cx } from '../lib/format'
import JewellerySurface from '../components/shop/JewellerySurface'
import JewelleryGoaDecor from '../components/motifs/JewelleryGoaDecor'
import { getCollectionPath } from '../lib/collections'
import { stockState } from '../lib/collectionUi'
import { defaultOption, offerFor, packOptions } from '../lib/productOffer'
import { SITE } from '../lib/site'
import { PRODUCT_FAQ } from '../data/productFaq'

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

  // Size / pack options (when the product has them) each carry their own price and stock.
  const options = packOptions(product)
  const [option, setOption] = useState(() => defaultOption(product)?.size ?? null)
  const offer = offerFor(product, option)
  const [reviewSummary, setReviewSummary] = useState({ count: 0, average: 0 })
  const onReviewsLoaded = useCallback((res) => setReviewSummary({ count: res.count, average: res.average }), [])

  // Unknown quantity (mock catalogue) counts as in stock.
  const soldOut = stockState(product, option) === 'out'
  const maxQty = Math.min(99, offer.stock ?? 99)
  const benefits = Array.isArray(product.details?.benefits) ? product.details.benefits.filter(Boolean) : []

  // Phones: once the buy buttons scroll out of view, a slim bar keeps "Add to cart" within thumb reach.
  const buyRef = useRef(null)
  const [buyInView, setBuyInView] = useState(true)
  useEffect(() => {
    const el = buyRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setBuyInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const chooseOption = (size) => {
    setOption(size)
    setQty(1)
  }

  const onAdd = () => {
    if (soldOut) return
    addItem(product, { qty, gift, option })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const onBuyNow = () => {
    if (soldOut) return
    const line = buildCheckoutLine(product, { qty, gift, option })
    addItem(product, { qty, gift, option, open: false })
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
      price: offer.price,
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(reviewSummary.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewSummary.average,
        reviewCount: reviewSummary.count,
      },
    }),
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
              <ProductVideo url={product.details?.videoUrl} name={product.name} className="mt-6" />
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
                <p className="mt-4 font-sans text-lg">
                  <PriceTag product={product} option={option} />
                </p>
                {reviewSummary.count > 0 && (
                  <a href="#reviews-title" className="link-underline mt-2 inline-block text-xs text-ink-soft">
                    <span className="text-accent">★</span> {reviewSummary.average} · {reviewSummary.count} review
                    {reviewSummary.count === 1 ? '' : 's'}
                  </a>
                )}

                <p className="mt-8 text-base leading-relaxed text-ink md:text-lg">{product.shortStory}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>
                {isJewellery && collection?.audienceLine && (
                  <p className="mt-6 text-base leading-relaxed text-ink">
                    {collection.audienceLine}
                  </p>
                )}

                {benefits.length > 0 && (
                  <ul className="mt-6 flex flex-col gap-2 text-sm text-ink">
                    {benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Purchase controls */}
                <div ref={buyRef} className="mt-10 flex flex-col gap-6">
                  {options.length > 0 && (
                    <fieldset>
                      <legend className="eyebrow">Size / pack</legend>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {options.map((o) => {
                          const out = stockState(product, o.size) === 'out'
                          return (
                            <button
                              key={o.size}
                              type="button"
                              aria-pressed={option === o.size}
                              onClick={() => chooseOption(o.size)}
                              className={cx(
                                'rounded-xs border px-4 py-2 text-left text-sm transition-colors duration-200',
                                option === o.size
                                  ? 'border-primary bg-primary text-cream'
                                  : 'border-line text-ink hover:border-primary',
                                out && 'opacity-60',
                              )}
                            >
                              <span className="block">{o.size}</span>
                              <span className="block text-xs opacity-80">
                                {out ? 'Sold out' : o.badge || <PriceTag product={product} option={o.size} />}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>
                  )}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="inline-flex w-fit items-center border border-line" role="group" aria-label="Quantity">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center text-primary hover:bg-sand"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={soldOut}
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
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={soldOut || qty >= maxQty}
                        aria-label="Increase quantity"
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                    <Button onClick={onAdd} disabled={soldOut} className="w-full sm:flex-1" aria-live="polite">
                      {soldOut ? (
                        'Sold out'
                      ) : added ? (
                        <>
                          <Icon name="check" size={16} /> Added
                        </>
                      ) : (
                        'Add to cart'
                      )}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={onBuyNow} disabled={soldOut} fullWidth>
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

                <ProductOffers className="mt-10" />

                {/* Upcycling note */}
                <p className="mt-10 border border-line p-5 text-sm leading-relaxed text-ink-soft">
                  Our products are upcycled from materials that were once considered waste once upon a time. This
                  process may result in variations, flaws, and imperfections, which are natural in handmade items.
                  These unique characteristics should be celebrated for their uniqueness.
                </p>

                <Accordion items={accordionItems} defaultOpen={null} className="mt-12" />

                <p className="mt-8 text-xs text-ink-soft">Handcrafted by local artisans in Goa.</p>
              </div>
            </div>
          </div>
        </Container>
      </article>

      {/* Mobile buy bar */}
      <div
        className={cx(
          'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] transition-transform duration-300 md:hidden',
          buyInView ? 'translate-y-full' : 'translate-y-0',
        )}
        aria-hidden={buyInView}
        data-mobile-buy-bar
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{product.name}</p>
            <p className="text-sm tabular-nums text-ink-soft">
              <PriceTag product={product} option={option} />
            </p>
          </div>
          <Button onClick={onAdd} disabled={soldOut} tabIndex={buyInView ? -1 : 0} className="shrink-0">
            {soldOut ? 'Sold out' : added ? 'Added' : 'Add to cart'}
          </Button>
        </div>
      </div>

      <ProductImpact product={product} />

      <ProductReviews productId={product.id} productName={product.name} onLoaded={onReviewsLoaded} />

      {/* FAQ */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="faq-title">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
            <Reveal className="md:col-span-4">
              <p className="eyebrow">Good to know</p>
              <h2 id="faq-title" className="mt-4 text-3xl md:text-4xl">
                Frequently asked questions
              </h2>
            </Reveal>
            <Reveal delay={100} className="md:col-span-7 md:col-start-6">
              <Accordion items={PRODUCT_FAQ} />
            </Reveal>
          </div>
        </Container>
      </section>

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
