import { Link } from 'react-router-dom'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Icon from '../ui/Icon'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/format'

/** Shared line item for the cart drawer and cart page. */
export default function CartLineItem({ line, compact = false, onNavigate }) {
  const { setQty, removeItem } = useCart()

  return (
    <li className="flex gap-4 py-6">
      <Link
        to={`/product/${line.slug}`}
        onClick={onNavigate}
        className={compact ? 'w-20 shrink-0' : 'w-24 shrink-0 md:w-32'}
      >
        <ImagePlaceholder
          src={line.image?.src}
          alt={line.image?.alt ?? line.name}
          tone={line.image?.tone}
          ratio="product"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/product/${line.slug}`} onClick={onNavigate} className="font-display text-lg text-primary">
              {line.name}
            </Link>
            {line.gift && <p className="mt-1 text-xs text-ink-soft">Gift wrapped with a handwritten note</p>}
          </div>
          <p className="text-sm">{formatPrice(line.price * line.qty)}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center border border-line" role="group" aria-label={`Quantity for ${line.name}`}>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-primary hover:bg-sand"
              onClick={() => setQty(line.key, line.qty - 1)}
              aria-label="Decrease quantity"
            >
              <Icon name="minus" size={14} />
            </button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-primary hover:bg-sand"
              onClick={() => setQty(line.key, line.qty + 1)}
              aria-label="Increase quantity"
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.key)}
            className="link-underline text-xs text-ink-soft hover:text-primary"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
