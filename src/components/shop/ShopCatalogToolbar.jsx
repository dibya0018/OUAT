import CollectionNav from './CollectionNav'
import ShopSortControl from './ShopSortControl'

/** Mobile: one-row chip strip + sort pill. Desktop: tabs + sort. */
export default function ShopCatalogToolbar({ collections, activeSlug, sort, onSortChange }) {
  return (
    <>
      <div className="-mx-4 sm:-mx-6 md:hidden">
        <div className="flex items-center border-y border-line bg-gradient-to-r from-sand/50 via-white to-sand/30">
          <CollectionNav collections={collections} activeSlug={activeSlug} />
          <div className="shrink-0 border-l border-line/80 py-2 pr-4 pl-2">
            <ShopSortControl value={sort} onChange={onSortChange} variant="mobile" />
          </div>
        </div>
      </div>

      <div className="hidden border-y border-line py-4 md:flex md:items-center md:justify-between md:gap-6">
        <CollectionNav collections={collections} activeSlug={activeSlug} className="min-w-0" />
        <ShopSortControl value={sort} onChange={onSortChange} variant="desktop" />
      </div>
    </>
  )
}
