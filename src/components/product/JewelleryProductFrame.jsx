import { FloralBloom } from '../motifs/Florals'
import { cx } from '../../lib/format'

/** Product tile when photography is not ready — floral vignette, no grey label box. */
export default function JewelleryProductFrame({ alt, tone = 'sand', className }) {
  const bg = tone === 'olive' ? 'from-sage/25 to-cream' : 'from-cream to-sand'
  return (
    <div
      role="img"
      aria-label={alt}
      className={cx(
        'relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gradient-to-b',
        bg,
        className,
      )}
    >
      <div aria-hidden className="absolute inset-4 border border-accent/15" />
      <FloralBloom size={64} className="opacity-60" tone={tone === 'olive' ? 'sage' : 'accent'} />
    </div>
  )
}
