import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import Button from '../../ui/Button'
import EditorialTitle from '../../ui/EditorialTitle'
import Accordion from '../../ui/Accordion'
import CollectionStoryPanel from '../CollectionStoryPanel'
import CollectionNewsletterBand from '../CollectionNewsletterBand'
import CollectionSortControl from './CollectionSortControl'
import { AddToCartButton, Crumbs, PieceCount, ProductPhoto, StockBadge } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { BELOW_HEADER, HEADER_PAD } from '../../../lib/collectionUi'
import { cx, formatPrice } from '../../../lib/format'

const FAQ = [
  {
    title: 'Can it go in the dishwasher?',
    content: 'Yes, on a gentle cycle. Avoid sudden temperature changes, as you would with any glass.',
  },
  {
    title: 'Why does each piece look slightly different?',
    content:
      'Every piece is cut from a real bottle and finished by hand, so the tint, height and weight vary a little. That is the character of reclaimed glass, not a flaw.',
  },
  {
    title: 'Is the rim safe to drink from?',
    content: 'Each rim is ground and polished by hand until it is smooth to the lip.',
  },
  {
    title: 'How long does delivery take?',
    content: 'Orders ship from Goa within 3–5 working days, packed in recycled card.',
  },
]

/** Shop tile with quick add: the photo carries the badge and the add button. */
function GlassCard({ product, priority }) {
  return (
    <article className="group">
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block" aria-label={product.name}>
          <ProductPhoto product={product} priority={priority} className="aspect-product w-full" />
        </Link>
        <StockBadge product={product} className="absolute top-3 left-3" />
        <div className="absolute inset-x-3 bottom-3 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <AddToCartButton
            product={product}
            label="Quick add"
            className="w-full border-white bg-white/95 text-primary backdrop-blur-sm hover:border-primary hover:bg-primary hover:text-cream"
          />
        </div>
      </div>
      <Link to={`/product/${product.slug}`} className="mt-4 block text-ink">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 font-display text-lg leading-tight">{product.name}</h3>
          <p className="shrink-0 font-sans text-sm tabular-nums">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          {[product.colour, product.origin && `once a ${product.origin}`].filter(Boolean).join(' · ')}
        </p>
      </Link>
    </article>
  )
}

/** Glassware — gallery shop: split hero, sticky filter bar, quick-add grid, care FAQ. */
export default function GlasswareEditorialLayout({ collection, products, loading, collectionSlug }) {
  const { editorial, banner, sort, setSort, sortOptions, heroAccent, heroRest, description } =
    useCollectionPage(collectionSlug, collection)
  const [colour, setColour] = useState('all')

  const list = useMemo(() => products ?? [], [products])
  const colours = useMemo(() => [...new Set(list.map((p) => p.colour).filter(Boolean))], [list])
  const shown = colour === 'all' ? list : list.filter((p) => p.colour === colour)

  if (!editorial) return null
  const { story, newsletter } = editorial

  return (
    <div className="overflow-x-clip bg-white">
      {/* Hero: copy left, photograph right */}
      <section className={cx('bg-cream', HEADER_PAD)}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex items-center px-4 py-12 sm:px-6 md:px-10 md:py-16 lg:py-24 xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
            <div className="w-full max-w-xl">
              <Crumbs name={collection?.name ?? 'Glassware'} />
              <p className="eyebrow mt-8 text-primary">{editorial.heroEyebrow}</p>
              <EditorialTitle as="h1" size="xl" accent={heroAccent} rest={heroRest} className="mt-4" />
              <p className="mt-6 max-w-lg text-ink-soft">{description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={`#${editorial.piecesId}`}>Shop glassware</Button>
                <Button to="/impact" variant="text">
                  How it helps the planet
                </Button>
              </div>
              <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6">
                <div>
                  <dt className="text-xs text-ink-soft">In the collection</dt>
                  <dd className="mt-1 font-display text-2xl text-primary">{loading ? '—' : list.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Made in</dt>
                  <dd className="mt-1 font-display text-2xl text-primary">Goa</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Ships in</dt>
                  <dd className="mt-1 font-display text-2xl text-primary">3–5 days</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="relative min-h-[20rem] lg:min-h-[38rem]">
            <img
              src={banner?.src}
              alt={banner?.alt ?? ''}
              className="absolute inset-0 h-full w-full object-cover object-[80%_center]"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* Sticky filter + sort bar */}
      <div
        id={editorial.piecesId}
        className={cx('sticky z-30 scroll-mt-24 border-b border-line bg-white/95 backdrop-blur-sm', BELOW_HEADER)}
      >
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <PieceCount count={shown.length} loading={loading} className="shrink-0 text-ink-soft" />
            {colours.length > 1 && (
              <ul className="flex gap-2 overflow-x-auto" aria-label="Filter by glass colour">
                {['all', ...colours].map((c) => (
                  <li key={c} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={colour === c}
                      onClick={() => setColour(c)}
                      className={cx(
                        'h-9 rounded-full border px-4 font-sans text-xs tracking-wide transition-colors',
                        colour === c
                          ? 'border-primary bg-primary text-cream'
                          : 'border-line text-ink-soft hover:border-primary hover:text-primary',
                      )}
                    >
                      {c === 'all' ? 'All' : c}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CollectionSortControl id={`${collectionSlug}-sort`} sort={sort} onSortChange={setSort} sortOptions={sortOptions} />
        </Container>
      </div>

      {/* Grid */}
      <section className="py-12 md:py-16" aria-label="Glassware pieces">
        <Container>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3" aria-busy="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-product w-full animate-pulse bg-sand" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <p className="py-20 text-center text-ink-soft">No pieces here yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-3">
              {shown.map((product, i) => (
                <li key={product.id} className="min-w-0">
                  <GlassCard product={product} priority={i < 3} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <CollectionStoryPanel {...story} textClass="bg-[#f7f4eb]" />

      {/* Care + questions */}
      <section className="py-16 md:py-24" aria-labelledby="glassware-faq">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-primary">Good to know</p>
              <h2 id="glassware-faq" className="mt-3 font-display text-3xl md:text-4xl">
                Care and questions
              </h2>
              <p className="mt-4 text-sm text-ink-soft">
                Anything else? <Link to="/contact" className="link-underline text-primary">Write to us</Link>.
              </p>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <Accordion items={FAQ} />
            </div>
          </div>
        </Container>
      </section>

      <CollectionNewsletterBand {...newsletter} />
    </div>
  )
}
