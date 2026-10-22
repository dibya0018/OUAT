import { useSearchParams } from 'react-router-dom'
import Container from '../ui/Container'
import ProductGrid from '../product/ProductGrid'
import EditorialTitle, { splitEditorialTitle } from '../ui/EditorialTitle'
import ShopCatalogToolbar from './ShopCatalogToolbar'
import { cx } from '../../lib/format'
import JewellerySurface from './JewellerySurface'
import JewelleryGoaDecor from '../motifs/JewelleryGoaDecor'
import { FloralDivider } from '../motifs/Florals'

/**
 * @param {object} props
 * @param {object|null} props.collection
 * @param {string|null} props.activeSlug
 * @param {object} [props.theme] — from collectionThemes.js
 */
export default function ShopCatalog({
  collection,
  activeSlug,
  collections,
  products,
  loading,
  theme,
  heroExtra,
  decor,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'featured'

  const title = collection?.name ?? 'All Collections'
  const { accent: titleAccent, rest: titleRest } = splitEditorialTitle(title)
  const description = collection?.description

  const heroClass = theme?.hero ?? 'section-white'
  const bodyClass = theme?.body ?? 'section-white'
  const onDark = theme?.titleOnDark
  const alignCenter = theme?.heroAlign === 'center'
  const audienceLine = collection?.audienceLine
  const heroEyebrow = theme?.eyebrow ?? (collection ? collection.name : 'Shop')

  return (
    <>
      <section className={cx('relative pb-10 pt-8 md:pb-16 md:pt-14', heroClass)}>
        {theme?.texture === 'jewellery' && <JewellerySurface />}
        {theme?.texture === 'jewellery' ? <JewelleryGoaDecor /> : decor}
        <Container className={cx('relative', alignCenter && 'text-center')}>
          {heroExtra}
          <header className={cx('max-w-2xl', alignCenter && 'mx-auto')}>
            <p className={cx('eyebrow', onDark && 'text-cream/85', theme?.texture === 'jewellery' && 'text-accent')}>
              {heroEyebrow}
            </p>
            {onDark ? (
              <EditorialTitle
                as="h1"
                size="lg"
                onDark
                accent={titleAccent}
                rest={titleRest}
                className="mt-4"
              />
            ) : (
              <EditorialTitle as="h1" size="lg" accent={titleAccent} rest={titleRest} className="mt-4" />
            )}
            {collection?.tagline && (
              <p className={cx('mt-4 font-display text-xl text-ink', onDark && 'text-cream')}>
                {collection.tagline}
              </p>
            )}
            {description && (
              <p className={cx('mt-4 text-base', theme?.introClass ?? 'text-ink-soft')}>{description}</p>
            )}
            {audienceLine && (
              <p className="mt-6 font-display text-lg leading-snug text-ink italic md:text-xl">{audienceLine}</p>
            )}
            {theme?.texture === 'jewellery' && (
              <FloralDivider className={cx('mt-8', alignCenter && 'mx-auto')} />
            )}
          </header>
        </Container>
      </section>

      <section className={cx('relative pb-24 md:pb-32', bodyClass)}>
        {theme?.texture === 'jewellery' && (
          <>
            <JewellerySurface className="opacity-90" />
            <JewelleryGoaDecor />
          </>
        )}
        <Container className="relative">
          <ShopCatalogToolbar
            collections={collections}
            activeSlug={activeSlug}
            sort={sort}
            onSortChange={(nextSort) => {
              const next = new URLSearchParams(searchParams)
              if (nextSort === 'featured') next.delete('sort')
              else next.set('sort', nextSort)
              setSearchParams(next, { replace: true })
            }}
          />

          <div className="mt-8 md:mt-12">
            <p className="sr-only" aria-live="polite">
              {products ? `${products.length} pieces` : 'Loading pieces'}
            </p>
            <ProductGrid
              products={products ?? []}
              loading={loading}
              columns={theme?.gridColumns ?? 4}
            />
          </div>
        </Container>
      </section>
    </>
  )
}
