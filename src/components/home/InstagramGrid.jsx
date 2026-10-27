import { useEffect, useState } from 'react'
import Container from '../ui/Container'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { SITE } from '../../lib/site'
import { apiGet } from '../../lib/api'

/**
 * Fallback tiles, shown until recent posts load from /api/instagram/media
 * (and for good when the server has no Instagram token).
 */
const TILES = [
  { src: null, alt: 'Tumblers on a Goan balcony at dusk', tone: 'sand' },
  { src: null, alt: 'Candle lit beside an open book', tone: 'olive' },
  { src: null, alt: 'Artisan cutting a bottle in the studio', tone: 'deep' },
  { src: null, alt: 'Storage jars filled with spices', tone: 'olive' },
  { src: null, alt: 'Sea-glass pendant on a wooden tray', tone: 'sand' },
  { src: null, alt: 'Stack of rescued bottles before sorting', tone: 'olive' },
]

const FALLBACK = TILES.map((t) => ({ ...t, key: t.alt, href: SITE.instagramUrl }))

export default function InstagramGrid() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    let alive = true
    apiGet('/instagram/media')
      .then((data) => {
        if (alive && Array.isArray(data.posts)) setPosts(data.posts)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const tiles = posts.length
    ? posts.map((p, i) => ({
        key: p.id,
        href: p.permalink,
        src: p.image,
        alt: p.caption || `Post ${i + 1} from @${SITE.instagramHandle}`,
      }))
    : FALLBACK

  return (
    <section className="section-white border-t border-line py-24 md:py-32" aria-labelledby="instagram-title">
      <Container>
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Instagram</p>
            <h2 id="instagram-title" className="mt-4 text-3xl md:text-4xl">
              From the studio
            </h2>
          </div>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline inline-flex items-center gap-2 text-sm text-primary"
          >
            <Icon name="instagram" size={16} /> Follow @{SITE.instagramHandle}
          </a>
        </Reveal>

        <ul className="mt-12 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4">
          {tiles.map((tile, i) => (
            <Reveal as="li" key={tile.key} delay={i * 50}>
              <a
                href={tile.href}
                target="_blank"
                rel="noreferrer"
                className="zoom-media block"
                aria-label={`${tile.alt}, view on Instagram`}
              >
                <ImagePlaceholder
                  ratio="square"
                  src={tile.src}
                  alt=""
                  tone={tile.tone}
                  sizes="(min-width: 768px) 16vw, 33vw"
                />
              </a>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
