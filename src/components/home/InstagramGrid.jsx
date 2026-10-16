import Container from '../ui/Container'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { SITE } from '../../lib/site'

/**
 * Static Instagram grid. Replace `src` values with exported post images;
 * every tile links to the profile.
 */
const TILES = [
  { src: null, alt: 'Tumblers on a Goan balcony at dusk', tone: 'sand' },
  { src: null, alt: 'Candle lit beside an open book', tone: 'olive' },
  { src: null, alt: 'Artisan cutting a bottle in the studio', tone: 'deep' },
  { src: null, alt: 'Storage jars filled with spices', tone: 'olive' },
  { src: null, alt: 'Sea-glass pendant on a wooden tray', tone: 'sand' },
  { src: null, alt: 'Stack of rescued bottles before sorting', tone: 'olive' },
]

export default function InstagramGrid() {
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
            <Icon name="instagram" size={16} /> @{SITE.instagramHandle}
          </a>
        </Reveal>

        <ul className="mt-12 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4">
          {TILES.map((tile, i) => (
            <Reveal as="li" key={tile.alt} delay={i * 50}>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="zoom-media block"
                aria-label={`${tile.alt}, view on Instagram`}
              >
                <ImagePlaceholder ratio="square" src={tile.src} alt="" tone={tile.tone} />
              </a>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
