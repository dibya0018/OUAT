import { useCallback, useEffect, useRef, useState } from 'react'
import Container from '../ui/Container'
import Button from '../ui/Button'
import EditorialTitle from '../ui/EditorialTitle'
import Icon from '../ui/Icon'
import goaAerial from '../images/goa.png'
import goaSunset from '../images/goa-sunset.png'
import { cx } from '../../lib/format'

const ROTATE_MS = 7000
/** The photo scrolls at this fraction of the page speed, so it sits behind the copy. */
const PARALLAX = 0.22
const SLIDES = [
  {
    src: goaAerial,
    alt: 'Aerial view of a Goa beach with palm trees and turquoise water',
    objectPosition: 'center 35%',
    accent: 'Once upon a time,',
    rest: 'this was a bottle.',
    lede: 'Now handcrafted into thoughtful pieces for conscious living.',
    promoTitle: '6,000+',
    promoLine: 'bottles given a second life',
  },
  {
    src: goaSunset,
    alt: 'Golden hour light on a Goa beach',
    objectPosition: '55% center',
    eyebrow: 'Handcrafted in Goa',
    accent: 'Welcome to the World',
    rest: 'where creativity meets Consciousness!',
    lede: 'Every product is lovingly upcycled, designed to be refilled, or chosen for its sustainable values.',
    promoTitle: 'Low Impact Production Process',
    promoLine: 'upcycled without remelting',
  },
]

export default function Hero() {
  const [active, setActive] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const slide = SLIDES[active]
  const count = SLIDES.length
  const mediaRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const goTo = useCallback(
    (index) => {
      const next = ((index % count) + count) % count
      setActive(next)
    },
    [count],
  )

  const next = useCallback(() => goTo(active + 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), ROTATE_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion, count])

  // Parallax: the photo drifts down a little as the page scrolls up over it.
  useEffect(() => {
    if (reduceMotion) return undefined
    const el = mediaRef.current
    let frame = 0
    const update = () => {
      frame = 0
      if (el && window.scrollY < window.innerHeight * 1.2) {
        el.style.transform = `translate3d(0, ${(window.scrollY * PARALLAX).toFixed(1)}px, 0)`
      }
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reduceMotion])

  return (
    <section
      className="relative flex min-h-[88svh] items-stretch overflow-hidden bg-ink text-cream md:min-h-[85svh]"
      aria-roledescription="carousel"
      aria-label="Featured stories from Goa"
    >
      {/* Slides */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          <div className="goa-arrive absolute inset-0">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={cx(
              'absolute inset-0 overflow-hidden transition-opacity duration-700 ease-[var(--ease-out-soft)]',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          >
            <img
              src={s.src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className="goa-kenburns absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: s.objectPosition }}
            />
          </div>
        ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cream/90 via-cream/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream to-transparent md:h-40"
      />

      <Container className="relative z-[1] flex flex-1 flex-col justify-center py-20 pb-28 sm:py-24 md:pb-32 md:pt-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left: headline + CTAs */}
          <div className="hero-copy-light lg:col-span-7">
            {slide.eyebrow && (
              <p className="eyebrow text-primary" aria-live="polite">
                {slide.eyebrow}
              </p>
            )}
            <EditorialTitle
              as="h1"
              id="hero-title"
              size="hero"
              accentTone="primary"
              stacked
              accent={slide.accent}
              rest={slide.rest}
              className={slide.eyebrow ? 'mt-5' : undefined}
            />
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink md:text-lg">{slide.lede}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button to="/shop" variant="solid">
                Shop the collection
              </Button>
              <Button to="/story" variant="outline">
                Our story
              </Button>
            </div>
          </div>

          {/* Right: quiet promo block (desktop), like reference deal panel */}
          <div className="hidden text-right lg:col-span-4 lg:col-start-9 lg:block">
            {/* Frosted clear glass: light tint, heavy blur, bright edge + top highlight.
                Fixed size so the box does not jump between slides. */}
            <div className="inline-flex h-[17rem] w-[20rem] flex-col items-end justify-center border border-white/60 bg-white/20 bg-gradient-to-br from-white/35 to-white/5 px-8 py-8 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_16px_40px_rgb(45_45_45/0.12)] backdrop-blur-xl backdrop-saturate-150 lg:text-right">
              <p className="font-sans text-xs font-medium uppercase tracking-eyebrow text-ink-soft">Impact</p>
              <p className="mt-3 text-balance font-display text-[2rem] leading-[1.1] text-primary" aria-live="polite">
                {slide.promoTitle}
              </p>
              <p className="mt-2 max-w-[14rem] text-sm text-ink lg:ml-auto">{slide.promoLine}</p>
              <Button to="/shop" variant="solid" size="sm" className="mt-6">
                Shop now
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Carousel controls — bottom center */}
      <div className="absolute inset-x-0 bottom-20 z-10 flex items-center justify-center gap-4 md:bottom-28">
        <button
          type="button"
          onClick={prev}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 text-ink transition-colors hover:border-ink hover:bg-ink/5"
          aria-label="Previous slide"
        >
          <Icon name="arrowLeft" size={18} />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}: ${s.alt}`}
              onClick={() => goTo(i)}
              className={cx(
                'h-2 rounded-full transition-all duration-200',
                i === active ? 'w-6 bg-primary' : 'w-2 bg-ink/25 hover:bg-ink/40',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 text-ink transition-colors hover:border-ink hover:bg-ink/5"
          aria-label="Next slide"
        >
          <Icon name="arrowRight" size={18} />
        </button>
      </div>

      {/* Screen reader: active slide image description */}
      <p className="sr-only" aria-live="polite">
        {slide.alt}
      </p>
    </section>
  )
}
