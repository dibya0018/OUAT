import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Marquee } from '../home/kit'

const ITEMS = [
  { label: 'Handcrafted in Goa', href: '/story' },
  { label: 'Reclaimed glass, never remelted', href: '/story' },
  { label: 'Women-led studio', href: '/story' },
  { label: 'Ships across India', href: '/shop' },
  { label: 'Plastic-free packaging', href: '/shop' },
]

/** Top promo strip (Shopify announcement bar). Sits above the sticky header. */
export default function SiteAnnouncementBar() {
  return (
    <div className="relative z-50 border-b border-line bg-cream text-ink">
      <Marquee duration={42} gap="clamp(2rem, 5vw, 3.5rem)" className="py-2.5">
        {ITEMS.map(({ label, href }) => (
          <Fragment key={label}>
            <Link to={href} className="store-eyebrow text-ink/85 transition-colors hover:text-primary">
              {label}
            </Link>
            <span className="inline-block h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
          </Fragment>
        ))}
      </Marquee>
    </div>
  )
}
