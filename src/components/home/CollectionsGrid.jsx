import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { getCollectionPath, shopMenuCollections } from '../../lib/collections'
import { getCollections } from '../../services/productService'
import candlesImg from '../images/collection-candles-photo.webp'
import kitchenImg from '../images/collection-kitchenware-photo.webp'
import glasswareImg from '../images/collection-glassware-photo.webp'
import jewelleryImg from '../images/collection-jewellery-photo.webp'

/** Tall photos for the home tiles; the catalogue's own collection images are wide banners. */
const TILE_IMAGES = {
  candles: { src: candlesImg, alt: 'Two amber O.U.A.T. candles cut from bottles, one lit, with cork lids stamped Goa' },
  'kitchen-storage': { src: kitchenImg, alt: 'A green and an olive glass storage jar cut from wine bottles, one tipped on its side beside its wooden lid' },
  glassware: { src: glasswareImg, alt: 'Four amber tumblers cut from bottles, with frosted bases, in soft leaf-shadow light' },
  jewellery: { src: jewelleryImg, alt: 'Gold drop earrings, a pendant and a ring set with aqua and navy teardrops of reclaimed glass, on a pale stone' },
}

export default function CollectionsGrid() {
  const [collections, setCollections] = useState([])
  useEffect(() => {
    // Same order and names as the Shop menu: Candles, Kitchenware, Glassware, Jewellery.
    getCollections().then((all) => setCollections(shopMenuCollections(all)))
  }, [])

  return (
    <section className="section-white border-t border-line py-24 md:py-32" aria-labelledby="collections-title">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            titleAccent="Four ways"
            titleRest="a bottle comes back"
            id="collections-title"
          />
          <Link to="/shop" className="link-underline inline-flex items-center gap-2 text-sm text-primary">
            Shop All <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {collections.map((c, i) => {
            const image = TILE_IMAGES[c.slug] ?? c.image ?? {}
            return (
            <Reveal as="li" key={c.slug} delay={i * 80}>
              <Link to={getCollectionPath(c.slug)} className="group block">
                <div className="zoom-media">
                  <ImagePlaceholder ratio="product" src={image.src} alt={image.alt} tone={c.image?.tone} label={c.label} />
                </div>
                <h3 className="mt-4 font-display text-xl md:text-2xl">{c.label}</h3>
              </Link>
            </Reveal>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
