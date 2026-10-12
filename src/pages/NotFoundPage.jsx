import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" description="The page you were looking for has moved on." path="/404" noIndex />
      <section className="flex min-h-[70vh] items-center py-24">
        <Container className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow">404</p>
            <h1 className="mt-6 text-4xl md:text-6xl">This page has already been reshaped into something else.</h1>
            <p className="mt-6 max-w-md text-ink-soft">
              Like a bottle after its first life, the page you were looking for isn’t here any more. Everything we make is a
              step away.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button to="/shop">Shop the collection</Button>
              <Button to="/" variant="outline">
                Back home
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
