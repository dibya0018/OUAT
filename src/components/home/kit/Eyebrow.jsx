import { cx } from '../../../lib/format'

/**
 * Section label: index numeral, short hairline, uppercase label.
 * `tone` is 'dark' on light surfaces and 'light' on dark ones; without `index` only the label shows.
 */
export default function Eyebrow({ index, tone = 'dark', as: Tag = 'p', className, children, ...rest }) {
  const hasIndex = index != null && index !== ''
  return (
    <Tag className={cx('home-eyebrow home-label', tone === 'light' && 'home-eyebrow--light', className)} {...rest}>
      {hasIndex && (
        <>
          <span className="home-eyebrow__num">{index}</span>
          <span className="home-eyebrow__rule" aria-hidden="true" />
        </>
      )}
      <span>{children}</span>
    </Tag>
  )
}
