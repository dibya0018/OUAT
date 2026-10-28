import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import { getCollectionBanner } from '../../lib/collectionBanners'
import { getCollectionPath } from '../../lib/collections'
import { getCollections } from '../../services/productService'
import { ArrowLink, Eyebrow, FadeUp } from './kit'
import { cx } from '../../lib/format'

/** Shop-by-category row inspired by premium marketplaces (e.g. Brown Living). */
export default function HomeCategoryRail() {
  const [collections, setCollections] = useState(null)

  useEffect(() => {
    getCollections().then((list) => setCollections(Array.isArray(list) ? list : []))
  }, [])

  if (collections && collections.length === 0) return null

  return (
    <section className="border-t border-line bg-white py-16 md:py-24" aria-labelledby="home-shop-by-title">
      <Container>
        <FadeUp>
          <Eyebrow index="02">Shop by</Eyebrow>
          <h2 id="home-shop-by-title" className="home-display-md mt-6 text-ink">
            Shop by <em className="italic text-accent">category</em>
          </h2>
        </FadeUp>

        <ul className="mt-12 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-4 md:gap-5">
          {(collections ?? Array.from({ length: 4 })).map((col, index) => {
            const slug = col?.slug ?? `sk-${index}`
            const banner = col ? getCollectionBanner(col.slug) : null
            const loading = !col
            return (
              <FadeUp as="li" key={slug} delay={index * 80}>
                <Link
                  to={col ? getCollectionPath(col.slug) : '/shop'}
                  className={cx(
                    'home-zoom group relative block overflow-hidden bg-cream',
                    'aspect-[4/5] md:aspect-[3/4]',
                  )}
                >
                  {banner?.src ? (
                    <img
                      src={banner.src}
                      alt=""
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      style={{ objectPosition: banner.objectPosition ?? 'center' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-cream" aria-hidden={loading} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <p className="home-label text-cream/85">{loading ? ' ' : col.name}</p>
                    <p className="mt-1 font-display text-xl text-cream md:text-2xl">
                      {loading ? ' ' : col.tagline?.split('.')[0]}
                    </p>
                  </div>
                </Link>
              </FadeUp>
            )
          })}
        </ul>

        <FadeUp delay={200} className="mt-10 md:mt-12">
          <ArrowLink to="/shop">Browse all pieces</ArrowLink>
        </FadeUp>
      </Container>
    </section>
  )
}
