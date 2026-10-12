import { Link } from 'react-router-dom'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Icon from '../ui/Icon'
import { cx } from '../../lib/format'

export default function JewelleryCategoryCard({ label, slug, blurb, imageSrc, imageAlt, className }) {
  return (
    <Link
      to={`/product/${slug}`}
      className={cx(
        'group block overflow-hidden border bg-white text-center transition-colors',
        className ?? 'border-accent/15 hover:border-accent/40',
      )}
    >
      <div className="zoom-media bg-sand/50">
        <ImagePlaceholder
          ratio="square"
          src={imageSrc}
          alt={imageAlt ?? label}
          tone="sand"
          priority={false}
        />
      </div>
      <div className="px-6 py-8 md:px-8 md:py-10">
        <h3 className="font-display text-2xl text-ink md:text-3xl">{label}</h3>
        {blurb && <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{blurb}</p>}
        <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm text-accent">
          Discover
          <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
