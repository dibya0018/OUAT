import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import '../admin.css'
import {
  IconBox,
  IconCart,
  IconEye,
  IconGrid,
  IconMessage,
  IconSettings,
  IconTag,
  IconUsers,
} from './AdminIcons'

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', Icon: IconGrid },
  { to: '/admin/visitors', label: 'Visitors', Icon: IconEye },
  { to: '/admin/products', label: 'Products', Icon: IconBox },
  { to: '/admin/orders', label: 'Orders', Icon: IconCart },
  { to: '/admin/coupons', label: 'Coupons', Icon: IconTag },
  { to: '/admin/reviews', label: 'Reviews', Icon: IconMessage },
  { to: '/admin/team', label: 'Team', Icon: IconUsers },
  { to: '/admin/settings', label: 'Settings', Icon: IconSettings },
]

function Sidebar({ onNavigate, onClose }) {
  return (
    <nav className="flex flex-col gap-1 p-4" aria-label="Admin">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="px-3 font-display text-xl tracking-[0.2em] text-admin-gold">
          O.U.A.T.
        </Link>
        {onClose && (
          <button type="button" className="admin-btn-ghost px-3 py-2" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        )}
      </div>
      {NAV.map(({ to, end, label, Icon }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className="admin-nav-link">
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  // Longest matching nav entry names the current section in the phone header.
  const current = [...NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))

  // Close the phone menu with Escape, and stop the page behind it from scrolling.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <div className="admin-root flex min-h-dvh">
      <aside className="admin-sidebar hidden w-56 shrink-0 md:block">
        <Sidebar />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="admin-sidebar relative z-10 h-full w-64 max-w-[85vw]">
            <Sidebar onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 bg-[var(--color-admin-bg)] flex items-center justify-between gap-3 border-b border-admin-border px-4 py-3 md:hidden">
          <button
            type="button"
            className="admin-btn-ghost px-3 py-2"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
          >
            ☰ Menu
          </button>
          <span className="truncate text-xs uppercase tracking-widest text-admin-muted">
            {current?.label ?? 'Admin'}
          </span>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
