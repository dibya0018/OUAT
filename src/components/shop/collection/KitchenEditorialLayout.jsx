import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import ProductGrid from '../../product/ProductGrid'
import Button from '../../ui/Button'
import Icon from '../../ui/Icon'
import CollectionSortControl from './CollectionSortControl'
import { AddToCartButton, Crumbs, PieceCount } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { BELOW_HEADER, HEADER_PAD } from '../../../lib/collectionUi'
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

  const { trust, story } = editorial
  const list = products ?? []

  return (
    <div className="overflow-x-clip bg-sand">
      {/* Hero: type-led, with the range's features in a ruled grid */}
      <section className={cx('border-b border-primary/15 bg-white', HEADER_PAD)}>
        <Container className="py-10 md:py-16">
          <Crumbs name={collection?.name ?? 'Kitchen & Storage'} />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-primary">{editorial.heroEyebrow}</p>
              <h1 className="mt-4 font-display text-5xl leading-[1.02] text-ink md:text-6xl">
                {heroAccent} <span className="text-primary">{heroRest}</span>
              </h1>
              <p className="mt-6 max-w-xl text-ink-soft">{description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={`#${editorial.piecesId}`}>{editorial.hero.primary}</Button>
                <Button href={`#${editorial.piecesId}`} variant="text">
                  {editorial.hero.secondary}
                </Button>
              </div>
            </div>
            <ul className="grid grid-cols-2 border-t border-l border-primary/15 lg:col-span-5">
              {trust.items.map((item) => (
                <li key={item.title} className="border-r border-b border-primary/15 p-5">
                  <Icon name={item.icon === 'sparkle' ? 'check' : item.icon} size={18} className="text-primary" />
                  <p className="mt-3 font-sans text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-ink-soft">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
        <div className="relative h-48 md:h-72">
          <img
            src={banner?.src}
            alt={banner?.alt ?? ''}
            className="absolute inset-0 h-full w-full object-cover object-[65%_center]"
            fetchPriority="high"
          />
        </div>
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
                      {[p.origin && `Once a ${p.origin}`, p.details?.size].filter(Boolean).join(' · ')}
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
                    <th scope="col" className="py-3 pr-4 font-medium">Once a</th>
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
                      <td className="py-4 pr-4 text-ink-soft">{p.origin ?? '—'}</td>
                      <td className="max-w-xs py-4 pr-4 text-ink-soft">{p.details?.size ?? '—'}</td>
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
      <section className="bg-primary py-14 text-cream md:py-16">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <p className="eyebrow text-cream/80">Hotels · Cafés · Corporate</p>
            <h2 className="mt-2 font-display text-2xl text-cream md:text-3xl">Need kitchen sets at scale?</h2>
            <p className="mt-3 text-sm text-cream/85">Custom pours, pourers and gift boxes from our Goa studio.</p>
          </div>
          <Button to="/gifting-b2b" variant="inverse" className="shrink-0">
            B2B &amp; gifting
          </Button>
        </Container>
      </section>
    </div>
  )
}
