import Container from '../../ui/Container'
import ProductGrid from '../../product/ProductGrid'
import Reveal from '../../ui/Reveal'
import EditorialTitle from '../../ui/EditorialTitle'
import CollectionNewsletterBand from '../CollectionNewsletterBand'
import CollectionSortControl from './CollectionSortControl'
import { Crumbs, PieceCount } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { HEADER_PAD } from '../../../lib/collectionUi'
import { collectionLabel } from '../../../lib/collections'
import { cx } from '../../../lib/format'

const RITUAL = [
  { title: 'Trim the wick', text: 'Cut it to 5 mm before each burn for a steady, clean flame.' },
  { title: 'Let it rest', text: 'Burn for no more than four hours at a time, away from drafts.' },
  { title: 'Keep the glass', text: 'When the wax is gone, wash it out. The bottle stays on as a tumbler or vase.' },
]

/** Candles — after-dark mood: full-bleed hero, product grid, burn ritual. */
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
          <Crumbs name={collectionLabel('candles')} dark />
        </Container>
        <Container className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <EditorialTitle
            as="h1"
            size="lg"
            stacked
            inverse
            accent={heroAccent}
            rest={heroRest}
            className="hero-copy max-w-3xl"
          />
          <p className="mt-6 max-w-2xl text-balance text-lg text-cream/85">{description}</p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <a
              href={`#${editorial.piecesId}`}
              className="inline-flex h-12 items-center rounded-xs border border-cream px-8 font-sans text-sm tracking-wide text-cream transition-colors hover:bg-cream hover:text-[#17130f]"
            >
              {editorial.hero.primary}
            </a>
          </div>
        </Container>
      </section>

      {/* Candles, one feature row each */}
      <section id={editorial.piecesId} className="scroll-mt-24 bg-cream py-16 text-ink md:py-24" aria-label="Candles">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <PieceCount count={list.length} loading={loading} className="text-ink-soft" />
            <CollectionSortControl
              id={`${collectionSlug}-sort`}
              sort={sort}
              onSortChange={setSort}
              sortOptions={sortOptions}
            />
          </div>
          <ProductGrid products={list} loading={loading} columns={4} className="mt-10 md:mt-12" />
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
