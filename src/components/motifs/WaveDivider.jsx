import GoaMotif from './GoaMotif'
import Reveal from '../ui/Reveal'
import { cx } from '../../lib/format'

/** Full-width wave rule between sections. Decorative only. */
export default function WaveDivider({ className = 'text-primary/40' }) {
  return (
    <Reveal
      as="div"
      aria-hidden="true"
      className={cx('section-white flex w-full justify-center px-6 py-8 md:py-10', className)}
    >
      <GoaMotif name="wave" size={320} className="h-3 w-full max-w-site" />
    </Reveal>
  )
}
