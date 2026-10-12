import { cx } from '../../lib/format'
import floralRepeat from '../../assets/motifs/floral-repeat.svg?url'

/** Soft grain, linen weave, and repeating floral pattern for jewellery pages. */
export default function JewellerySurface({ className }) {
  return (
    <div aria-hidden="true" className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div
        className="texture-floral absolute inset-0"
        style={{ backgroundImage: `url(${floralRepeat})` }}
      />
      <div className="texture-grain absolute inset-0" />
      <div className="texture-weave absolute inset-0" />
    </div>
  )
}
