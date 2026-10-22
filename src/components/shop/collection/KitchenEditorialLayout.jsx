import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import ProductGrid from '../../product/ProductGrid'
import Button from '../../ui/Button'
import CollectionSortControl from './CollectionSortControl'
import { AddToCartButton, Crumbs, PieceCount } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { BELOW_HEADER, HEADER_PAD } from '../../../lib/collectionUi'
import { collectionLabel } from '../../../lib/collections'
import { cx } from '../../../lib/format'
import PriceTag from '../../product/PriceTag'

const SPEC_ROWS = [
  ['material', 'Material'],
  ['size', 'Size'],
  ['care', 'Care'],
]

/** Kitchen & Storage — working catalogue: typographic hero, spec cards with a side rail, compare table, trade band. */
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
              <PieceCount count={list.length} loading={loading} className="mt-2 text-ink-soft" />
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

      {/* Compare table */}
      {list.length > 1 && (
        <section className="border-y border-primary/15 bg-white py-14 md:py-20" aria-labelledby="kitchen-compare">
          <Container>
            <p className="eyebrow text-primary">At a glance</p>
            <h2 id="kitchen-compare" className="mt-3 font-display text-3xl md:text-4xl">
              Compare the range
            </h2>
            {/* Phones: one compact row per piece (a five-column table needs sideways scrolling there). */}
            <ul className="mt-8 divide-y divide-line border-y border-line md:hidden">
              {list.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${p.slug}`} className="link-underline font-display text-lg">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-soft">
                      {p.details?.size}
                    </p>
                    <p className="mt-2 text-sm tabular-nums">
                      <PriceTag product={p} />
                    </p>
                  </div>
                  <AddToCartButton
                    product={p}
                    label="Add"
                    className="h-10 shrink-0 border-primary px-4 text-primary [--btn-fill:var(--color-primary)] hover:text-cream"
                  />
                </li>
              ))}
            </ul>

            {/* `relative` keeps the visually-hidden "Buy" heading inside the scroll area. */}
            <div className="relative mt-8 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-primary text-xs uppercase tracking-eyebrow text-ink-soft">
                    <th scope="col" className="py-3 pr-4 font-medium">Piece</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Size</th>
                    <th scope="col" className="py-3 pr-4 text-right font-medium">Price</th>
                    <th scope="col" className="py-3"><span className="sr-only">Buy</span></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className="border-b border-line align-top">
                      <th scope="row" className="py-4 pr-4 font-display text-lg font-normal">
                        <Link to={`/product/${p.slug}`} className="link-underline">{p.name}</Link>
                      </th>
                      <td className="max-w-xs py-4 pr-4 text-ink-soft">{p.details?.size ?? 'n/a'}</td>
                      <td className="py-4 pr-4 text-right tabular-nums"><PriceTag product={p} /></td>
                      <td className="py-3 text-right">
                        <AddToCartButton
                          product={p}
                          label="Add"
                          className="h-9 border-primary px-4 text-primary [--btn-fill:var(--color-primary)] hover:text-cream"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* Story note */}
      <section className="py-14 md:py-20" aria-labelledby="kitchen-story">
        <Container className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="eyebrow text-primary md:col-span-3">{story.eyebrow}</p>
          <div className="md:col-span-8">
            <h2 id="kitchen-story" className="font-display text-3xl leading-snug md:text-4xl">
              {story.title}
            </h2>
            <p className="mt-5 max-w-2xl text-ink-soft">{story.body}</p>
            <Link to="/story" className="link-underline mt-6 inline-block text-sm text-primary">
              Read our story
            </Link>
          </div>
        </Container>
      </section>

      {/* Trade */}
      <section className="border-t border-line bg-cream py-14 md:py-16">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <p className="eyebrow text-primary">Hotels · Cafés · Corporate</p>
            <h2 className="mt-2 font-display text-2xl text-ink md:text-3xl">Need kitchen sets at scale?</h2>
            <p className="mt-3 text-sm text-ink-soft">Custom pours, pourers and gift boxes from our Goa studio.</p>
          </div>
          <Button to="/gifting-b2b" variant="solid" className="shrink-0">
            B2B &amp; gifting
          </Button>
        </Container>
      </section>
    </div>
  )
}
