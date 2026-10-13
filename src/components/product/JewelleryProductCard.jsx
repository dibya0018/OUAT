import { Link } from 'react-router-dom'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import JewelleryProductFrame from './JewelleryProductFrame'
import { cx } from '../../lib/format'
import PriceTag from './PriceTag'

/** Centred luxury tile — real photo or floral vignette (never a grey label box). */
export default function JewelleryProductCard({ product, className, priority = false }) {
  const primary = product.images?.find((img) => img?.src) ?? product.images?.[0]
  const hasPhoto = Boolean(primary?.src)

  return (
    <article className={cx('group text-center', className)}>
      <Link to={`/product/${product.slug}`} className="block focus-visible:outline-offset-4">
        <div className="zoom-media mx-auto max-w-sm overflow-hidden border border-accent/10 bg-white shadow-[0_8px_40px_-12px_rgb(160_93_73_/0.15)]">
          {hasPhoto ? (
            <ImagePlaceholder
              src={primary.src}
              alt={primary.alt ?? product.name}
              tone={primary.tone ?? 'sand'}
              priority={priority}
              ratio="square"
            />
          ) : (
            <JewelleryProductFrame
              alt={primary?.alt ?? product.name}
              tone={primary?.tone ?? (product.colour?.includes('green') ? 'olive' : 'sand')}
            />
          )}
        </div>
        <h3 className="mt-5 font-display text-xl text-ink md:text-2xl">{product.name}</h3>
        {product.colour && (
          <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-ink-soft">{product.colour}</p>
        )}
        <p className="mt-2 font-display text-lg text-accent"><PriceTag product={product} /></p>
      </Link>
    </article>
  )
}
