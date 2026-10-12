import { useEffect, useMemo, useState } from 'react'
import { cx } from '../../../lib/format'
import { prefersReducedMotion, useInView } from './useInView'

/** First number in a string: digits, optional thousands commas, optional decimals. */
const NUMBER = /\d+(?:,\d{3})*(?:\.\d+)?/

/** Splits "6,000+" into prefix, number and suffix; null when there is no number. */
function parseValue(text) {
  const match = text.match(NUMBER)
  if (!match) return null
  const raw = match[0]
  const decimals = raw.includes('.') ? raw.length - raw.indexOf('.') - 1 : 0
  return {
    prefix: text.slice(0, match.index),
    suffix: text.slice(match.index + raw.length),
    target: Number(raw.replace(/,/g, '')),
    format: new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: raw.includes(','),
    }),
  }
}

const easeOut = (t) => 1 - Math.pow(1 - t, 4)

/**
 * Counts up to the number inside `value` when in view, keeping its prefix, suffix,
 * separators and decimals ("6,000+", "1.2 kg"). Non-numeric strings render as they are.
 */
export default function CountUp({ value, duration = 1600, className, ...rest }) {
  const text = String(value ?? '')
  const parsed = useMemo(() => parseValue(text), [text])
  const [ref, inView] = useInView()
  // 0 → 1; reduced-motion visitors start at the end.
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0))

  useEffect(() => {
    if (!parsed || !inView || prefersReducedMotion()) return

    let frame = 0
    let start = 0
    const tick = (now) => {
      if (!start) start = now
      const next = duration > 0 ? Math.min((now - start) / duration, 1) : 1
      setProgress(next)
      if (next < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [parsed, inView, duration])

  const counting = Boolean(parsed) && progress < 1

  // The real value stays in the flow (it holds the width and is what screen
  // readers get); the running figure is drawn over it and hidden from them.
  return (
    <span ref={ref} className={cx(parsed && 'home-count', counting && 'is-counting', className)} {...rest}>
      <span className="home-count__final">{text}</span>
      {counting && (
        <span className="home-count__live" aria-hidden="true">
          {parsed.prefix}
          {parsed.format.format(parsed.target * easeOut(progress))}
          {parsed.suffix}
        </span>
      )}
    </span>
  )
}
