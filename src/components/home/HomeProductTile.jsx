import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { cx, formatPrice } from '../../lib/format'
import { stockState } from '../../lib/collectionUi'
import { productDisplayImages } from '../../lib/productImages'

/** Calm fills shown behind a photograph while it loads, or on their own when there is none. */
const TONES = {
  sand: 'bg-cream',
  olive: 'bg-sage/25',
  deep: 'bg-primary/20',
}

const TAGS = {
  new: { label: 'New', className: 'bg-[var(--home-bone,#f8f5ee)] text-ink' },
  low: { label: 'Only a few left', className: 'bg-[var(--home-bone,#f8f5ee)] text-accent' },
  out: { label: 'Sold out', className: 'bg-ink text-[var(--home-bone,#f8f5ee)]' },
}

/*
 * `.home-zoom` scales the photograph while the pointer is over the photograph itself.
 * The add-to-cart bar lies over its foot but outside the link, so the same transform is
 * repeated for the whole tile; otherwise the picture would ease back as the pointer
 * reaches the bar.
 */
const HOLD_ZOOM =
  'motion-safe:group-hover:[transform:scale(1.04)] motion-safe:group-focus-within:[transform:scale(1.04)]'

/** Home shelf tile: photograph, a quiet stock tag, add to cart, then name, origin and price. */
export default function HomeProductTile({ product, priority = false }) {
  const { addItem } = useCart()
  const { primary, hover, hasHoverSwap } = productDisplayImages(product.images)

  const stock = stockState(product)
  const soldOut = stock === 'out'
  const tag = soldOut ? TAGS.out : stock === 'low' ? TAGS.low : product.isNew ? TAGS.new : null
  const addLabel = soldOut ? `${product.name} is sold out` : `Add to cart: ${product.name}`
  const add = () => addItem(product)

  return (
    <article className="group relative">
      <Link to={`/product/${product.slug}`} draggable={false} className="block text-ink no-underline">
        <div className={cx('home-zoom relative aspect-[4/5] w-full', TONES[primary?.tone] ?? TONES.sand)}>
          {primary?.src && (
            <img
              src={primary.src}
              alt={primary.alt ?? product.name}
              draggable={false}
              decoding="async"
              {...(priority ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy' })}
              className={cx('absolute inset-0 block h-full w-full object-cover', HOLD_ZOOM)}
            />
          )}
          {hasHoverSwap && (
            <img
              src={hover.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              loading="lazy"
              decoding="async"
              className={cx(
                'pointer-events-none absolute inset-0 block h-full w-full object-cover opacity-0',
                '[transition:opacity_0.7s_var(--ease-out-soft),transform_1.2s_var(--ease-out-soft)]',
                'group-hover:opacity-100 group-focus-within:opacity-100',
                HOLD_ZOOM,
              )}
            />
          )}
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="min-w-0 font-display text-[1.25rem] font-normal leading-[1.2] text-ink">{product.name}</h3>
          <p className="shrink-0 font-sans text-sm tabular-nums text-ink">{formatPrice(product.price)}</p>
        </div>
      </Link>

      {/* Lies exactly over the photograph. It sits outside the link so the button is never nested in it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5] overflow-hidden">
        {tag && (
          <span
            className={cx(
              'absolute left-3 top-3 px-2 py-[0.3125rem] font-sans text-[0.625rem] font-medium uppercase leading-none tracking-[0.18em]',
              tag.className,
            )}
          >
            {tag.label}
          </span>
        )}
        <button
          type="button"
          disabled={soldOut}
          onClick={add}
          aria-label={addLabel}
          className={cx(
            'pointer-events-auto absolute inset-x-0 bottom-0 flex h-11 translate-y-full items-center justify-center',
            'bg-[var(--home-bone,#f8f5ee)] font-sans text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-ink',
            'transition-[translate,background-color,color] duration-500 ease-out-soft',
            'group-hover:translate-y-0 group-focus-within:translate-y-0',
            'hover:bg-ink hover:text-[var(--home-bone,#f8f5ee)] focus-visible:outline-offset-[-6px]',
            'disabled:cursor-not-allowed disabled:text-ink-soft disabled:hover:bg-[var(--home-bone,#f8f5ee)] disabled:hover:text-ink-soft',
            '[@media(hover:none)]:hidden',
          )}
        >
          {soldOut ? 'Sold out' : 'Add to cart'}
        </button>
      </div>

      <div className={cx('flex items-center justify-between gap-4', product.origin ? 'mt-1' : '[@media(hover:none)]:mt-1')}>
        {product.origin && <p className="min-w-0 text-[0.8125rem] leading-5 text-ink-soft">Once a {product.origin}</p>}
        {/* Touch screens have no hover, so the action stays in view. The negative margin gives a 44px target on a one-line row. */}
        <button
          type="button"
          disabled={soldOut}
          onClick={add}
          aria-label={addLabel}
          className={cx(
            '-my-3 ml-auto hidden h-11 min-w-11 shrink-0 items-center justify-end whitespace-nowrap',
            'font-sans text-[0.8125rem] text-ink underline decoration-ink/30 underline-offset-[5px]',
            'disabled:text-ink-soft disabled:no-underline',
            '[@media(hover:none)]:inline-flex',
          )}
        >
          {soldOut ? 'Sold out' : 'Add'}
        </button>
      </div>
    </article>
  )
}
