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
const LARGEST = 54

/** Water sitting on the glass: mostly small beads, a few heavy drops. */
const DROPS = Array.from({ length: 40 }, (_, i) => {
  const t = rand()
  const w = t < 0.5 ? 4 + rand() * 7 : t < 0.88 ? LENS_MIN + rand() * 16 : 32 + rand() * (LARGEST - 32)
  const weight = w / LARGEST
  // Heavier drops sag: taller than wide, fuller at the bottom.
  const h = w * (1.02 + weight * 0.3 + rand() * 0.08)
  const a = Math.round(44 + rand() * 12)
  const b = Math.round(44 + rand() * 12)
  const top = Math.round(40 + rand() * 8 - weight * 6)
  return {
    id: i,
    lens: w >= LENS_MIN,
    w,
    h,
    left: rand() * 96,
    top: rand() * 93,
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
const RUNNERS = Array.from({ length: 6 }, (_, i) => {
  const w = 9 + rand() * 8
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
 * water sits on the glass, and a "Coming soon" card takes sign-ups.
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
              className={cx('glass-drop', !d.lens && 'glass-drop--bead')}
              style={{
                left: `${d.left.toFixed(2)}%`,
                top: `${d.top.toFixed(2)}%`,
                width: `${d.w.toFixed(1)}px`,
                height: `${d.h.toFixed(1)}px`,
                borderRadius: d.radius,
              }}
            />
          ))}
          {RUNNERS.map(({ id, ...style }) => (
            <span key={id} className="glass-drop glass-drop--run" style={style} />
          ))}
        </div>

        <section
          aria-labelledby="jewellery-soon"
          className="glass-card relative w-full max-w-lg px-7 py-10 text-center sm:px-12 sm:py-14"
        >
          <p className="eyebrow text-accent">Jewellery · Sea glass, set in brass</p>
          <h1 id="jewellery-soon" className="mt-5 font-display text-5xl leading-none text-ink sm:text-6xl">
            Coming <span className="italic text-accent">soon</span>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-ink-soft">
            We are still tumbling the last fragments smooth. Leave your email and we will write the day the
            collection opens.
          </p>

          {status === 'success' ? (
            <p className="mt-8 font-display text-xl text-primary" role="status">
              Thank you. You will be the first to know.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
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
                className="h-12 min-w-0 flex-1 rounded-full border border-white/70 bg-white/60 px-5 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="h-12 shrink-0 rounded-full border border-accent bg-accent px-7 font-sans text-sm tracking-wide text-cream transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:opacity-50"
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

          <Button to="/shop" variant="text" className="mt-8 text-primary">
            Shop what is ready now
          </Button>
        </section>
      </div>
    </div>
  )
}
