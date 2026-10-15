import { Link } from 'react-router-dom'
import Container from '../../ui/Container'
import ProductGrid from '../../product/ProductGrid'
import Button from '../../ui/Button'
import EditorialTitle from '../../ui/EditorialTitle'
import CollectionNewsletterBand from '../CollectionNewsletterBand'
import JewellerySurface from '../JewellerySurface'
import CollectionSortControl from './CollectionSortControl'
import JewelleryComingSoon from './JewelleryComingSoon'
import { Crumbs, PieceCount } from './parts'
import { useCollectionPage } from './useCollectionPage'
import { HEADER_PAD } from '../../../lib/collectionUi'
import { cx } from '../../../lib/format'

/** Set to false to open the collection: removes the frosted "Coming soon" pane. */
const COMING_SOON = true

const PROMISES =['One of a kind', 'Set in brass by hand', 'Gift-ready pouch', 'Women-led studio']

/** Tall arched photo frame used either side of the hero copy. */
function Arch({ src, alt, className }) {
  return (
    <div className={cx('overflow-hidden rounded-t-full border border-accent/20 bg-white p-2', className)}>
      <img src={src} alt={alt} className="aspect-[3/4] h-full w-full rounded-t-full object-cover" loading="eager" />
    </div>
  )
}

/** Jewellery — boutique: arched centred hero, promise ribbon, two-up showcase, gifting spread. */
export default function JewelleryEditorialLayout({ collection, products, loading, collectionSlug }) {
  const { editorial, sort, setSort, sortOptions, heroAccent, heroRest, description } = useCollectionPage(
    collectionSlug,
    collection,
  )
  if (!editorial) return null

  const { categories, trust, story, newsletter } = editorial
  const [pendant, earrings] = categories.links
  const gift = trust.items.find((item) => item.icon === 'gift')
  const list = products ?? []

  return (
    <div className="relative overflow-x-clip" style={{ backgroundColor: editorial.pageBg }}>
      {COMING_SOON && <JewelleryComingSoon />}
      {/* While the collection is not open, the layout below is only a blurred backdrop. */}
      <div inert={COMING_SOON} aria-hidden={COMING_SOON || undefined}>
      {/* Hero: centred copy between two arched portraits */}
      <section className={cx('relative', HEADER_PAD)}>
        <JewellerySurface className="opacity-50" />
        <Container className="relative py-10 md:py-16">
          <Crumbs name={collection?.name ?? 'Jewellery'} className="flex justify-center" />
          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_minmax(0,30rem)_1fr] lg:gap-14">
            <Arch src={pendant.imageSrc} alt={pendant.imageAlt} className="mx-auto hidden w-full max-w-[15rem] lg:block" />
            <div className="text-center">
              <p className="eyebrow text-accent">{editorial.heroEyebrow}</p>
              <EditorialTitle as="h1" size="xl" accent={heroAccent} rest={heroRest} className="mt-5" />
              <p className="mx-auto mt-6 max-w-md text-ink-soft">{description}</p>
              {editorial.hero.tagline && (
                <p className="mx-auto mt-4 max-w-md font-display text-lg italic text-ink/90">{editorial.hero.tagline}</p>
              )}
              <div className="mt-9 flex flex-col items-center gap-4">
                <a
                  href={`#${editorial.piecesId}`}
                  className="inline-flex h-12 items-center rounded-full border border-accent bg-accent px-9 font-sans text-sm tracking-wide text-cream transition-colors hover:border-accent-hover hover:bg-accent-hover"
                >
                  {editorial.hero.primary}
                </a>
                <Button href={`#${editorial.piecesId}`} variant="text" className="text-accent">
                  {editorial.hero.secondary}
                </Button>
              </div>
            </div>
            <Arch
              src={earrings.imageSrc}
              alt={earrings.imageAlt}
              className="mx-auto w-full max-w-[13rem] lg:mt-16 lg:max-w-[15rem]"
            />
          </div>
        </Container>
      </section>

      {/* Promise ribbon */}
      <div className="bg-accent py-4 text-cream">
        <ul className="mx-auto flex max-w-site flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4">
          {PROMISES.map((p) => (
            <li key={p} className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.2em]">
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-cream/70" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Showcase: two large centred pieces per row */}
      <section id={editorial.piecesId} className="relative scroll-mt-24 py-16 md:py-24" aria-labelledby="jewellery-title">
        <Container className="relative">
          <header className="text-center">
            <p className="eyebrow text-accent">The collection</p>
            <h2 id="jewellery-title" className="mt-3 font-display text-4xl text-ink md:text-5xl">
              Worn close, kept long
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-accent/15 py-3">
              <PieceCount count={list.length} loading={loading} className="text-ink-soft" />
              <CollectionSortControl
                id={`${collectionSlug}-sort`}
                sort={sort}
                onSortChange={setSort}
                sortOptions={sortOptions}
                className="[&_select]:text-accent"
              />
            </div>
          </header>
          <ProductGrid products={list} loading={loading} columns={4} className="mt-14" />
        </Container>
      </section>

      {/* Gifting spread */}
      <section className="bg-white" aria-labelledby="jewellery-gift">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[22rem] lg:min-h-[34rem]">
            <img
              src={story.image}
              alt={story.imageAlt}
              className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
              loading="lazy"
            />
          </div>
          <div className="flex items-center px-6 py-14 sm:px-10 lg:px-16">
            <div className="max-w-md">
              <p className="eyebrow text-accent">{story.eyebrow}</p>
              <h2 id="jewellery-gift" className="mt-4 font-display text-3xl leading-snug md:text-4xl">
                {story.title}
              </h2>
              <p className="mt-5 text-ink-soft">{story.body}</p>
              {gift && (
                <p className="mt-8 border-l-2 border-accent pl-5 font-display text-xl text-ink">
                  {gift.title}. <span className="text-ink-soft">{gift.text}</span>
                </p>
              )}
              <Link to="/story" className="link-underline mt-8 inline-block text-sm text-accent">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CollectionNewsletterBand {...newsletter} />
      </div>
    </div>
  )
}
