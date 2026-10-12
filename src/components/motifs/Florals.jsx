import { cx } from '../../lib/format'

const strokeProps = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/** Single plumeria-style bloom + leaves (line art). */
export function FloralBloom({ className, size = 120, tone = 'accent' }) {
  const stroke = tone === 'sage' ? 'text-sage/35' : 'text-accent/30'
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden
      className={cx(stroke, className)}
    >
      <g {...strokeProps} stroke="currentColor" strokeWidth="0.85">
        <path d="M60 28c-2 8 0 16 6 22 2-7 8-12 15-13-5 5-6 13-2 19 6-5 14-5 20 0-6-6-6-14-1-20 7 4 15 3 20-3-7-1-13-6-15-13-6 5-14 7-22 5 4-6 4-14 0-20-8 2-13 8-15 15-5-4-5-12 0-17 6 3 13 2 17-3-5 1-11-1-14-5z" />
        <circle cx="60" cy="52" r="2.5" fill="currentColor" stroke="none" opacity="0.5" />
      </g>
      <g {...strokeProps} stroke="currentColor" strokeWidth="0.65" className="text-primary/25">
        <path d="M38 78c10-2 18-10 20-20M82 70c-8 6-18 7-26 2M52 95c4-8 12-12 20-10" />
        <path d="M45 88c3-6 9-9 15-8M75 92c-5-4-7-10-5-16" />
      </g>
    </svg>
  )
}

/** Horizontal rule with small blooms — under jewellery headings. */
export function FloralDivider({ className }) {
  return (
    <svg viewBox="0 0 320 24" aria-hidden className={cx('h-6 w-full max-w-md text-accent/35', className)}>
      <g {...strokeProps} stroke="currentColor" strokeWidth="0.65">
        <path d="M8 12h304" />
        <path d="M48 12c-2 3-1 7 2 8 3-1 4-5 2-8-3 1-4 5-2 8z" />
        <path d="M160 12c-2 3-1 7 2 8 3-1 4-5 2-8-3 1-4 5-2 8z" />
        <path d="M272 12c-2 3-1 7 2 8 3-1 4-5 2-8-3 1-4 5-2 8z" />
      </g>
    </svg>
  )
}

/** Delicate vine with small buds — for corners. */
export function FloralVine({ className, size = 200, flip = false }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden
      className={cx('text-accent/25', flip && '-scale-x-100', className)}
    >
      <g {...strokeProps} stroke="currentColor" strokeWidth="0.7">
        <path d="M10 190C40 150 30 90 70 60s80-30 110-50" />
        <path d="M55 95c-4 3-4 9 0 12 4-3 4-9 0-12z" />
        <path d="M95 55c-3 4-2 9 2 11 3-4 2-9-2-11z" />
        <path d="M130 42c-4 2-5 7-2 10 4-2 5-7 2-10z" />
        <path d="M72 130c-5 2-6 8-3 11 5-2 6-8 3-11z" />
      </g>
      <g {...strokeProps} stroke="currentColor" strokeWidth="0.55" className="text-primary/20">
        <path d="M48 118c6-8 16-11 24-6M118 78c-7 5-16 4-21-3" />
      </g>
    </svg>
  )
}
