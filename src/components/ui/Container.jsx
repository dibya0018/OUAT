import { cx } from '../../lib/format'

/**
 * Centres content at the site max-width (1280px) with responsive gutters.
 * Use `narrow` for long-form text (story, policies).
 */
export default function Container({ as: Tag = 'div', narrow = false, className, children, ...rest }) {
  return (
    <Tag
      className={cx('mx-auto w-full max-w-full px-4 sm:px-6 md:px-10', narrow ? 'max-w-3xl' : 'max-w-site', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
