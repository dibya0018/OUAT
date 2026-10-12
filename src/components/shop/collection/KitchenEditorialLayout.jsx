import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import Button from '../../ui/Button'
import Icon from '../../ui/Icon'
import CollectionSortControl from './CollectionSortControl'
import { AddToCartButton, Crumbs, PieceCount, ProductPhoto, StockBadge } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { BELOW_HEADER, HEADER_PAD } from '../../../lib/collectionUi'
import { cx, formatPrice } from '../../../lib/format'

const SPEC_ROWS = [
  ['material', 'Material'],
  ['size', 'Size'],
  ['care', 'Care'],
]

/** Catalogue entry: photo left, name, specs and buy box right. */
function SpecCard({ product, index }) {
  const specs = SPEC_ROWS.filter(([key]) => product.details?.[key])
  return (
    <li
      id={`piece-${product.slug}`}
      className="group grid scroll-mt-28 grid-cols-1 border border-primary/15 bg-white sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <Link to={`/product/${product.slug}`} className="relative block" aria-label={product.name}>
        <ProductPhoto product={product} priority={index < 2} className="aspect-square h-full w-full" />
        <StockBadge product={product} className="absolute top-3 left-3" />
      </Link>
      <div className="flex flex-col p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-sans text-xs tracking-eyebrow text-ink-soft">No. {String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-1 font-display text-2xl leading-tight md:text-3xl">
              <Link to={`/product/${product.slug}`} className="link-underline">
                {product.name}
              </Link>
            </h3>
          </div>
          <p className="shrink-0 font-sans text-lg tabular-nums text-primary">{formatPrice(product.price)}</p>
        </div>
        {product.shortStory && <p className="mt-3 text-sm text-ink-soft">{product.shortStory}</p>}
        {specs.length > 0 && (
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            {specs.map(([key, label]) => (
              <div key={key} className="grid grid-cols-[5.5rem_1fr] gap-3 py-2.5">
                <dt className="font-sans text-xs uppercase tracking-eyebrow text-ink-soft">{label}</dt>
                <dd className="text-ink">{product.details[key]}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-auto sm:pt-6">
          <AddToCartButton
            product={product}
            className="border-primary bg-primary text-cream hover:border-primary-hover hover:bg-primary-hover"
          />
          <Link to={`/product/${product.slug}`} className="link-underline text-sm text-primary">
            Full details
          </Link>
        </div>
      </div>
    </li>
  )
}

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
                <Button href={`#${editorial.piecesId}`}>Browse the catalogue</Button>
                <Button to="/gifting-b2b" variant="text">
                  Buying for a café or hotel?
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
              {list.length > 1 && (
                <nav aria-label="Jump to a piece" className="mt-8 hidden border-t border-primary/15 pt-6 lg:block">
                  <ul className="flex flex-col gap-2 text-sm">
                    {list.map((p) => (
                      <li key={p.id}>
                        <a href={`#piece-${p.slug}`} className="link-underline text-ink-soft hover:text-primary">
                          {p.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </aside>

            {loading ? (
              <div className="flex flex-col gap-6" aria-busy="true">
                <div className="h-64 animate-pulse bg-white" />
                <div className="h-64 animate-pulse bg-white" />
              </div>
            ) : list.length === 0 ? (
              <p className="py-20 text-center text-ink-soft">No pieces here yet.</p>
            ) : (
              <ul className="flex flex-col gap-6">
                {list.map((product, i) => (
                  <SpecCard key={product.id} product={product} index={i} />
                ))}
              </ul>
            )}
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
            <div className="mt-8 overflow-x-auto">
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
                      <td className="py-4 pr-4 text-right tabular-nums">{formatPrice(p.price)}</td>
                      <td className="py-3 text-right">
                        <AddToCartButton
                          product={p}
                          label="Add"
                          className="h-9 border-primary px-4 text-primary hover:bg-primary hover:text-cream"
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
