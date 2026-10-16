import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import EditorialTitle from '../components/ui/EditorialTitle'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { IMPACT_PER_KG } from '../lib/site'
import impactCollecting from '../components/images/impact-collecting.jpg'
import impactBottles from '../components/images/impact-bottles.jpg'
import impactGrinding from '../components/images/impact-grinding.webp'
import impactGlassware from '../components/images/impact-glassware.jpg'

/*
 * Copy and figures here come from the brand's own About page (ouatworld.com/about)
 * and the approved claims in lib/site.js. Do not add new figures without sign-off.
 */

/** A bottle's journey in the studio's own photos, left to right. */
const JOURNEY = [
  {
    label: 'Collected',
    text: 'Discarded glass bottles are rescued from homes, bars, and waste sites across Goa, giving them a second chance before they reach landfill.',
    src: impactCollecting,
    alt: 'Atika and a team member sorting discarded wine bottles from a waste pile in Goa',
  },
  {
    label: 'Sorted & Cleaned',
    text: 'Each bottle is carefully sorted by colour and size, thoroughly washed, and stripped of its labels, preparing it for a new purpose.',
    src: impactBottles,
    alt: 'Rows of empty brown beer bottles gathered on the studio floor',
    imgClassName: 'object-top',
  },
  {
    label: 'Cut & Refined',
    text: 'Each bottle is cut into new forms, with the edges carefully ground and sanded to create smooth, safe, and refined finishes.',
    src: impactGrinding,
    alt: 'Grinding the cut edge of a green glass bottle on a wheel in the studio workshop',
    imgClassName: 'object-top',
  },
  {
    label: 'Redesigned',
    text: 'What was once discarded is transformed into thoughtfully crafted home and lifestyle products, ready to find a new place in eco-conscious homes.',
    src: impactGlassware,
    alt: 'Upcycled green, amber and clear tumblers and two bottle vases holding flowers',
  },
]

const VALUES = [
  {
    icon: 'bottle',
    title: 'Made from Waste',
    text: 'Our products are upcycled from materials that were once considered waste. This process may result in variations, flaws, and imperfections, which are natural in handmade items. These unique characteristics should be celebrated for their uniqueness.',
  },
  {
    icon: 'leaf',
    title: 'Low Impact Production Process',
    text: 'Our process involves cutting bottles into different sizes and shapes, and meticulously sanding the edges using a simple, energy-efficient machine, minimising environmental impact with minimal electricity consumption. Each piece is artisanally handcrafted, blending sustainability and style!',
  },
  {
    icon: 'upcycle',
    title: 'Upcycling, Not Recycling',
    text: 'Upcycling transforms materials into higher-value products while maintaining their original qualities, unlike recycling, which breaks them down. This method preserves the energy from their initial creation and significantly reduces environmental impact.',
  },
  {
    icon: 'women',
    title: 'Women Owned',
    text: 'Our studio is owned and run by women. Your purchase directly supports a woman-led business and the livelihoods that grow from it.',
  },
  {
    icon: 'heart',
    title: 'Cruelty Free',
    text: 'At O.U.A.T., we cherish all creatures and proudly uphold our commitment as a vegan brand. Our candles are crafted without any animal-based materials, reflecting our commitment to compassion and ethical practices.',
  },
  {
    icon: 'pin',
    title: 'From Goa, India',
    text: 'Designed and handmade in Goa. Buying from us supports local craft and community.',
  },
]

export default function ImpactPage() {
  return (
    <>
      <Seo
        title="Our Impact"
        description="Every O.U.A.T. piece starts as a discarded glass bottle. 6,000+ bottles rescued in Goa and upcycled by hand with a low-impact, women-led, cruelty-free process."
        path="/impact"
      />

      {/* Intro */}
      <section className="section-white pb-16 pt-10 md:pb-24 md:pt-16">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow">Our impact</p>
            <EditorialTitle
              as="h1"
              size="md"
              stacked
              accent="Every piece starts as something"
              rest="the world was ready to throw away."
              className="mt-6"
            />
            <div aria-hidden="true" className="mx-auto mt-8 h-px w-16 bg-primary/40" />
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
              We give discarded bottles a second life, transforming them into thoughtful everyday pieces with care for the
              planet and the people behind every creation!
            </p>
          </div>
        </Container>
      </section>

      {/* Headline figure */}
      <section className="section-cream py-20 md:py-28" aria-label="Bottles rescued">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="font-display text-6xl font-light text-primary sm:text-7xl md:text-8xl">6,000+</p>
            <p className="mt-4 font-display text-2xl text-ink md:text-3xl">
              bottles rescued. <span className="text-accent">Zero wasted.</span>
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Journey */}
      <section className="py-24 md:py-32" aria-labelledby="journey-title">
        <Container>
          <Reveal>
            <SectionHeading
              title="The Transformation Journey"
              id="journey-title"
            />
          </Reveal>
          <ol className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
            {JOURNEY.map((step, i) => (
              <Reveal as="li" key={step.label} delay={i * 100} className="relative">
                <div className="zoom-media">
                  <ImagePlaceholder ratio="product" src={step.src} alt={step.alt} imgClassName={step.imgClassName} />
                </div>
                {i < JOURNEY.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-[40%] -right-[2.375rem] z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-primary text-cream lg:flex"
                  >
                    <Icon name="arrowRight" size={16} strokeWidth={1.75} />
                  </span>
                )}
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="font-sans text-xs tracking-eyebrow text-ink-soft">0{i + 1}</span>
                  <h3 className="font-display text-xl md:text-2xl">{step.label}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Values */}
      <section className="section-cream py-24 md:py-32" aria-label="What we stand for">
        <Container>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.title} delay={(i % 3) * 80} className="border-t border-line pt-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-cream">
                  <Icon name={v.icon} size={22} strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-2xl">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{v.text}</p>
              </Reveal>
            ))}
          </ul>
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

      {/* Your part */}
      <section className="section-cream py-24 md:py-32" aria-label="Your part">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Your part</p>
            <p className="mt-8 font-display text-3xl font-light text-ink md:text-5xl">
              Every product you choose contributes to a{' '}
              <span className="text-accent">cleaner, more sustainable future.</span>
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button to="/shop" variant="solid">
                Shop the collection
              </Button>
              <Button to="/story" variant="outline">
                Read our story
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
