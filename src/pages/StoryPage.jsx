import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import founderPortrait from '../components/images/founder-atika.webp'
import beforeBeachBottle from '../components/images/story-before-beach-bottle.webp'
import afterOfficeTumbler from '../components/images/story-after-office-tumbler.webp'

/**
 * Story film banner. `src` is a file in public/videos; set it to null to show the plain
 * "coming soon" frame instead. `poster` is optional.
 */
const STORY_FILM = {
  src: '/videos/our-story.mp4',
  poster: undefined,
  alt: 'The O.U.A.T. story film',
}

/** Before/after pairs: the bottle on the left, the finished piece on the right. */
const PAIRS = [
  {
    before: {
      src: beforeBeachBottle,
      alt: 'An empty green wine bottle lying as litter in the sand on a beach',
      tone: 'olive',
    },
    after: {
      src: afterOfficeTumbler,
      alt: 'A hand holding an olive-green O.U.A.T. tumbler, cut from a wine bottle, at an office desk beside a laptop',
      tone: 'sand',
    },
    caption: 'Wine bottle → Tall tumbler',
  },
]

/** Muted looping film. With reduced motion on it doesn't autoplay; the controls still let people play it. */
function StoryFilm({ src, poster, alt }) {
  const videoRef = useRef(null)
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reduceMotion) video.pause()
    else video.play().catch(() => {})
  }, [reduceMotion])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      controls
      preload={reduceMotion ? 'metadata' : 'auto'}
      aria-label={alt}
    />
  )
}

export default function StoryPage() {
  return (
    <>
      <Seo
        title="Our Story"
        description="O.U.A.T. is a women-led studio in Goa founded by Atika Gaur. We collect bottles after their first life and reshape them by hand into glassware, candles and objects worth keeping."
        path="/story"
      />

      {/* Intro */}
      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          <h1 className="eyebrow">Our story</h1>

          {/* Film banner */}
          <Reveal className="mt-6 md:mt-8">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink sm:aspect-video lg:aspect-[21/9]">
              {STORY_FILM.src ? (
                <StoryFilm {...STORY_FILM} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-cream">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-cream/60 md:h-16 md:w-16">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true">
                      <path d="M7 4.5v15l12-7.5z" />
                    </svg>
                  </span>
                  <div>
                    <p className="eyebrow text-cream/85">Our film</p>
                    <p className="mt-1 font-display text-xl md:text-2xl">Coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Founder */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="founder-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
            <Reveal className="md:col-span-5">
              <ImagePlaceholder
                src={founderPortrait}
                ratio="product"
                alt="Atika Gaur, founder of O.U.A.T., laughing as she sits on a patterned armchair"
                imgClassName="object-top"
              />
            </Reveal>
            <Reveal delay={100} className="md:col-span-6 md:col-start-7">
              <SectionHeading eyebrow="The founder" title="Atika Gaur" id="founder-title" />
              <div className="mt-8 flex flex-col gap-6 text-ink-soft">
                <p>
                  Driven by a passion for circularity and transforming waste glass into worth, we set out to give
                  discarded glass bottles a new life through thoughtful design and craftsmanship. By repurposing
                  locally collected waste glass into functional, stylish and{' '}
                  <Link to="/shop" className="link-underline text-ink">
                    premium lifestyle products
                  </Link>
                  , we embrace circular design to reduce waste and extend the life of valuable materials. Through
                  innovative techniques and the skill of our artisans, we create pieces that bring together
                  sustainability, functionality and contemporary aesthetics.
                </p>
                <p className="font-hand text-[1.6rem] leading-snug text-ink md:text-[1.75rem]">
                  As the founder, I warmly invite you to join us on this journey towards a circular future, where
                  waste becomes a resource, design inspires change, and beauty goes hand in hand with responsibility.
                  Together, we can make a meaningful difference and build a greener, more sustainable world.
                </p>
                <p className="font-hand text-3xl font-semibold text-primary md:text-4xl">Atika Gaur</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Before / after */}
      <section className="section-cream py-24 md:py-32" aria-labelledby="pairs-title">
        <Container>
          <Reveal>
            <SectionHeading
              title="Beauty, Reborn"
              lede="Giving discarded bottles a new life through thoughtful design and creative upcycling."
              id="pairs-title"
            />
          </Reveal>
          <ul className="mt-16 flex flex-col gap-16">
            {PAIRS.map((pair, i) => (
              <Reveal as="li" key={pair.caption} delay={i * 80}>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {[
                    { ...pair.before, label: 'Before' },
                    { ...pair.after, label: 'After' },
                  ].map((side) => (
                    <div key={side.label} className="relative">
                      <ImagePlaceholder
                        ratio="product"
                        src={side.src}
                        alt={side.alt}
                        tone={side.tone}
                        label={side.label}
                        sizes="(min-width: 768px) 40vw, 50vw"
                      />
                      {side.src && (
                        <span className="absolute top-3 left-3 bg-cream/85 px-2.5 py-1 font-sans text-[0.6rem] uppercase tracking-eyebrow text-ink">
                          {side.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-soft">{pair.caption}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="section-white py-24 md:py-32" aria-label="Philosophy">
        <Container>
          <Reveal className="mx-auto max-w-5xl text-center">
            <p className="font-display text-2xl leading-tight font-light text-ink md:text-3xl lg:text-4xl">
              <span className="block text-primary lg:whitespace-nowrap">Together, let’s create a world</span>
              <span className="block lg:whitespace-nowrap">where beauty meets sustainability!</span>
            </p>
            <div className="mt-12">
              <Button to="/shop" variant="solid">
                Shop the collection
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
