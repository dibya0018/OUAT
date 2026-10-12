import { cx } from '../../lib/format'

const sizes = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl',
  lg: 'text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl',
  xl: 'text-[2rem] leading-[1.1] sm:text-4xl md:text-6xl',
}

/**
 * Two-tone editorial headline (reference: terracotta emphasis + charcoal rest).
 * Example: accent="Best Sellers" rest="on Brown Living"
 */
export default function EditorialTitle({
  accent,
  rest,
  as: Tag = 'h2',
  size = 'md',
  inverse = false,
  onDark = false,
  className,
  id,
}) {
  let accentClass = 'text-accent'
  let restClass = 'text-ink'
  if (onDark) {
    accentClass = 'text-accent'
    restClass = 'text-cream'
  } else if (inverse) {
    accentClass = 'text-cream'
    restClass = 'text-cream/95'
  }

  return (
    <Tag id={id} className={cx('display-title max-w-full [overflow-wrap:anywhere]', sizes[size], className)}>
      {accent && <span className={accentClass}>{accent}</span>}
      {rest && (
        <>
          {accent ? ' ' : null}
          <span className={restClass}>{rest}</span>
        </>
      )}
    </Tag>
  )
}

/** Splits a plain string into accent + rest for page titles. */
export function splitEditorialTitle(title) {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { accent: title, rest: '' }
  if (words.length === 2) return { accent: words[0], rest: words[1] }
  const splitAt = Math.ceil(words.length / 2)
  return {
    accent: words.slice(0, splitAt).join(' '),
    rest: words.slice(splitAt).join(' '),
  }
}
