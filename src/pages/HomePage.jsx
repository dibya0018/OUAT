import Seo from '../components/Seo'
import Hero from '../components/home/Hero'
import BrandStatement from '../components/home/BrandStatement'
import CollectionsGrid from '../components/home/CollectionsGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import InstagramGrid from '../components/home/InstagramGrid'
import { SITE } from '../lib/site'

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: `${SITE.name} ${SITE.longName}`,
  url: SITE.url,
  logo: `${SITE.url}/favicon.svg`,
  email: SITE.email,
  sameAs: [SITE.instagramUrl],
  address: { '@type': 'PostalAddress', addressRegion: 'Goa', addressCountry: 'IN' },
}

export default function HomePage() {
  return (
    <>
      <Seo
        title="Reclaimed glass, designed in Goa"
        description="Welcome to the World where creativity meets Consciousness! Premium glassware, candles, kitchen pieces and jewellery made from reclaimed bottles by a women-led studio in Goa."
        path="/"
        jsonLd={ORG_JSON_LD}
      />
      <Hero />
      <BrandStatement />
      <FeaturedProducts />
      <CollectionsGrid />
      <InstagramGrid />
    </>
  )
}
