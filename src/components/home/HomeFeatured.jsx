import { useEffect, useState } from 'react'
import Container from '../ui/Container'
import { ArrowLink, Eyebrow, FadeUp, RevealLines } from './kit'
import HomeProductTile from './HomeProductTile'
import { getFeaturedProducts } from '../../services/productService'

const SKELETON = 4

/** 04 — A tight edit of hero products, shelf-style tiles (not a dense catalog grid). */
export default function HomeFeatured() {
  const [products, setProducts] = useState(null)

  useEffect(() => {
    getFeaturedProducts(SKELETON).then((list) => setProducts(Array.isArray(list) ? list.slice(0, SKELETON) : []))
  }, [])

  const loading = products === null

  return (
    <section className="home-section border-t border-line bg-white" aria-labelledby="home-featured-title">
      <Container>
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow index="04">Featured</Eyebrow>
            <RevealLines
              as="h2"
              id="home-featured-title"
              className="home-display-lg mt-6 text-ink lg:mt-8"
              lines={[
                'Pieces we',
                <em key="keep" className="italic text-accent">
                  keep reaching for
                </em>,
              ]}
            />
          </div>
          <FadeUp delay={120} className="lg:pb-1">
            <ArrowLink to="/shop">View all pieces</ArrowLink>
          </FadeUp>
        </header>

        <ul
          className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-16"
          aria-busy={loading || undefined}
        >
          {loading
            ? Array.from({ length: SKELETON }, (_, i) => (
                <li key={i} aria-hidden="true">
                  <div className="aspect-[4/5] bg-cream" />
                  <div className="mt-4 h-6 w-2/3 bg-cream" />
                </li>
              ))
            : products.map((product, index) => (
                <FadeUp as="li" key={product.id} delay={index * 70}>
                  <HomeProductTile product={product} priority={index < 2} />
                </FadeUp>
              ))}
        </ul>
      </Container>
    </section>
  )
}
