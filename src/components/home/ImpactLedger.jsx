import Container from '../ui/Container'
import { IMPACT_FACTS, IMPACT_PER_KG } from '../../lib/site'
import { ArrowLink, CountUp, Eyebrow, FadeUp } from './kit'

/*
 * Every figure and label below is read from lib/site.js, the only approved
 * source for impact claims. Nothing here adds to or rewords them.
 */

/** The first approved fact is the headline figure; the others become quiet notes. */
const [HEADLINE, ...NOTES] = IMPACT_FACTS

/** Splits "1.2 kg" into its figure and its unit, so the unit can sit small beside the number. */
function splitUnit(value) {
  const space = value.lastIndexOf(' ')
  return space === -1 ? [value, ''] : [value.slice(0, space), value.slice(space + 1)]
}

/** 05 — Impact: the approved figures set like a printed ledger, counted up once as they arrive. */
export default function ImpactLedger() {
  return (
    <section className="home-section bg-cream text-ink" aria-labelledby="impact-ledger-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-[clamp(3.5rem,9vw,5rem)] lg:grid-cols-12 lg:gap-x-6">
          {/* Left: the heading at the top of the column, the one large figure anchored to its foot. */}
          <div className="flex flex-col lg:col-span-7">
            <FadeUp>
              <Eyebrow index="06">Impact</Eyebrow>
              <h2 id="impact-ledger-title" className="home-display-md mt-6 text-ink md:mt-8">
                What a second life <em className="block italic text-accent">adds up to</em>
              </h2>
            </FadeUp>

            <div className="mt-[clamp(2.5rem,8vw,4rem)] lg:mt-auto lg:pt-24">
              <p className="-ml-[0.04em] font-display text-[clamp(5rem,27vw,13rem)] font-light leading-[0.8] tracking-[-0.03em] text-primary lg:text-[clamp(5rem,16vw,15rem)]">
                <CountUp value={HEADLINE.value} duration={2000} />
              </p>
              <p className="mt-5 max-w-[15rem] text-[0.9375rem] leading-snug text-ink md:mt-7 md:text-base">
                {HEADLINE.label}
              </p>
            </div>
          </div>

          {/* Right: the per-kilogram ledger, two notes, and the way on. */}
          <div className="lg:col-span-5 lg:col-start-8">
            <FadeUp as="h3" className="home-label text-ink">
              For every kilogram of glass we upcycle
            </FadeUp>

            <dl className="mt-5 border-t border-line md:mt-6">
              {IMPACT_PER_KG.map((row, index) => {
                const [figure, unit] = splitUnit(row.value)
                return (
                  <FadeUp
                    key={row.label}
                    delay={index * 90}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-5 md:py-6"
                  >
                    <dt className="text-sm text-ink first-letter:uppercase">{row.label}</dt>
                    <dd className="flex items-baseline gap-2 font-display text-[clamp(2.25rem,3.6vw,3.25rem)] font-light leading-none tracking-[-0.02em] text-ink">
                      <CountUp value={figure} />
                      {unit && (
                        <span className="font-sans text-[0.8125rem] font-normal tracking-normal text-ink-soft">
                          {unit}
                        </span>
                      )}
                    </dd>
                  </FadeUp>
                )
              })}
            </dl>

            <FadeUp as="ul" className="mt-10 grid grid-cols-2 gap-x-6 md:mt-12">
              {NOTES.map((note) => (
                <li key={note.value}>
                  <p className="font-display text-[1.375rem] leading-tight text-ink">{note.value}</p>
                  <p className="mt-1.5 max-w-[14rem] text-sm text-ink-soft">{note.label}</p>
                </li>
              ))}
            </FadeUp>

            <FadeUp className="mt-10 md:mt-12">
              <ArrowLink to="/impact">See our impact</ArrowLink>
            </FadeUp>
          </div>
        </div>
      </Container>
    </section>
  )
}
