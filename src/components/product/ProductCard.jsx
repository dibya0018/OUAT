import { Link } from 'react-router-dom'
import { formatPrice, cx } from '../../lib/format'
import { productDisplayImages } from '../../lib/productImages'

/**
 * Product tile: 4:5 image (optional second image on hover), name, price.
 */
export default function ProductCard({ product, className, priority = false }) {
  const { primary, hover, hasHoverSwap } = productDisplayImages(product.images)
  const coverSrc = primary?.src
  const coverAlt = primary?.alt ?? product.name
  const coverTone = primary?.tone ?? 'sand'

  return (
    <div className={cx('product-card group', className)}>
      <Link to={`/product/${product.slug}`} className="product-card__link block text-ink no-underline">
        <div className="product-card__media zoom-media relative aspect-product w-full overflow-hidden bg-sand">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={coverAlt}
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'async' : 'async'}
              fetchPriority={priority ? 'high' : 'auto'}
              className="block h-full w-full object-cover"
            />
          ) : (
            <div
              className={cx(
                'flex h-full min-h-[10rem] w-full items-center justify-center',
                coverTone === 'olive' ? 'bg-sage/35' : coverTone === 'deep' ? 'bg-primary text-cream' : 'bg-sand',
              )}
            >
              <span className="px-4 text-center font-sans text-[0.65rem] uppercase tracking-eyebrow opacity-60">
                {product.name}
              </span>
            </div>
          )}
          {hasHoverSwap && (
            <img
              src={hover.src}
              alt=""
              aria-hidden
              loading="lazy"
              className="pointer-events-none absolute inset-0 block h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          )}
          {product.isNew && (
            <span className="absolute top-3 left-3 z-[1] bg-white px-2 py-1 font-sans text-[0.625rem] uppercase tracking-eyebrow text-primary">
              New
            </span>
          )}
        </div>

        <div className="product-card__meta mt-3 sm:mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="line-clamp-2 min-w-0 flex-1 font-display text-base leading-tight font-normal sm:text-lg">
              {product.name}
            </h3>
            <p className="shrink-0 font-sans text-sm tabular-nums">{formatPrice(product.price)}</p>
          </div>
          {product.origin && <p className="mt-1 text-xs text-ink-soft">Once a {product.origin}</p>}
        </div>
      </Link>
    </div>
  )
}
