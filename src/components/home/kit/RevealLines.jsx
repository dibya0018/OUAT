import { Fragment } from 'react'
import { cx } from '../../../lib/format'
import { useInView } from './useInView'

/**
 * A headline whose lines slide up from behind a mask, one after another.
 * Each item of `lines` is one visual line (string or JSX); `delay` and `stagger` are in ms.
 */
export default function RevealLines({
  as: Tag = 'h2',
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 90,
  children,
  ...rest
}) {
  const [ref, inView] = useInView()
  // `children` is accepted as a single line; empty entries (a failed `cond && …`) are skipped.
  const items = (lines ?? [children]).filter((line) => line != null && line !== false && line !== '')

  return (
    <Tag ref={ref} className={cx('home-lines', inView && 'is-in', className)} {...rest}>
      {items.map((line, index) => (
        // Lines are static copy, so their position is a stable key.
        <Fragment key={index}>
          {/* A space between the masks keeps the sentence intact for screen readers and copy-paste. */}
          {index > 0 && ' '}
          <span className={cx('home-line', lineClassName)}>
            <span className="home-line__inner" style={{ transitionDelay: `${delay + index * stagger}ms` }}>
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
