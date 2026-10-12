import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { getCollectionPath } from '../../lib/collections'
import { getCollections } from '../../services/productService'

export default function CollectionsGrid() {
  const [collections, setCollections] = useState([])
  useEffect(() => {
    getCollections().then(setCollections)
  }, [])

  return (
    <section className="section-white border-t border-line py-24 md:py-32" aria-labelledby="collections-title">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Collections"
            titleAccent="Four ways"
            titleRest="a bottle comes back"
            id="collections-title"
          />
          <Link to="/shop" className="link-underline inline-flex items-center gap-2 text-sm text-primary">
            View all pieces <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {collections.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 80}>
              <Link to={getCollectionPath(c.slug)} className="group block">
                <div className="zoom-media">
                  <ImagePlaceholder ratio="product" src={c.image.src} alt={c.image.alt} tone={c.image.tone} label={c.name} />
                </div>
                <h3 className="mt-4 font-display text-xl md:text-2xl">{c.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{c.tagline}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
