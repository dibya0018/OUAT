import { useReveal } from '../../hooks/useReveal'
import { cx } from '../../lib/format'

/**
 * Wraps children in a gentle fade/slide-in when scrolled into view.
 * `delay` (ms) staggers items inside grids.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className, children, ...rest }) {
  const ref = useReveal()
  return (
    <Tag
      ref={ref}
      className={cx('reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
