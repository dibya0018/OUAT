import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { getCollectionPath, shopMenuCollections } from '../../lib/collections'
import { getCollections } from '../../services/productService'
import candlesImg from '../images/collection-candles.webp'
import kitchenImg from '../images/collection-kitchenware.webp'
import glasswareImg from '../images/collection-glassware.webp'
import jewelleryImg from '../images/collection-jewellery.webp'

/** Tall photos for the home tiles; the catalogue's own collection images are wide banners. */
const TILE_IMAGES = {
  candles: { src: candlesImg, alt: 'A lit candle in an amber glass jar beside its cork lid marked Goa, in warm evening light' },
  'kitchen-storage': { src: kitchenImg, alt: 'Green and olive glass storage jars with wooden lids, one tipped over spilling seeds' },
  glassware: { src: glasswareImg, alt: 'Six green and amber tumblers cut from wine bottles on a sunlit stone counter' },
  jewellery: { src: jewelleryImg, alt: 'A woman by the sea at sunset wearing flower earrings, ring, necklace and bracelet of clear and blue glass' },
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
