import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Icon from '../ui/Icon'
import Logo from '../ui/Logo'
import { getCollections } from '../../services/productService'
import { getCollectionPath } from '../../lib/collections'
import { NAV_LINKS, POLICY_LINKS, SITE } from '../../lib/site'

const linkClass = 'link-underline text-sm text-cream/85 hover:text-cream'
const YEAR = new Date().getFullYear()

export default function Footer() {
  const [collections, setCollections] = useState([])
  useEffect(() => {
    getCollections().then(setCollections)
  }, [])

  return (
    <footer className="bg-primary pb-7 text-cream">
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start md:gap-x-10 lg:gap-x-14">
          <div className="md:col-span-5">
            <Logo inverse className="h-16 md:h-20" fallbackClassName="text-3xl" />
            <p className="mt-6 max-w-sm font-display text-xl font-light leading-snug text-cream/90 md:text-[1.35rem]">
              {SITE.tagline}
            </p>
            <p className="mt-5 text-sm text-cream/70">Women-led. Designed and made in {SITE.location}.</p>
          </div>

          <nav aria-label="Shop" className="md:col-span-2">
            <h2 className="mb-4 font-sans text-xs font-normal uppercase tracking-eyebrow text-cream/70">Shop</h2>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/shop" className={linkClass}>
                  All pieces
                </Link>
              </li>
              {collections.map((c) => (
                <li key={c.slug}>
                  <Link to={getCollectionPath(c.slug)} className={linkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Studio" className="md:col-span-2">
            <h2 className="mb-4 font-sans text-xs font-normal uppercase tracking-eyebrow text-cream/70">Studio</h2>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.filter((l) => l.to !== '/shop').map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/cart" className={linkClass}>
                  Cart
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="mb-4 font-sans text-xs font-normal uppercase tracking-eyebrow text-cream/70">Contact</h2>
            <ul className="flex flex-col gap-2">
              <li>
                <a href={`mailto:${SITE.email}`} className={linkClass}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <Icon name="instagram" size={16} />@{SITE.instagramHandle}
                </a>
              </li>
              <li className="text-sm text-cream/70">{SITE.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 text-xs leading-relaxed text-cream/60 md:mt-14 md:flex md:items-center md:justify-between md:gap-8">
          <p className="md:max-w-[min(100%,28rem)]">
            © {YEAR} {SITE.name} — {SITE.longName}. All rights reserved.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 md:mt-0 md:justify-end">
            {POLICY_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-underline inline-block py-0.5 hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
