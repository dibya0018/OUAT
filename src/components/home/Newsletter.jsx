import Container from '../ui/Container'

/**
 * Sand-textured band above the footer. Content intentionally left empty for now —
 * new copy (and the sign-up form, via subscribeNewsletter in formService) will be added later;
 * the band keeps its place and height on the page.
 */
export default function Newsletter() {
  return (
    <section className="goa-sand py-24 md:py-32" aria-hidden="true">
      <Container>
        <div className="min-h-[8rem] md:min-h-[9rem]" />
      </Container>
    </section>
  )
}
