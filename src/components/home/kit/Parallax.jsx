import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/format'
import { prefersReducedMotion, watchScroll } from './useInView'

/** Moves its children slightly against the scroll: offset = distance from the viewport centre × −speed. */
export default function Parallax({ speed = 0.08, as: Tag = 'div', className, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !speed || prefersReducedMotion()) return

    let offset = 0
    const update = () => {
      const rect = el.getBoundingClientRect()
      // Take the current offset back out so the element is measured where it naturally sits.
      const centre = rect.top - offset + rect.height / 2
      offset = Math.round((centre - window.innerHeight / 2) * -speed * 10) / 10
      el.style.transform = `translate3d(0, ${offset}px, 0)`
    }

    const stop = watchScroll(el, update)
    return () => {
      stop()
      el.style.transform = ''
    }
  }, [speed])

  return (
    <Tag ref={ref} className={cx('home-parallax', className)} {...rest}>
      {children}
    </Tag>
  )
}
