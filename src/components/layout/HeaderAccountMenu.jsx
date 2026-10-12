import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { isAdminUser } from '../../lib/adminAccess'
import { cx } from '../../lib/format'

const CLOSE_DELAY_MS = 180

/** Signed-in account control: one trigger + small menu (matches Shop dropdown). */
export default function HeaderAccountMenu({ firstName, transparent, onLogout, user }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const closeTimer = useRef(null)
  const menuId = useId()
  const accountActive = pathname === '/account'

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

  const triggerClass = cx(
    'inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors',
    transparent ? 'text-cream hover:text-white' : 'text-ink hover:text-primary',
    accountActive && !transparent && 'font-medium text-primary',
  )

  return (
    <div
      ref={wrapRef}
      className="relative hidden sm:block"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        onFocus={openMenu}
      >
        <Icon name="user" size={18} strokeWidth={1.15} aria-hidden />
        <span className="max-w-[8rem] truncate">{firstName}</span>
        <Icon name="chevronDown" size={14} className={cx('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {/* pt-3 bridges the gap so the pointer can reach the menu without closing */}
      <div
        className={cx(
          'absolute top-full right-0 z-50 min-w-[11rem] pt-3',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={cx(
            'border border-line bg-white py-1 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Link
            role="menuitem"
            to="/account"
            className="block px-4 py-2.5 text-sm text-ink hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            Your account
          </Link>
          <Link
            role="menuitem"
            to="/account#orders"
            className="block px-4 py-2.5 text-sm text-ink hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            Your orders
          </Link>
          {isAdminUser(user) && (
            <Link
              role="menuitem"
              to="/admin"
              className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-sand"
              onClick={() => setOpen(false)}
            >
              Admin dashboard
            </Link>
          )}
          <div className="my-1 border-t border-line" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm text-ink-soft hover:bg-sand hover:text-ink"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
