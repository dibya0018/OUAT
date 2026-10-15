import Container from '../ui/Container'
import Reveal from '../ui/Reveal'

export default function BrandStatement() {
  return (
    <section
      className="border-t border-line bg-cream py-16 md:py-24"
      aria-label="About O.U.A.T."
    >
      <Container>
        <Reveal className="mx-auto max-w-4xl text-center">
          {/* The three actions carry the meaning, so they get the accent and their own line. */}
          <p className="display-title mt-2 text-[1.75rem] leading-[1.2] text-ink sm:text-3xl md:text-4xl">
            <span className="block">An endeavour to</span>
            <span className="block text-accent">reuse, upcycle and reduce</span>
            <span className="block">our carbon footprint.</span>
          </p>
          <p className="mt-8 font-sans text-lg font-normal text-ink-soft md:text-xl">
            Transforming waste into timeless creations, O.U.A.T. repurposes locally sourced glass bottles into
            sustainable, handcrafted lifestyle pieces. Designed with care, each product blends functionality with
            conscious living.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
