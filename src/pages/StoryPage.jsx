import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { PROCESS_STEPS } from '../data/process'
import { IMPACT_FACTS } from '../lib/site'

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
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow">Our story</p>
              <h1 className="mt-6 text-4xl md:text-6xl">Once Upon A Time… a bottle. Now, a glass.</h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="text-ink-soft">
                O.U.A.T. began with a simple observation: Goa pours a great deal of wine, and the bottles were going
                nowhere good. We decided to give them somewhere to go.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Founder */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="founder-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
            <Reveal className="md:col-span-5">
              <ImagePlaceholder ratio="product" alt="Atika Gaur in the O.U.A.T. studio, Goa" tone="olive" label="Atika Gaur" />
            </Reveal>
            <Reveal delay={100} className="md:col-span-6 md:col-start-7">
              <SectionHeading eyebrow="The founder" title="Atika Gaur" id="founder-title" />
              <div className="mt-8 flex flex-col gap-6 text-ink-soft">
                <p>
                  Atika came to glass the long way round: through design, through a move to Goa, and through a growing
                  pile of bottles on her own kitchen counter. The first tumbler was cut with a borrowed tool and a lot
                  of patience. It was uneven, a little too tall, and she still drinks from it.
                </p>
                <p>
                  What started as a weekend experiment became a studio. Today O.U.A.T. is a women-led team working
                  with local artisans, and the pieces are found on tables, in hotels and in homes across India.
                </p>
                <p className="font-display text-2xl text-primary not-italic">
                  “I’m not interested in making things that look recycled. I want to make things people choose
                  because they are beautiful, and then discover the story.”
                </p>
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
      <section className="py-24 md:py-32" aria-labelledby="story-process-title">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="The process" title="Rescued. Reshaped. Reborn." id="story-process-title" />
          </Reveal>
          <ol className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 100}>
                <span className="font-sans text-xs tracking-eyebrow text-ink-soft">{s.step}</span>
                <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{s.text}</p>
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
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                {IMPACT_FACTS.map((f) => (
                  <div key={f.label}>
                    <dd className="font-display text-2xl text-primary md:text-3xl">{f.value}</dd>
                    <dt className="mt-1 text-xs text-ink-soft">{f.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={100} className="order-1 md:order-2 md:col-span-5 md:col-start-8">
              <ImagePlaceholder ratio="product" alt="Artisan polishing a glass rim in the studio" tone="sand" label="The studio" />
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
              Every bottle has a past. We give it a future.
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
