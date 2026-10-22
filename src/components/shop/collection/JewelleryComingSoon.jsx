import { useState } from 'react'
import Button from '../../ui/Button'
import { cx } from '../../../lib/format'
import { subscribeNewsletter } from '../../../services/formService'

/** Small seeded generator so the droplets land in the same places on every render. */
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const rand = seeded(20220101)

/** Below this width a drop is only a bead; at or above it, it is a lens that clears the frost. */
const LENS_MIN = 13
const LARGEST = 26

/**
 * Rain on a window: a dense scatter of fine beads, fewer mid-sized drops, and a
 * handful of heavier ones. No two share a shape, and about one in five has started
 * to stretch downwards the way a drop does just before it runs.
 */
const DROPS = Array.from({ length: 260 }, (_, i) => {
  const t = rand()
  const w = t < 0.62 ? 3 + rand() * 5 : t < 0.9 ? 8 + rand() * 5 : LENS_MIN + rand() * (LARGEST - LENS_MIN)
  const weight = w / LARGEST
  const stretched = rand() < 0.2
  // Heavier drops sag (fuller at the bottom); stretched ones are well on their way to a trickle.
  const h = w * (stretched ? 1.5 + rand() * 0.9 : 1 + weight * 0.25 + rand() * 0.12)
  const a = Math.round(38 + rand() * 24)
  const b = Math.round(38 + rand() * 24)
  const top = Math.round((stretched ? 30 : 40) + rand() * 10 - weight * 6)
  return {
    id: i,
    lens: w >= LENS_MIN,
    w,
    h,
    left: rand() * 98,
    top: rand() * 96,
    // Small beads sit at any angle; drops big enough to clear the frost stay near upright so the cleared patch lines up.
    tilt: (rand() - 0.5) * (w >= LENS_MIN ? 8 : stretched ? 14 : 50),
    radius: `${a}% ${100 - a}% ${b}% ${100 - b}% / ${top}% ${top}% ${100 - top}% ${100 - top}%`,
  }
})

/** One mask layer per lens drop: the frost is cut away where the water wets the glass. */
const FROST_MASK = DROPS.filter((d) => d.lens)
  .map(
    (d) =>
      `radial-gradient(ellipse ${(d.w * 0.47).toFixed(1)}px ${(d.h * 0.47).toFixed(1)}px at ` +
      `calc(${d.left.toFixed(2)}% + ${(d.w / 2).toFixed(1)}px) calc(${d.top.toFixed(2)}% + ${(d.h / 2).toFixed(1)}px), ` +
      `transparent 82%, #000 100%)`,
  )
  .join(', ')

/** A few drops that gather and run down the pane. */
const RUNNERS = Array.from({ length: 9 }, (_, i) => {
  const w = 6 + rand() * 6
  return {
    id: i,
    left: `${(5 + rand() * 90).toFixed(2)}%`,
    top: `${(rand() * 28).toFixed(2)}%`,
    width: `${w.toFixed(1)}px`,
    height: `${(w * 1.35).toFixed(1)}px`,
    borderRadius: '50% 50% 50% 50% / 38% 38% 62% 62%',
    animationDuration: `${(9 + rand() * 10).toFixed(1)}s`,
    animationDelay: `${(rand() * -18).toFixed(1)}s`,
  }
})

/**
 * Frosted pane over the jewellery page: the layout stays visible but blurred,
 * water sits on the glass, and a "Coming soon" poster taped to it takes sign-ups.
 */
export default function JewelleryComingSoon() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    const result = await subscribeNewsletter({ email })
    if (result.ok) {
      setStatus('success')
      setEmail('')
    } else {
      setStatus('idle')
      setError(result.errors?.email ?? 'Something went wrong.')
    }
  }

  return (
    <div className="absolute inset-0 z-20">
      {/* The pane stays in view while the page scrolls behind it */}
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden px-4 pt-16 md:pt-20">
        {/* The frost, with a clear patch under every drop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[#f3ece0]/30 backdrop-blur-[9px]"
          style={{ maskImage: FROST_MASK, maskComposite: 'intersect' }}
        />
        <div aria-hidden className="glass-mist absolute inset-0" />
        <div aria-hidden className="glass-sheen absolute inset-0" />
        <div aria-hidden className="absolute inset-0">
          {DROPS.map((d) => (
            <span
              key={d.id}
              className={cx('glass-drop', !d.lens && 'glass-drop--bead', !d.lens && d.id >= 90 && 'max-sm:hidden')}
              style={{
                left: `${d.left.toFixed(2)}%`,
                top: `${d.top.toFixed(2)}%`,
                width: `${d.w.toFixed(1)}px`,
                height: `${d.h.toFixed(1)}px`,
                borderRadius: d.radius,
                rotate: `${d.tilt.toFixed(1)}deg`,
              }}
            />
          ))}
          {RUNNERS.map(({ id, ...style }) => (
            <span key={id} className="glass-drop glass-drop--run" style={style} />
          ))}
        </div>

        <section
          aria-labelledby="jewellery-soon"
          className="glass-poster w-full max-w-[19.5rem] px-7 py-10 text-center sm:max-w-md sm:px-12 sm:py-16"
        >
          {/* Rough, hand-torn edge for the paper (used by .glass-poster__paper). */}
          <svg aria-hidden width="0" height="0" className="absolute">
            <filter id="poster-deckle" x="-4%" y="-4%" width="108%" height="108%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <span aria-hidden className="glass-poster__paper" />
          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <span key={corner} aria-hidden className={`glass-tape glass-tape--${corner}`} />
          ))}
          <p className="eyebrow text-[0.65rem] text-accent sm:text-xs">Upcycled Jewellery</p>
          <h1 id="jewellery-soon" className="mt-4 font-display text-[2.75rem] leading-none text-ink sm:mt-5 sm:text-6xl">
            Coming <span className="italic text-accent">soon</span>
          </h1>
          <p aria-hidden className="glass-poster__rule mt-5 sm:mt-6">
            ✦
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm text-ink-soft sm:mt-5 sm:text-base">
            We are still tumbling the last fragments smooth. Leave your email and we will write the day the
            collection opens.
          </p>

          {status === 'success' ? (
            <p className="mt-8 font-display text-xl text-primary" role="status">
              Thank you. You will be the first to know.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <label htmlFor="jewellery-soon-email" className="sr-only">
                Email
              </label>
              <input
                id="jewellery-soon-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="h-12 w-full min-w-0 shrink-0 rounded-xs border sm:w-auto sm:flex-1 border-accent/40 bg-[#fbf5e6]/80 px-4 text-base text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="h-12 shrink-0 rounded-xs border border-accent bg-accent px-7 font-sans text-sm tracking-wide text-cream transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:opacity-50"
              >
                Notify me
              </button>
            </form>
          )}
          {error && (
            <p className="mt-2 text-sm text-accent" role="alert">
              {error}
            </p>
          )}

          <Button to="/shop" variant="text" className="mt-6 text-primary sm:mt-8">
            Shop what is ready now
          </Button>
        </section>
      </div>
    </div>
  )
}
