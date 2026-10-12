import Container from '../ui/Container'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'

/** Full-width band in the primary green inviting gifting and trade enquiries. */
export default function B2BBand() {
  return (
    <section className="bg-primary py-24 text-cream md:py-32" aria-labelledby="b2b-title">
      <Container>
        <Reveal className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow text-cream/80">Gifting & B2B</p>
            <h2 id="b2b-title" className="mt-6 font-display text-3xl font-light text-cream md:text-5xl">
              Glassware with a story, for your table or your clients.
            </h2>
            <p className="mt-6 max-w-xl text-base text-cream/90 md:text-lg">
              We work with hotels, restaurants, designers and companies on bespoke sets, engraved pieces
              and gift boxes, in quantities from twenty to several thousand.
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Button to="/gifting-b2b" variant="inverse">
              Start an enquiry
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
