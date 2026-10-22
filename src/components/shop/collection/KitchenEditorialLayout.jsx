import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import ProductGrid from '../../product/ProductGrid'
import Button from '../../ui/Button'
import CollectionSortControl from './CollectionSortControl'
import { Crumbs } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { BELOW_HEADER, HEADER_PAD } from '../../../lib/collectionUi'
import { collectionLabel } from '../../../lib/collections'
import { cx } from '../../../lib/format'

const SPEC_ROWS = [
  ['material', 'Material'],
  ['size', 'Size'],
  ['care', 'Care'],
]

/** Kitchen & Storage — working catalogue: typographic hero, spec cards with a side rail. */
export default function KitchenEditorialLayout({ collection, products, loading, collectionSlug }) {
  const { editorial, banner, sort, setSort, sortOptions, heroAccent, heroRest, description } =
    useCollectionPage(collectionSlug, collection)
  if (!editorial) return null

  const { story } = editorial
  const list = products ?? []

  return (
    <div className="overflow-x-clip bg-sand">
      {/* Hero: banner photo behind, cream fade on the left so the dark copy stays readable */}
      <section className={cx('relative isolate overflow-hidden border-b border-primary/15 bg-white', HEADER_PAD)}>
        {banner?.src && (
          <img
            src={banner.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]"
            fetchPriority="high"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-cream via-cream/85 to-cream/10 max-lg:to-cream/60"
        />
        <Container className="py-14 md:py-24">
          <Crumbs name={collectionLabel('kitchen-storage')} />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-primary">{editorial.heroEyebrow}</p>
              <h1 className="mt-4 font-display text-[2rem] leading-[1.1] text-ink sm:text-4xl md:text-5xl">
                <span className="block">{heroAccent}</span> <span className="block text-primary">{heroRest}</span>
              </h1>
              <p className="mt-6 max-w-xl text-balance text-ink-soft">{description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={`#${editorial.piecesId}`}>{editorial.hero.primary}</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Catalogue with side rail */}
      <section id={editorial.piecesId} className="scroll-mt-24 py-12 md:py-20" aria-label="Kitchen and storage pieces">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
            <aside className={cx('lg:sticky lg:self-start lg:pt-8', BELOW_HEADER)}>
              <p className="eyebrow text-primary">Catalogue</p>
              <CollectionSortControl
                id={`${collectionSlug}-sort`}
                sort={sort}
                onSortChange={setSort}
                sortOptions={sortOptions}
                className="mt-6 flex-col items-start gap-2"
              />
            </aside>

            <ProductGrid products={list} loading={loading} columns={3} />
          </div>
        </Container>
      </section>

      {/* Story note */}
      <section className="py-14 md:py-20" aria-labelledby="kitchen-story">
        <Container className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {story.eyebrow && <p className="eyebrow text-primary md:col-span-3">{story.eyebrow}</p>}
          <div className="md:col-span-8 md:col-start-4">
            <h2 id="kitchen-story" className="font-display text-3xl leading-snug md:text-4xl">
              {story.titleAccent && <span className="block text-primary">{story.titleAccent}</span>}
              {story.title}
            </h2>
            {story.body && <p className="mt-5 max-w-2xl text-ink-soft">{story.body}</p>}
            <Link to="/story" className="link-underline mt-6 inline-block text-sm text-primary">
              Read our story
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
