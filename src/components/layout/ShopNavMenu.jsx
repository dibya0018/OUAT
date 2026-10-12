import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { getCollectionPath, isCollectionSlug } from '../../lib/collections'
import { getCollections } from '../../services/productService'
import { cx } from '../../lib/format'

const CLOSE_DELAY_MS = 180

/**
 * Desktop: hover/focus dropdown under Shop.
 * Lists every product category with its own page URL.
 */
export default function ShopNavMenu({ transparent = false }) {
  const { pathname } = useLocation()
  const [collections, setCollections] = useState([])
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const closeTimer = useRef(null)
  const menuId = useId()

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openMenu = () => {
    clearCloseTimer()
    setOpen(true)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    getCollections().then(setCollections)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      clearCloseTimer()
    }
  }, [])

  const shopActive =
    pathname === '/shop' || isCollectionSlug(pathname.replace(/^\//, ''))

  const linkClass = cx(
    'link-underline inline-flex items-center gap-1 text-sm tracking-wide',
    shopActive && 'font-medium',
    transparent && 'text-cream',
  )

  return (
    <li
      ref={wrapRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        to="/shop"
        className={linkClass}
        aria-expanded={open}
        aria-controls={menuId}
        onFocus={openMenu}
      >
        Shop
        <Icon name="chevronDown" size={14} className={cx('transition-transform', open && 'rotate-180')} />
      </Link>

      <div
        className={cx(
          'absolute top-full left-1/2 z-50 w-[min(100vw-2rem,22rem)] -translate-x-1/2 pt-3',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <div
          id={menuId}
          role="menu"
          aria-label="Shop categories"
          className={cx(
            'border border-line bg-white py-2 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onFocus={openMenu}
        >
          <Link
            role="menuitem"
            to="/shop"
            className="block px-5 py-3 text-sm text-ink hover:bg-sand"
          >
            <span className="font-medium">All pieces</span>
            <span className="mt-0.5 block text-xs text-ink-soft">Every collection</span>
          </Link>
          <div className="my-1 border-t border-line" role="separator" />
          {collections.map((c) => (
            <Link
              key={c.slug}
              role="menuitem"
              to={getCollectionPath(c.slug)}
              className="block px-5 py-3 text-sm hover:bg-sand"
            >
              <span className="font-medium text-primary">{c.name}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">{c.tagline}</span>
            </Link>
          ))}
        </div>
      </div>
    </li>
  )
}

/** Mobile: Shop + indented category links */
export function ShopNavMobile({ onNavigate, className }) {
  const [collections, setCollections] = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    getCollections().then(setCollections)
  }, [])

  return (
    <li className={className}>
      <button
        type="button"
        className="flex w-full items-center justify-between font-display text-3xl font-normal text-ink"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        Shop
        <Icon name="chevronDown" size={20} className={cx('transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <ul className="mt-4 flex flex-col gap-3 border-l border-line pl-4">
          <li>
            <Link to="/shop" onClick={onNavigate} className="text-lg text-ink-soft hover:text-primary">
              All pieces
            </Link>
          </li>
          {collections.map((c) => (
            <li key={c.slug}>
              <Link
                to={getCollectionPath(c.slug)}
                onClick={onNavigate}
                className="text-lg text-ink-soft hover:text-primary"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
