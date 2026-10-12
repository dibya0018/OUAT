import Container from '../ui/Container'
import { cx } from '../../lib/format'

const BANDS = {
  glassware: {
    className: 'bg-primary text-cream',
    items: ['Hand cut & polished', 'Food-safe glass', 'From rescued bottles'],
  },
  candles: {
    className: 'bg-[#1f1b17] text-cream border-y border-accent/25',
    items: ['100% soy wax', 'Cotton wicks', 'Glass you keep'],
  },
  'kitchen-storage': {
    className: 'bg-sage/15 text-ink border-y border-primary/15',
    items: ['Pantry jars', 'Pourers & lids', 'Shelf-ready glass'],
  },
}

/** Short trust strip under the banner — unique per collection. */
export default function CollectionBannerBand({ slug }) {
  const band = BANDS[slug]
  if (!band) return null

  return (
    <div className={cx('collection-banner-band py-4 md:py-5', band.className)}>
      <Container>
        <ul className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-2 md:gap-x-14">
          {band.items.map((label) => (
            <li
              key={label}
              className="font-sans text-xs uppercase tracking-[0.2em] md:text-[0.8125rem]"
            >
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  )
}
