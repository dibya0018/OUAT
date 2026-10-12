import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { PROCESS_STEPS } from '../data/process'
import { IMPACT_FACTS, IMPACT_PER_KG } from '../lib/site'

/*
 * Copy and figures here come from the brand's own About page (ouatworld.com/about)
 * and the approved claims in lib/site.js. Do not add new figures without sign-off.
 */

const PRINCIPLES = ['Reuse', 'Repurpose', 'Upcycle']

/** How the studio's way of working helps, one idea per card. */
const WAYS = [
  {
    title: 'We catch bottles before they are thrown away',
    text: 'Bottles are collected from restaurants, bars and homes across Goa. Each one we take is one that does not go out with the rubbish.',
  },
  {
    title: 'We never remelt the glass',
    text: 'Melting glass needs a furnace and a great deal of heat. We cut, grind and polish by hand instead, so the work stays low in energy.',
  },
  {
    title: 'We use what already exists',
    text: 'The glass in your tumbler was made once, for a bottle. Giving it a second life means nothing new has to be made for it.',
  },
  {
    title: 'We make things to be kept',
    text: 'A piece that is used for years replaces many that are used once. We finish every rim and edge so it earns its place on the table.',
  },
]

/** What a single bottle goes through, told from the bottle's side. */
const JOURNEY = [
  { label: 'First life', text: 'A bottle of wine, whisky or gin is poured and emptied in an evening.' },
  { label: 'The usual ending', text: 'It is thrown away. Glass does not rot or break down, so it stays wherever it lands.' },
  { label: 'Our ending', text: 'It is collected, washed, cut and finished by hand, and becomes a glass, a candle or a jar.' },
]

