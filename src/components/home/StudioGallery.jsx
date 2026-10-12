import Container from '../ui/Container'
import { cx } from '../../lib/format'
import { SITE } from '../../lib/site'
import { ArrowLink, Eyebrow, RevealImage, RevealLines } from './kit'
import rescuedImg from '../images/process-rescued.png'
import reshapedImg from '../images/process-reshaped.png'
import rebornImg from '../images/process-reborn.png'
import ledgeImg from '../images/goa.png'
import pendantImg from '../images/jewellery-pendant.png'

/** One photograph of the spread with its caption. */
function Plate({ src, alt, ratio, parallax, imgClassName, className, children }) {
  return (
    <figure className={cx('min-w-0', className)}>
      <RevealImage src={src} alt={alt} ratio={ratio} parallax={parallax} imgClassName={imgClassName} />
      <figcaption className="home-label mt-3 text-ink/70 md:mt-4">{children}</figcaption>
    </figure>
  )
}

/**
 * 08 — From the studio: five photographs set as a magazine spread.
 * Desktop is two uneven columns on the 12-column grid, the right one set lower.
 * On phones the columns dissolve (`contents`) and the same plates fall into a
 * two-column composition: a staggered pair, the wide plate, a staggered pair.
 */
export default function StudioGallery() {
  return (
    <section className="home-bone home-section" aria-labelledby="studio-gallery-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:items-end md:gap-x-6 lg:gap-x-8">
          <div className="md:col-span-8">
            <Eyebrow index="08">From the studio</Eyebrow>
            <RevealLines
              as="h2"
              id="studio-gallery-title"
              className="home-display-lg mt-6 text-ink md:mt-8"
              lines={[
                'Before, during',
                <em key="after" className="italic text-accent">
                  and after.
                </em>,
              ]}
            />
          </div>
          <div className="md:col-span-4 md:justify-self-end md:pb-2">
            <ArrowLink href={SITE.instagramUrl} target="_blank" rel="noreferrer">
              @{SITE.instagramHandle}
              <span className="sr-only"> on Instagram (opens in a new tab)</span>
            </ArrowLink>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-x-3 gap-y-12 sm:gap-x-5 md:mt-20 md:gap-x-6 lg:gap-x-8">
          {/* Left column: the bottles, then what they became. */}
          <div className="contents md:col-span-4 md:grid md:grid-cols-4 md:gap-x-6 md:gap-y-20 md:self-start lg:gap-x-8 lg:gap-y-28">
            <Plate
              src={rescuedImg}
              alt="Three empty bottles, one green, one amber and one clear, standing in sand at sunset"
              ratio="4 / 5"
              parallax={0.05}
              className="col-span-7 md:col-span-4"
            >
              Rescued bottles, before the first cut
            </Plate>
            <Plate
              src={rebornImg}
              alt="A green glass tumbler and a lit candle in green glass on a slab of pale stone by the sea"
              ratio="4 / 5"
              parallax={0.03}
              className="col-span-5 mt-[90%] md:col-span-3 md:col-start-2 md:mt-0"
            >
              Tumbler and candle, after the last polish
            </Plate>
          </div>

          {/* Right column, set lower: the ledge, then two smaller plates out of step. */}
          <div className="contents md:col-span-7 md:col-start-6 md:grid md:grid-cols-7 md:gap-x-6 md:gap-y-20 md:self-start md:pt-28 lg:gap-x-8 lg:gap-y-28 lg:pt-40">
            <Plate
              src={ledgeImg}
              alt="An olive-green glass carafe, two tumblers and a candle on a rough stone ledge beside a carved wooden window"
              ratio="16 / 9"
              parallax={0.08}
              imgClassName="object-right"
              className="col-span-12 md:col-span-7"
            >
              Carafe, tumblers and a candle on the stone ledge
            </Plate>
            <Plate
              src={pendantImg}
              alt="A teardrop pendant of green glass in a gold-toned wire setting, on a fine chain"
              ratio="1 / 1"
              parallax={0.02}
              className="col-span-5 mt-[50%] md:col-span-3 md:mt-24 lg:mt-28"
            >
              Green glass pendant
              <span className="sr-only">. </span>
              <span className="block text-accent">Jewellery, coming soon</span>
            </Plate>
            <Plate
              src={reshapedImg}
              alt="Hands sanding the cut rim of a green bottle laid on a piece of driftwood, the sea behind"
              ratio="3 / 2"
              parallax={0.06}
              imgClassName="object-[50%_90%]"
              className="col-span-7 md:col-span-4"
            >
              Sanding a cut edge, by hand
            </Plate>
          </div>
        </div>
      </Container>
    </section>
  )
}
