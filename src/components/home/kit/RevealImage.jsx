import { useEffect, useRef } from 'react'
import { cx } from '../../../lib/format'
import { prefersReducedMotion, useInView, watchScroll } from './useInView'

const MAX_PARALLAX = 0.12

/**
 * An image unveiled by a clip-path wipe while it settles from a slight zoom.
 * `ratio` is a CSS aspect-ratio (pass `null` to fill the parent's height);
 * `parallax` (0–0.12) drifts the picture inside its frame on scroll.
 */
export default function RevealImage({
  src,
  alt = '',
  ratio = '4 / 5',
  className,
  imgClassName,
  parallax = 0,
  priority = false,
  sizes,
  style,
  ...rest
}) {
  const [ref, inView] = useInView()
  const imgRef = useRef(null)
  const drift = Math.min(Math.max(Number(parallax) || 0, 0), MAX_PARALLAX)

  useEffect(() => {
    const frame = ref.current
    const img = imgRef.current
    if (!frame || !img || !drift || prefersReducedMotion()) return

    // The img is `drift` taller than its frame (see home.css), so it can travel
    // half of that either way: up as the frame enters, down as it leaves.
    const update = () => {
      const rect = frame.getBoundingClientRect()
      const viewport = window.innerHeight
      const travel = (viewport + rect.height) / 2
      const offset = travel ? (rect.top + rect.height / 2 - viewport / 2) / travel : 0
      const progress = Math.min(Math.max(offset, -1), 1)
      img.style.translate = `0 ${(-progress * drift * 0.5 * rect.height).toFixed(1)}px`
    }

    const stop = watchScroll(frame, update)
    return () => {
      stop()
      img.style.translate = ''
    }
  }, [ref, drift])

  return (
    <div
      ref={ref}
      className={cx('home-image', ratio == null && 'home-image--fill', inView && 'is-in', className)}
      style={{
        ...(ratio != null && { aspectRatio: ratio }),
        ...(drift > 0 && { '--home-parallax': drift }),
        ...style,
      }}
      {...rest}
    >
      <div className="home-image__clip">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          sizes={sizes}
          className={cx('home-image__img', imgClassName)}
          {...(priority ? { loading: 'eager', fetchPriority: 'high' } : { decoding: 'async' })}
        />
      </div>
    </div>
  )
}
