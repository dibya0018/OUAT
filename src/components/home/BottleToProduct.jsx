import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import { PROCESS_STEPS } from '../../data/process'

export default function BottleToProduct() {
  return (
    <section className="section-white border-t border-line py-24 md:py-32" aria-labelledby="process-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Bottle to product"
            titleAccent="Three quiet"
            titleRest="steps"
            lede="The glass is never melted. It is cut, ground and finished by hand, which keeps the process low in energy and the result full of character."
            as="h2"
            id="process-title"
          />
        </Reveal>

        <ol className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
          {PROCESS_STEPS.map((s, i) => (
            <Reveal as="li" key={s.step} delay={i * 100}>
              <div className="zoom-media">
                <ImagePlaceholder ratio="product" src={s.image.src} alt={s.image.alt} tone={s.image.tone} label={s.title} />
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
  )
}
