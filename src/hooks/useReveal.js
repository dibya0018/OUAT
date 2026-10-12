import { useEffect, useRef } from 'react'

/**
 * Adds `.is-visible` to the referenced element once it scrolls into view.
 * Pair with the `.reveal` class (see index.css). Reduced-motion users see
 * content immediately via CSS, so no JS branch is needed here.
 *
 * @param {{ threshold?: number, rootMargin?: string, once?: boolean }} options
 * @returns {React.RefObject<HTMLElement>}
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            if (once) observer.unobserve(el)
          } else if (!once) {
            el.classList.remove('is-visible')
          }
        })
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return ref
}
