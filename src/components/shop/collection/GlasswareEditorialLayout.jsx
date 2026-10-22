import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import ProductGrid from '../../product/ProductGrid'
import Button from '../../ui/Button'
import EditorialTitle from '../../ui/EditorialTitle'
import Accordion from '../../ui/Accordion'
import CollectionStoryPanel from '../CollectionStoryPanel'
import CollectionSortControl from './CollectionSortControl'
import { Crumbs } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { BELOW_HEADER, HEADER_PAD } from '../../../lib/collectionUi'
import { collectionLabel } from '../../../lib/collections'
import { cx } from '../../../lib/format'

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
    content: 'Each rim is thoroughly cleaned, ground, and fire-polished by hand to achieve a smooth, refined finish.',
  },
  {
    title: 'How long does delivery take?',
    content: 'Orders ship from Goa within 3 to 5 working days, packed in recycled cardboard.',
  },
]

/** Glassware — gallery shop: split hero, sticky filter bar, quick-add grid, care FAQ. */
export default function GlasswareEditorialLayout({ collection, products, loading, collectionSlug }) {
  const { editorial, banner, sort, setSort, sortOptions, heroAccent, heroRest, description } =
    useCollectionPage(collectionSlug, collection)
  const [colour, setColour] = useState('all')

  const list = useMemo(() => products ?? [], [products])
  const colours = useMemo(() => [...new Set(list.map((p) => p.colour).filter(Boolean))], [list])
  const shown = colour === 'all' ? list : list.filter((p) => p.colour === colour)

  if (!editorial) return null
  const { story } = editorial

  return (
    <div className="overflow-x-clip bg-white">
      {/* Hero: copy left, photograph right */}
      <section className={cx('bg-cream', HEADER_PAD)}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex items-center px-4 py-12 sm:px-6 md:px-10 md:py-16 lg:py-24 xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
            <div className="w-full max-w-xl">
              <Crumbs name={collectionLabel('glassware')} />
              <p className="eyebrow mt-8 text-primary">{editorial.heroEyebrow}</p>
              <EditorialTitle as="h1" size="lg" stacked accent={heroAccent} rest={heroRest} className="mt-4" />
              <p className="mt-6 max-w-xl text-balance whitespace-pre-line text-ink-soft">
                {/* "upcycling" picks up the brown of the title's accent line. */}
                {description.split(/(upcycling)/i).map((part, i) =>
                  i % 2 ? (
                    <span key={i} className="text-accent">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={`#${editorial.piecesId}`}>{editorial.hero.primary}</Button>
              </div>
              <p className="mt-12 border-t border-line pt-6 font-display text-2xl text-primary">Handcrafted in Goa</p>
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
          <ProductGrid products={shown} loading={loading} columns={4} />
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

    </div>
  )
}
