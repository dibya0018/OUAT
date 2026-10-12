import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
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

function Sidebar({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 p-4" aria-label="Admin">
      <Link to="/" className="mb-6 px-3 font-display text-xl tracking-[0.2em] text-admin-gold">
        O.U.A.T.
      </Link>
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
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-admin-border px-4 py-3 md:hidden">
          <button type="button" className="admin-btn-ghost px-3 py-2" onClick={() => setMenuOpen(true)}>
            Menu
          </button>
          <span className="text-xs uppercase tracking-widest text-admin-muted">Admin</span>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
