import { cx } from '../../lib/format'

const ratios = {
  product: 'aspect-product',
  landscape: 'aspect-landscape',
  wide: 'aspect-wide',
  square: 'aspect-square',
  auto: '',
}

const tones = {
  sand: 'bg-sand text-ink-soft',
  olive: 'bg-sage/35 text-ink-soft',
  deep: 'bg-primary text-cream',
}

export default function ImagePlaceholder({
  src,
  alt,
  ratio = 'product',
  tone = 'sand',
  label,
  priority = false,
  className,
  imgClassName,
  sizes,
  srcSet,
  ...rest
}) {
  const ratioClass = ratios[ratio] ?? ''

  return (
    <div
      className={cx('relative w-full overflow-hidden', ratioClass, !src && tones[tone], className)}
      style={ratio in ratios ? undefined : { aspectRatio: ratio }}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={cx('block h-full w-full object-cover', imgClassName)}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="zoom-target flex h-full min-h-[8rem] w-full items-center justify-center"
        >
          {label && (
            <span className="px-4 text-center font-sans text-[0.65rem] uppercase tracking-eyebrow opacity-60">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
