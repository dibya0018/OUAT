import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Container from '../ui/Container'
import Icon from '../ui/Icon'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useCustomerOrders } from '../../hooks/useCustomerOrders'
import Logo from '../ui/Logo'
import { NAV_LINKS, SITE } from '../../lib/site'
import { cx } from '../../lib/format'
import ShopNavMenu, { ShopNavMobile } from './ShopNavMenu'
import HeaderAccountMenu from './HeaderAccountMenu'
import { isAdminUser } from '../../lib/adminAccess'

const SCROLL_THRESHOLD = 24
const isScrolled = () => typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD

/**
 * Sticky minimal header. On the home page it sits transparent over the hero
 * and turns white once the user scrolls; elsewhere it is always white.
 */
export default function Header() {
  const { pathname } = useLocation()
  const { count, openCart } = useCart()
  const { user, booting, logout, isAuthenticated } = useAuth()
  const { activeCount: activeOrders } = useCustomerOrders()
  const firstName = user?.fullName?.split(' ')[0] ?? 'Guest'
  const [scrolled, setScrolled] = useState(isScrolled)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const overHero = pathname === '/'
  const transparent = overHero && !scrolled && !menuOpen
  const navLinkClass = cx('link-underline text-sm tracking-wide', transparent && 'text-cream')

  useEffect(() => {
    const onScroll = () => setScrolled(isScrolled())
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top,0px)] transition-colors duration-200',
        transparent ? 'bg-transparent text-cream' : 'border-b border-line bg-white text-ink',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-primary"
      >
        Skip to content
      </a>

      <Container className="flex h-14 min-w-0 items-center justify-between gap-2 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0"
          aria-label={`${SITE.name} home`}
        >
          <Logo inverse={transparent} className="h-8 md:h-11" fallbackClassName="text-xl sm:text-2xl" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {NAV_LINKS.map((link) =>
              link.to === '/shop' ? (
                <ShopNavMenu key={link.to} transparent={transparent} />
              ) : (
                <li key={link.to}>
                  <NavLink to={link.to} className="link-underline text-sm tracking-wide">
                    {link.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {!booting &&
            (isAuthenticated ? (
              <HeaderAccountMenu
                user={user}
                firstName={firstName}
                transparent={transparent}
                onLogout={logout}
              />
            ) : (
              <Link to="/login" onClick={closeMenu} className={cx('hidden sm:inline', navLinkClass)}>
                Sign in
              </Link>
            ))}
          {isAuthenticated && (
            <Link
              to="/account#orders"
              onClick={closeMenu}
              className="relative inline-flex h-10 w-10 items-center justify-center"
              aria-label={`Your orders${activeOrders ? `, ${activeOrders} in progress` : ''}`}
            >
              <Icon name="package" size={22} />
              {activeOrders > 0 && (
                <span
                  aria-hidden="true"
                  className={cx(
                    'absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-sans text-[0.625rem]',
                    transparent ? 'bg-cream text-primary' : 'bg-primary text-cream',
                  )}
                >
                  {activeOrders > 9 ? '9+' : activeOrders}
                </span>
              )}
            </Link>
          )}
          <span
            aria-hidden
            className={cx('hidden h-5 w-px sm:block', transparent ? 'bg-cream/30' : 'bg-line')}
          />
          <button
            type="button"
            onClick={() => {
              closeMenu()
              openCart()
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center"
            aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <Icon name="cart" size={22} />
            {count > 0 && (
              <span
                aria-hidden="true"
                className={cx(
                  'absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-sans text-[0.625rem]',
                  transparent ? 'bg-cream text-primary' : 'bg-primary text-cream',
                )}
              >
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-x-0 bottom-0 z-[45] bg-white md:hidden top-[calc(3.5rem+env(safe-area-inset-top,0px))]"
      >
        <nav aria-label="Mobile" className="h-full overflow-y-auto">
          <Container className="flex h-full flex-col justify-between py-10">
            <ul className="flex flex-col gap-6">
              {NAV_LINKS.map((link) =>
                link.to === '/shop' ? (
                  <ShopNavMobile key={link.to} onNavigate={closeMenu} />
                ) : (
                  <li key={link.to}>
                    <NavLink to={link.to} onClick={closeMenu} className="font-display text-3xl font-normal text-ink">
                      {link.label}
                    </NavLink>
                  </li>
                ),
              )}
              <li className="border-t border-line pt-6">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <NavLink to="/account" onClick={closeMenu} className="font-display text-3xl font-normal text-ink">
                      Account
                    </NavLink>
                    <NavLink to="/account#orders" onClick={closeMenu} className="font-display text-2xl font-normal text-ink">
                      Your orders
                      {activeOrders > 0 && (
                        <span className="ml-2 font-sans text-sm text-ink-soft">({activeOrders} active)</span>
                      )}
                    </NavLink>
                    {isAdminUser(user) && (
                      <NavLink to="/admin" onClick={closeMenu} className="font-display text-3xl font-normal text-primary">
                        Admin
                      </NavLink>
                    )}
                    <p className="text-sm text-ink-soft">Signed in as {firstName}</p>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu()
                        logout()
                      }}
                      className="w-fit text-sm tracking-wide text-ink-soft link-underline"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <NavLink to="/login" onClick={closeMenu} className="font-display text-3xl font-normal text-ink">
                    Sign in
                  </NavLink>
                )}
              </li>
            </ul>
            <div className="flex flex-col gap-2 text-sm text-ink-soft">
              <a href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="link-underline w-fit">
                @{SITE.instagramHandle}
              </a>
              <a href={`mailto:${SITE.email}`} className="link-underline w-fit">
                {SITE.email}
              </a>
            </div>
          </Container>
        </nav>
      </div>
    </header>
  )
}
