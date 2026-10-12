import { useEffect, useState } from 'react'
import Logo from '../../ui/Logo'
import { seeded, wavePath } from './shapes'

const SEEN_KEY = 'ouat.tide.seen'
/** Longer than the animation; clears the overlay even if the tab was in the background. */
const SAFETY_MS = 4000

const CREST = wavePath({ base: 46, amp: 26, period: 720, phase: 0.6, ripple: 0.2 })
const FOAM = wavePath({ base: 40, amp: 24, period: 360, phase: 2.4, ripple: 0.3 })

const rand = seeded(424242)
const BUBBLES = Array.from({ length: 18 }, (_, i) => {
  const size = 6 + rand() * 20
  return {
    id: i,
    style: {
      left: `${(4 + rand() * 92).toFixed(1)}%`,
      width: `${size.toFixed(0)}px`,
      height: `${size.toFixed(0)}px`,
      animationDelay: `${(rand() * 0.9).toFixed(2)}s`,
      animationDuration: `${(1.6 + rand() * 1.2).toFixed(2)}s`,
      '--drift': `${(rand() * 60 - 30).toFixed(0)}px`,
    },
  }
})

/** Plays once per browser session, and never for visitors who ask for less motion. */
function shouldPlay() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * Arrival: the page opens under water, then the sea drains off the screen and
 * you are standing on the beach. Purely decorative and never blocks input.
 */
export default function TideIntro() {
  const [playing, setPlaying] = useState(shouldPlay)

  useEffect(() => {
    if (!playing) return undefined
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* storage unavailable — the intro simply plays again next time */
    }
    const id = window.setTimeout(() => setPlaying(false), SAFETY_MS)
    return () => window.clearTimeout(id)
  }, [playing])

  if (!playing) return null

  return (
    <div className="goa-intro" aria-hidden="true">
      <div
        className="goa-intro__water"
        onAnimationEnd={(e) => {
          if (e.animationName === 'goa-intro-drain') setPlaying(false)
        }}
      >
        <svg className="goa-intro__crest goa-intro__crest--foam" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d={FOAM.fill} />
        </svg>
        <svg className="goa-intro__crest goa-intro__crest--water" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d={CREST.fill} />
        </svg>
        <div className="goa-intro__light" />
        {BUBBLES.map((b) => (
          <span key={b.id} className="goa-intro__bubble" style={b.style} />
        ))}
        <div className="goa-intro__mark">
          <Logo inverse className="h-14 md:h-20" fallbackClassName="text-4xl" />
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-cream/85">Goa, India</p>
        </div>
      </div>
    </div>
  )
}
