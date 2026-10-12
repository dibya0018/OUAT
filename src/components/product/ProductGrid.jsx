import ProductCard from './ProductCard'
import { cx } from '../../lib/format'

function columnClasses(count, columns) {
  if (count <= 1) return 'grid-cols-1 sm:max-w-xs sm:mx-auto'
  if (count === 2) return 'grid-cols-2 sm:max-w-2xl sm:mx-auto'
  if (columns === 2) return 'grid-cols-2 lg:grid-cols-2'
  if (columns === 3) return 'grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-2 lg:grid-cols-4'
}

/** Responsive product grid: 2 columns on mobile, 3–4 on larger screens. */
export default function ProductGrid({ products, columns = 4, className, loading = false }) {
  if (loading) {
    return (
      <div
        className={cx(
          'product-grid grid w-full auto-rows-auto items-start gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12',
          columnClasses(4, columns),
          className,
        )}
        aria-busy="true"
      >
        {Array.from({ length: Math.min(columns * 2, 8) }).map((_, i) => (
          <div key={i} className="aspect-product w-full bg-sand" />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return <p className="py-20 text-center text-ink-soft">No pieces here yet.</p>
  }

  return (
    <div
      role="list"
      className={cx(
        'product-grid grid w-full auto-rows-auto items-start gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12',
        columnClasses(products.length, columns),
        className,
      )}
    >
      {products.map((product, i) => (
        <div key={product.id} role="listitem" className="product-grid__cell min-w-0 self-start">
          <ProductCard product={product} priority={i < 4} />
        </div>
      ))}
    </div>
  )
}
