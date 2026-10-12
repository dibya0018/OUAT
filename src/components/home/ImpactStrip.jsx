import Container from '../ui/Container'
import Reveal from '../ui/Reveal'
import { IMPACT_FACTS } from '../../lib/site'

/** Three approved impact facts. Copy lives in lib/site.js — do not add claims here. */
export default function ImpactStrip() {
  return (
    <section className="section-white border-t border-line py-24 md:py-32" aria-label="Impact">
      <Container>
        <dl className="grid grid-cols-1 divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {IMPACT_FACTS.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 100} className="flex flex-col gap-3 py-10 md:px-10 md:first:pl-0 md:last:pr-0">
              <dt className="order-2 max-w-xs text-sm text-ink-soft">{fact.label}</dt>
              <dd className="order-1 font-display text-4xl font-normal text-ink md:text-5xl">{fact.value}</dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  )
}
