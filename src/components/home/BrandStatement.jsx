import Container from '../ui/Container'
import EditorialTitle from '../ui/EditorialTitle'
import Reveal from '../ui/Reveal'

export default function BrandStatement() {
  return (
    <section
      className="border-t border-line bg-cream py-16 md:py-24"
      aria-label="About O.U.A.T."
    >
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <EditorialTitle
            as="p"
            size="lg"
            accent="Once discarded."
            rest="Now designed."
            className="mt-2"
          />
          <p className="mt-8 font-sans text-lg font-normal text-ink-soft md:text-xl">
            We are a women-led studio in Goa that collects bottles after their first life and shapes them,
            by hand, into glassware, candles and objects worth keeping.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
