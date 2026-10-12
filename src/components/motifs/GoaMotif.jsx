import { cx } from '../../lib/format'

const SVG_URLS = {
  wave: new URL('../../assets/motifs/wave.svg', import.meta.url).href,
  arch: new URL('../../assets/motifs/arch.svg', import.meta.url).href,
  church: new URL('../../assets/motifs/church.svg', import.meta.url).href,
  seaglass: new URL('../../assets/motifs/seaglass.svg', import.meta.url).href,
}

/**
 * Decorative Goa motifs (SVG assets). PNG names used on jewellery pages
 * render nothing until photo assets are added under src/assets/motifs/.
 */
export default function GoaMotif({ name, size = 48, className, reveal: _reveal }) {
  const src = SVG_URLS[name]
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={cx('object-contain', className)}
      loading="lazy"
      decoding="async"
    />
  )
}
