import { useEffect, useRef, useState } from 'react'

const hasObserver = typeof IntersectionObserver !== 'undefined'

/** How long an element must rest fully on screen before it counts as seen. */
const REST_MS = 280

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Scroll-triggered visibility. Safe fallback: always visible without IntersectionObserver.
 *
 * @returns {[React.RefObject<HTMLElement>, boolean]}
 */
export function useInView({ threshold = 0.12, rootMargin = '0px 0px -6% 0px', once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(() => !hasObserver)

  useEffect(() => {
    if (!hasObserver) return
    const el = ref.current
    if (!el) {
      const frame = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(frame)
    }

    let passed = false
    let resting = false
    let timer = 0

    const stop = () => {
      clearTimeout(timer)
      primary.disconnect()
      fallback.disconnect()
    }
    const report = () => {
      const visible = passed || resting
      if (visible && once) stop()
      if (visible || !once) setInView(visible)
    }

    const steps = [...new Set([0, 0.01, 0.02, 0.05, 0.1, threshold])].sort((a, b) => a - b)

    const primary = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        const rootHeight = entry.rootBounds ? entry.rootBounds.height : window.innerHeight
        passed =
          entry.isIntersecting &&
          (entry.intersectionRatio >= threshold || entry.intersectionRect.height >= rootHeight * 0.28)
        report()
      },
      { threshold: steps, rootMargin },
    )

    const fallback = new IntersectionObserver(
      (entries) => {
        const onScreen = entries[entries.length - 1].intersectionRatio >= 0.88
        clearTimeout(timer)
        if (onScreen) {
          timer = setTimeout(() => {
            resting = true
            report()
          }, REST_MS)
        } else if (resting) {
          resting = false
          report()
        }
      },
      { threshold: 0.88 },
    )

    primary.observe(el)
    fallback.observe(el)
    return stop
  }, [threshold, rootMargin, once])

  return [ref, inView]
}

/** rAF-throttled scroll/resize while `el` is near the viewport (parallax, etc.). */
export function watchScroll(el, update) {
  if (!hasObserver) return () => {}

  let frame = 0
  let listening = false

  const run = () => {
    frame = 0
    update()
  }
  const request = () => {
    if (!frame) frame = requestAnimationFrame(run)
  }
  const listen = (on) => {
    if (on === listening) return
    listening = on
    if (on) {
      window.addEventListener('scroll', request, { passive: true })
      window.addEventListener('resize', request)
      request()
    } else {
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }

  const observer = new IntersectionObserver(
    (entries) => listen(entries[entries.length - 1].isIntersecting),
    { rootMargin: '20% 0px' },
  )
  observer.observe(el)

  return () => {
    observer.disconnect()
    listen(false)
    cancelAnimationFrame(frame)
  }
}