export default function ImpactPage() {
  return (
    <>
      <Seo
        title="Our Impact"
        description="From waste to wealth: how O.U.A.T. upcycles discarded glass bottles in Goa to reduce landfill, save raw materials and fuel, and cut CO₂ emissions."
        path="/impact"
      />

      {/* Intro */}
      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow">Our impact on the planet</p>
              <h1 className="mt-6 text-4xl md:text-6xl">From waste to wealth.</h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="text-ink-soft">
                O.U.A.T. is a Goa-based sustainable brand transforming discarded glass bottles into thoughtfully
                crafted glassware, candles and décor. By upcycling glass waste, we reduce landfill burden and
                environmental damage while conserving natural resources.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Approved facts */}
      <section className="border-t border-line py-16 md:py-24" aria-label="Impact at a glance">
        <Container>
          <dl className="grid grid-cols-1 divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {IMPACT_FACTS.map((fact, i) => (
              <Reveal
                key={fact.label}
                delay={i * 100}
                className="flex flex-col gap-3 py-10 md:px-10 md:first:pl-0 md:last:pr-0"
              >
                <dt className="order-2 max-w-xs text-sm text-ink-soft">{fact.label}</dt>
                <dd className="order-1 font-display text-4xl font-normal text-ink md:text-5xl">{fact.value}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Per-kg savings */}
      <section className="bg-primary py-24 text-cream md:py-32" aria-labelledby="per-kg-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Sustainability in action"
              title="What 1 kg of upcycled glass saves"
              lede="Every kilogram of glass we upcycle, instead of letting it go to waste, adds up to this."
              inverse
              id="per-kg-title"
            />
          </Reveal>
          <dl className="mt-16 grid grid-cols-1 gap-10 border-t border-cream/25 pt-10 md:grid-cols-3 md:gap-6">
            {IMPACT_PER_KG.map((f, i) => (
              <Reveal key={f.label} delay={i * 100} className="flex flex-col gap-3">
                <dt className="order-2 text-sm text-cream/85">{f.label}</dt>
                <dd className="order-1 font-display text-5xl font-light text-cream md:text-6xl">{f.value}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Vision & mission */}
      <section className="py-24 md:py-32" aria-label="Vision and mission">
        <Container>
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-6">
            <Reveal>
              <SectionHeading eyebrow="Our vision" title="A greener lifestyle for a greener tomorrow" />
              <p className="mt-8 max-w-md text-ink-soft">
                To help people live a greener and more sustainable lifestyle, for a greener tomorrow.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <SectionHeading eyebrow="Our mission" title="Crafting sustainability with purpose" />
              <p className="mt-8 max-w-md text-ink-soft">
                Through a consciously curated selection of eco-friendly, sustainable products, we reinforce three
                simple ideas.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                {PRINCIPLES.map((p) => (
                  <li key={p} className="font-display text-2xl text-primary">
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* The problem */}
      <section className="section-cream py-24 md:py-32" aria-labelledby="problem-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <SectionHeading
                eyebrow="Why it matters"
                title="A bottle is used for one evening and lasts for centuries"
                id="problem-title"
              />
            </Reveal>
            <ol className="flex flex-col md:col-span-6 md:col-start-7">
              {JOURNEY.map((j, i) => (
                <Reveal as="li" key={j.label} delay={i * 80} className="border-t border-line py-6 last:border-b">
                  <p className="font-sans text-xs tracking-eyebrow text-ink-soft">{j.label}</p>
                  <p className="mt-2 text-ink">{j.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* How we help */}
      <section className="py-24 md:py-32" aria-labelledby="ways-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="How we help nature"
              title="Four small decisions, made every day"
              lede="None of this is complicated. It is simply the slower way of doing things, done on purpose."
              id="ways-title"
            />
          </Reveal>
          <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2">
            {WAYS.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 80} className="border-t border-line pt-6">
                <span className="font-sans text-xs tracking-eyebrow text-ink-soft">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-display text-2xl">{w.title}</h3>
                <p className="mt-3 max-w-md text-sm text-ink-soft">{w.text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Process */}
      <section className="section-white border-t border-line py-24 md:py-32" aria-labelledby="impact-process-title">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="From waste to table"
              title="Rescued. Reshaped. Reborn."
              lede="The bottle you finished last month could be the glass you drink from next month."
              id="impact-process-title"
            />
          </Reveal>
          <ol className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 100}>
                <div className="zoom-media">
                  <ImagePlaceholder
                    ratio="product"
                    src={s.image.src}
                    alt={s.image.alt}
                    tone={s.image.tone}
                    label={s.title}
                  />
                </div>
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="font-sans text-xs tracking-eyebrow text-ink-soft">{s.step}</span>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                </div>
                <p className="mt-3 max-w-sm text-sm text-ink-soft">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* People + honesty */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="people-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-6">
            <Reveal>
              <SectionHeading eyebrow="People" title="Good for Goa, too" id="people-title" />
              <p className="mt-8 max-w-md text-ink-soft">
                Every piece is cut, ground and finished by local artisans in our women-led studio. The work stays in
                Goa, close to where the bottles are collected, so the glass does not travel far to be remade.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <SectionHeading eyebrow="Where it all began" title="A first small step, in January 2022" as="h2" />
              <p className="mt-8 max-w-md text-ink-soft">
                O.U.A.T. was born from one question: how can I help protect the planet, or at least not harm her?
                Founder Atika Gaur’s first step towards a smaller carbon footprint was upcycling — taking objects
                once labelled “waste” and turning them into eco-friendly treasures.
              </p>
              <p className="mt-6 max-w-md font-display text-2xl text-primary">
                “One man’s waste is another man’s treasure.”
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Your part */}
      <section className="bg-primary py-24 text-cream md:py-32" aria-label="Your part">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-cream/85">Your part</p>
            <p className="mt-8 font-display text-3xl font-light text-cream md:text-5xl">
              Every product you choose contributes to a cleaner, more sustainable future.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button to="/shop" variant="inverse">
                Shop the collection
              </Button>
              <Button to="/story" variant="inverse">
                Read our story
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
