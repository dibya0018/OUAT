import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { PROCESS_STEPS } from '../data/process'
import founderPortrait from '../components/images/founder-atika.jpg'
import studioGrinding from '../components/images/studio-grinding.webp'

/**
 * Story film banner. Set `src` to a video (e.g. an import from ../components/videos/story.mp4)
 * and it plays in the banner; until then a plain "coming soon" frame shows. `poster` is optional.
 */
const STORY_FILM = {
  src: null,
  poster: undefined,
  alt: 'The O.U.A.T. story film',
}

/** One icon per process step, in PROCESS_STEPS order. */
const STEP_ICONS = ['bottle', 'scissors', 'sparkle']

/** Before/after pairs: the bottle on the left, the finished piece on the right. */
const PAIRS = [
  {
    before: { alt: 'Empty green wine bottle on the studio bench', tone: 'olive' },
    after: { alt: 'Tall green tumbler made from the same bottle', tone: 'sand' },
    caption: 'Wine bottle → Tall tumbler',
  },
  {
    before: { alt: 'Empty amber whisky bottle', tone: 'deep' },
    after: { alt: 'Soy candle in amber glass', tone: 'sand' },
    caption: 'Whisky bottle → Soy candle',
  },
  {
    before: { alt: 'Empty clear gin bottle', tone: 'sand' },
    after: { alt: 'Cork-lidded storage jar', tone: 'olive' },
    caption: 'Gin bottle → Storage jar',
  },
]

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
                <video
                  src={STORY_FILM.src}
                  poster={STORY_FILM.poster}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  aria-label={STORY_FILM.alt}
                />
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
                <p className="text-ink">
                  As the founder, I warmly invite you to join us on this journey towards a circular future, where
                  waste becomes a resource, design inspires change, and beauty goes hand in hand with responsibility.
                  Together, we can make a meaningful difference and build a greener, more sustainable world.
                </p>
                <p className="font-display text-xl text-primary">— Atika Gaur</p>
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
              eyebrow="Before and after"
              title="Same glass, second life"
              lede="Nothing is remelted. The bottle you see on the left is, quite literally, the piece on the right."
              id="pairs-title"
            />
          </Reveal>
          <ul className="mt-16 flex flex-col gap-16">
            {PAIRS.map((pair, i) => (
              <Reveal as="li" key={pair.caption} delay={i * 80}>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <ImagePlaceholder ratio="product" alt={pair.before.alt} tone={pair.before.tone} label="Before" />
                  <ImagePlaceholder ratio="product" alt={pair.after.alt} tone={pair.after.tone} label="After" />
                </div>
                <p className="mt-4 text-sm text-ink-soft">{pair.caption}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Process */}
      <section className="section-cream py-24 md:py-32" aria-labelledby="story-process-title">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionHeading
              eyebrow="The process"
              title="How a bottle becomes a piece"
              lede="No furnace, no remelting. Just three careful steps, all done by hand in our Goa studio."
              align="center"
              id="story-process-title"
            />
          </Reveal>
          {/* Dashed line behind the cards links the steps into one journey (desktop only). */}
          <ol className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:before:absolute md:before:inset-x-[16%] md:before:top-[3.75rem] md:before:border-t md:before:border-dashed md:before:border-primary/40">
            {PROCESS_STEPS.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 120} className="relative">
                <div className="group relative h-full overflow-hidden border border-line bg-white p-8 transition-[translate,box-shadow] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(45_45_45/0.08)] md:p-10">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-4 font-display text-8xl font-light leading-none text-primary/10 transition-colors duration-300 group-hover:text-primary/20"
                  >
                    {s.step}
                  </span>
                  <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-cream">
                    <Icon name={STEP_ICONS[i]} size={24} strokeWidth={1.5} />
                  </span>
                  <p className="mt-8 font-sans text-xs tracking-eyebrow text-ink-soft">Step {s.step}</p>
                  <h3 className="mt-2 font-display text-3xl text-ink">{s.title}</h3>
                  <p className="mt-4 leading-relaxed text-ink-soft">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Artisans & Goa */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="artisans-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
            <Reveal className="order-2 md:order-1 md:col-span-6">
              <SectionHeading eyebrow="Artisans & Goa" title="Made by hand, in a place that takes its time" id="artisans-title" />
              <div className="mt-8 flex flex-col gap-6 text-ink-soft">
                <p>
                  Every piece is cut, ground and finished by local artisans in our Goa studio. Many of them had never
                  worked with glass before; all of them now have a hand steadier than ours.
                </p>
                <p>
                  Goa shapes the work in quieter ways too. The light, the pace, the long dinners that produce the
                  bottles in the first place. It is hard to make something hurried here, and we have stopped trying.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100} className="order-1 md:order-2 md:col-span-5 md:col-start-8">
              <ImagePlaceholder
                src={studioGrinding}
                ratio="product"
                alt="Grinding the cut edge of a green glass bottle on a wheel in the studio workshop"
                imgClassName="object-top"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="bg-primary py-24 text-cream md:py-32" aria-label="Philosophy">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-cream/85">Philosophy</p>
            <p className="mt-8 font-display text-3xl font-light text-cream md:text-5xl">
              Welcome to the World where creativity meets Consciousness!
            </p>
            <div className="mt-12">
              <Button to="/shop" variant="inverse">
                Shop the collection
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
