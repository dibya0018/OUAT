import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import Reveal from '../../ui/Reveal'
import EditorialTitle from '../../ui/EditorialTitle'
import CollectionNewsletterBand from '../CollectionNewsletterBand'
import CollectionSortControl from './CollectionSortControl'
import { AddToCartButton, Crumbs, PieceCount, ProductPhoto, StockBadge } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { HEADER_PAD } from '../../../lib/collectionUi'
import { cx } from '../../../lib/format'
import PriceTag from '../../product/PriceTag'

/** The three scents in the range, as described on the product pages. */
const SCENTS = [
  { name: 'Cedar & orange peel', mood: 'Warm and woody, for the evening.', glass: 'Amber glass' },
  { name: 'Sea salt & sage', mood: 'Clean and grounding, for the morning.', glass: 'Green glass' },
  { name: 'Unscented', mood: 'Only the glow, nothing else.', glass: 'Clear glass' },
]

const RITUAL = [
  { title: 'Trim the wick', text: 'Cut it to 5 mm before each burn for a steady, clean flame.' },
  { title: 'Let it rest', text: 'Burn for no more than four hours at a time, away from drafts.' },
  { title: 'Keep the glass', text: 'When the wax is gone, wash it out. The bottle stays on as a tumbler or vase.' },
]

/** One candle as a wide feature row: photo on one side, story and buy box on the other. */
function CandleRow({ product, index }) {
  const flip = index % 2 === 1
  return (
    <Reveal as="li" className="group grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
      <Link
        to={`/product/${product.slug}`}
        className={cx('relative block', flip && 'md:order-2')}
        aria-label={product.name}
      >
        <ProductPhoto product={product} priority={index === 0} className="aspect-[5/4] w-full ring-1 ring-cream/10" />
        <StockBadge product={product} className="absolute top-4 left-4" />
      </Link>
      <div className={cx('max-w-md', flip && 'md:order-1 md:ml-auto')}>
        <p className="font-display text-5xl font-light text-accent/80">{String(index + 1).padStart(2, '0')}</p>
        <h3 className="mt-3 font-display text-3xl text-cream md:text-4xl">
          <Link to={`/product/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        {product.origin && (
          <p className="mt-2 font-sans text-xs uppercase tracking-eyebrow text-cream/60">
            Once a {product.origin}
          </p>
        )}
        {product.shortStory && <p className="mt-5 text-cream/80">{product.shortStory}</p>}
        {product.details?.size && (
          <p className="mt-4 border-t border-cream/15 pt-4 text-sm text-cream/60">{product.details.size}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <p className="font-display text-2xl text-cream tabular-nums"><PriceTag product={product} /></p>
          <AddToCartButton
            product={product}
            className="border-cream bg-cream text-[#1f1b17] [--btn-fill:var(--color-primary)] hover:border-primary hover:text-cream"
          />
          <Link to={`/product/${product.slug}`} className="link-underline text-sm text-cream/80">
            Details
          </Link>
        </div>
      </div>
    </Reveal>
  )
}

/** Candles — after-dark mood: full-bleed hero, scent guide, one feature row per candle, burn ritual. */
export default function CandlesEditorialLayout({ collection, products, loading, collectionSlug }) {
  const { editorial, banner, sort, setSort, sortOptions, heroAccent, heroRest, description } =
    useCollectionPage(collectionSlug, collection)
  if (!editorial) return null

  const { story, newsletter } = editorial
  const list = products ?? []

  return (
    <div className="overflow-x-clip bg-[#17130f] text-cream">
      {/* Hero: full-bleed dusk photograph, centred copy */}
      <section className={cx('relative isolate flex min-h-[34rem] flex-col md:min-h-[44rem]', HEADER_PAD)}>
        <img
          src={banner?.src}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center]"
          fetchPriority="high"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#17130f]/70 via-[#17130f]/55 to-[#17130f]" />
        <Container className="pt-6">
          <Crumbs name={collection?.name ?? 'Candles'} dark />
        </Container>
        <Container className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="eyebrow text-accent">{editorial.heroEyebrow}</p>
          <EditorialTitle
            as="h1"
            size="xl"
            inverse
            accent={heroAccent}
            rest={heroRest}
            className="hero-copy mt-5 max-w-3xl"
          />
          <p className="mt-6 max-w-xl text-cream/85">{description}</p>
          <a
            href={`#${editorial.piecesId}`}
            className="mt-10 inline-flex h-12 items-center rounded-xs border border-cream px-8 font-sans text-sm tracking-wide text-cream transition-colors hover:bg-cream hover:text-[#17130f]"
          >
            Choose your candle
          </a>
        </Container>
      </section>

      {/* Scent guide */}
      <section className="border-y border-cream/10 py-14 md:py-20" aria-labelledby="scent-guide">
        <Container>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-accent">Scent guide</p>
              <h2 id="scent-guide" className="mt-3 font-display text-3xl text-cream md:text-4xl">
                Three quiet scents
              </h2>
            </div>
            <p className="max-w-sm text-sm text-cream/60">100% soy wax and a cotton wick, poured by hand in Goa.</p>
          </div>
          <ul className="mt-10 grid grid-cols-1 divide-y divide-cream/10 border-y border-cream/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {SCENTS.map((s, i) => (
              <Reveal as="li" key={s.name} delay={i * 80} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="font-sans text-xs uppercase tracking-eyebrow text-cream/50">{s.glass}</p>
                <h3 className="mt-3 font-display text-2xl text-cream">{s.name}</h3>
                <p className="mt-2 text-sm text-cream/70">{s.mood}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Candles, one feature row each */}
      <section id={editorial.piecesId} className="scroll-mt-24 py-16 md:py-24" aria-label="Candles">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream/15 pb-6">
            <PieceCount count={list.length} loading={loading} className="text-cream/70" />
            <CollectionSortControl
              id={`${collectionSlug}-sort`}
              sort={sort}
              onSortChange={setSort}
              sortOptions={sortOptions}
              className="text-cream [&_.eyebrow]:text-cream/70 [&_option]:text-ink [&_select]:border-cream/30 [&_select]:text-cream"
            />
          </div>
          {loading ? (
            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2" aria-busy="true">
              <div className="aspect-[5/4] animate-pulse bg-cream/5" />
              <div className="aspect-[5/4] animate-pulse bg-cream/5" />
            </div>
          ) : list.length === 0 ? (
            <p className="py-20 text-center text-cream/70">No candles here yet.</p>
          ) : (
            <ul className="mt-14 flex flex-col gap-20 md:gap-28">
              {list.map((product, i) => (
                <CandleRow key={product.id} product={product} index={i} />
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* Burn ritual */}
      <section className="bg-cream py-16 text-ink md:py-24" aria-labelledby="burn-ritual">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow text-accent">The ritual</p>
              <h2 id="burn-ritual" className="mt-3 font-display text-3xl md:text-4xl">
                Burn it well, then keep the glass
              </h2>
              <p className="mt-5 text-ink-soft">{story.body}</p>
            </div>
            <ol className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
              {RITUAL.map((r, i) => (
                <Reveal as="li" key={r.title} delay={i * 80} className="border-t border-accent/30 pt-5">
                  <span className="font-display text-3xl font-light text-accent">{i + 1}</span>
                  <h3 className="mt-2 font-display text-xl">{r.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{r.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <CollectionNewsletterBand {...newsletter} variant="dark" />
    </div>
  )
}
