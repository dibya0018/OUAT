import EditorialTitle from './EditorialTitle'
import { cx } from '../../lib/format'

/**
 * Editorial section heading: optional eyebrow, two-tone serif title, optional lede.
 * Pass `titleAccent` + `titleRest` for the split style; otherwise `title` renders in ink.
 */
export default function SectionHeading({
  eyebrow,
  title,
  titleAccent,
  titleRest,
  lede,
  align = 'left',
  as: Tag = 'h2',
  size = 'md',
  className,
  inverse = false,
  onDark = false,
  id,
}) {
  const useSplit = titleAccent != null || titleRest != null

  return (
    <div
      className={cx(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && <p className={cx('eyebrow', inverse && 'text-cream/85')}>{eyebrow}</p>}

      {useSplit ? (
        <EditorialTitle
          as={Tag}
          id={id}
          size={size}
          inverse={inverse}
          onDark={onDark}
          accent={titleAccent}
          rest={titleRest}
        />
      ) : (
        <Tag id={id} className={cx('display-title', inverse ? 'text-cream' : 'text-ink', size === 'lg' && 'text-4xl md:text-5xl', size === 'md' && 'text-3xl md:text-4xl', size === 'sm' && 'text-2xl md:text-3xl')}>
          {title}
        </Tag>
      )}

      {lede && (
        <p className={cx('max-w-xl text-base md:text-lg', inverse ? 'text-cream/90' : 'text-ink-soft')}>
          {lede}
        </p>
      )}
    </div>
  )
}
