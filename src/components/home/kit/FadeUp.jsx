import { cx } from '../../../lib/format'
import { useInView } from './useInView'

/** Fades its children in while they rise 24px, once, when scrolled into view. `delay` is in ms. */
export default function FadeUp({ as: Tag = 'div', delay = 0, className, style, children, ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={cx('home-fade', inView && 'is-in', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
