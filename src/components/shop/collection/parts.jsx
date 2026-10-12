import { Link } from 'react-router-dom'
import { useCart } from '../../../hooks/useCart'
import { cx } from '../../../lib/format'
import { stockState } from '../../../lib/collectionUi'
import { productDisplayImages } from '../../../lib/productImages'

/** Home / Shop / Collection trail. `dark` for photo or dark heroes. */
export function Crumbs({ name, dark = false, className }) {
  const link = cx('link-underline', dark ? 'text-cream/75 hover:text-cream' : 'text-ink-soft hover:text-ink')
  return (
    <nav aria-label="Breadcrumb" className={cx('font-sans text-xs tracking-wide', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className={link}>
            Home
          </Link>
        </li>
        <li aria-hidden className={dark ? 'text-cream/40' : 'text-ink-soft/50'}>
          /
        </li>
        <li>
          <Link to="/shop" className={link}>
            Shop
          </Link>
        </li>
        <li aria-hidden className={dark ? 'text-cream/40' : 'text-ink-soft/50'}>
          /
        </li>
        <li aria-current="page" className={dark ? 'text-cream' : 'text-ink'}>
          {name}
        </li>
      </ol>
    </nav>
  )
}

/** Product photo that fills its box; swaps to the second photo on hover of a `group` parent. */
export function ProductPhoto({ product, className, priority = false, swap = true }) {
  const { primary, hover, hasHoverSwap } = productDisplayImages(product.images)
  return (
    <div className={cx('relative overflow-hidden bg-sand', className)}>
      {primary?.src ? (
        <img
          src={primary.src}
          alt={primary.alt ?? product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          role="img"
          aria-label={primary?.alt ?? product.name}
          className={cx(
            'flex h-full w-full items-center justify-center',
            primary?.tone === 'olive' ? 'bg-sage/35' : primary?.tone === 'deep' ? 'bg-primary text-cream' : 'bg-sand',
          )}
        >
          <span className="px-4 text-center font-sans text-[0.65rem] uppercase tracking-eyebrow opacity-60">
            {product.name}
          </span>
        </div>
      )}
      {swap && hasHoverSwap && (
        <img
          src={hover.src}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute inset-0 block h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </div>
  )
}

/** "New" / "Only a few left" / "Sold out" label; renders nothing for ordinary stock. */
export function StockBadge({ product, className }) {
  const state = stockState(product)
  const label = state === 'out' ? 'Sold out' : state === 'low' ? 'Only a few left' : product.isNew ? 'New' : null
  if (!label) return null
  return (
    <span
      className={cx(
        'inline-block px-2 py-1 font-sans text-[0.625rem] uppercase tracking-eyebrow',
        state === 'out' ? 'bg-ink text-cream' : state === 'low' ? 'bg-accent text-cream' : 'bg-white text-primary',
        className,
      )}
    >
      {label}
    </span>
  )
}

/** Adds one of the product to the cart and opens the cart drawer. */
export function AddToCartButton({ product, className, label = 'Add to cart' }) {
  const { addItem } = useCart()
  const soldOut = stockState(product) === 'out'
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => addItem(product)}
      aria-label={soldOut ? `${product.name} is sold out` : `${label}: ${product.name}`}
      className={cx(
        'inline-flex h-11 items-center justify-center rounded-xs border px-5 font-sans text-sm tracking-wide',
        'transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {soldOut ? 'Sold out' : label}
    </button>
  )
}

/** Count of pieces, announced politely when sort or filter changes it. */
export function PieceCount({ count, loading, className }) {
  return (
    <p className={cx('font-sans text-sm tabular-nums', className)} aria-live="polite">
      {loading ? 'Loading…' : `${count} ${count === 1 ? 'piece' : 'pieces'}`}
    </p>
  )
}
