import { useEffect, useState } from 'react'
import Container from '../ui/Container'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { SITE } from '../../lib/site'
import { apiGet } from '../../lib/api'
import candleWritingImg from '../images/studio-candle-writing.webp'
import sipperMorningImg from '../images/studio-sipper-morning.webp'
import sproutGerminatorImg from '../images/studio-sprout-germinator.webp'
import jarReadingImg from '../images/studio-jar-reading.webp'
import drinksFriendsImg from '../images/studio-drinks-friends.webp'
import sipperDeskImg from '../images/studio-sipper-desk.webp'

/**
 * Fallback tiles, shown until recent posts load from /api/instagram/media
 * (and for good when the server has no Instagram token).
 */
const TILES = [
  { src: candleWritingImg, alt: 'An amber glass candle burning on a bed beside its cork lid while someone writes in a notebook', tone: 'sand' },
  { src: sipperMorningImg, alt: 'A hand holding an olive glass sipper with a wooden lid and steel straw on a sunlit table', tone: 'olive' },
  { src: sproutGerminatorImg, alt: 'A green glass sprout germinator full of microgreens tilted on its stand by a window', tone: 'deep' },
  { src: jarReadingImg, alt: 'A hand dropping dried flowers into a green glass jar beside an open book', tone: 'olive' },
  { src: drinksFriendsImg, alt: 'Friends clinking pink drinks in clear tumblers over chips and an open book', tone: 'sand' },
  { src: sipperDeskImg, alt: 'A hand holding an olive glass sipper with a straw next to a laptop at a desk', tone: 'olive' },
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
