import { cx } from '../../lib/format'

const sizes = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl',
  lg: 'text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl',
  xl: 'text-[2rem] leading-[1.1] sm:text-4xl md:text-6xl',
  /** Long hero headlines: smaller steps so whole words fit the column. */
  hero: 'text-[1.9rem] leading-[1.12] sm:text-[2.5rem] md:text-5xl xl:text-[3.5rem] [overflow-wrap:normal] hyphens-none',
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
  stacked = false,
  accentTone,
  className,
  id,
}) {
  let accentClass = 'text-accent'
  let restClass = 'text-ink'
  if (onDark) {
    accentClass = 'text-accent-light'
    restClass = 'text-cream'
  } else if (inverse) {
    accentClass = 'text-cream'
    restClass = 'text-cream/95'
  }
  if (accentTone === 'primary') accentClass = 'text-primary'

  return (
    <Tag
      id={id}
      className={cx('display-title max-w-full', size !== 'hero' && '[overflow-wrap:anywhere]', sizes[size], className)}
    >
      {accent && <span className={cx(accentClass, stacked && 'block')}>{accent}</span>}
      {rest && (
        <>
          {accent && !stacked ? ' ' : null}
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
