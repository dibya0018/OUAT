import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import ProductGrid from '../product/ProductGrid'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { getFeaturedProducts } from '../../services/productService'

/** Home best sellers: the products ticked "Featured" in the admin product editor. */
export default function FeaturedProducts() {
  const [products, setProducts] = useState(null)
  useEffect(() => {
    getFeaturedProducts(4).then(setProducts)
  }, [])

  return (
    <section className="section-white py-24 md:py-32" aria-labelledby="featured-title">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            titleAccent="Our"
            titleRest="Best Sellers"
            id="featured-title"
          />
          <Link to="/shop" className="link-underline inline-flex items-center gap-2 text-sm text-primary">
            Shop All <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>
        <div className="mt-16">
          <ProductGrid products={products ?? []} loading={products === null} />
        </div>
      </Container>
    </section>
  )
}
