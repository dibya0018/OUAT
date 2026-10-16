import Container from '../ui/Container'

/**
 * Full-width band in the primary green. Content intentionally left empty for now —
 * the copy and button will be added later; the band keeps its place and height on the page.
 */
export default function B2BBand() {
  return (
    <section className="bg-primary py-24 text-cream md:py-32" aria-hidden="true">
      <Container>
        <div className="min-h-[12rem] md:min-h-[14rem]" />
      </Container>
    </section>
  )
}
