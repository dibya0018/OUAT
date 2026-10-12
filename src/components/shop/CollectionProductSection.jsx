import Container from '../ui/Container'
import ProductGrid from '../product/ProductGrid'
import ShopCatalogToolbar from './ShopCatalogToolbar'

/** Shared catalog grid + sort for collection-themed pages. */
export default function CollectionProductSection({
  id = 'collection-pieces',
  className = 'relative pb-24 pt-12 md:pb-32 md:pt-16',
  products,
  loading,
  collections,
  activeSlug,
  sort,
  onSortChange,
  gridColumns = 3,
  header,
}) {
  return (
    <section id={id} className={className}>
      <Container>
        {header}
        <ShopCatalogToolbar
          collections={collections}
          activeSlug={activeSlug}
          sort={sort}
          onSortChange={onSortChange}
        />
        <div className="mt-8 md:mt-12">
          <p className="sr-only" aria-live="polite">
            {products ? `${products.length} pieces` : 'Loading pieces'}
          </p>
          <ProductGrid products={products ?? []} loading={loading} columns={gridColumns} />
        </div>
      </Container>
    </section>
  )
}
