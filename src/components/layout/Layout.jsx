import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import CartDrawer from '../cart/CartDrawer'
import CheckoutModal from '../checkout/CheckoutModal'
import { trackPageView } from '../../lib/analytics'
import { cx } from '../../lib/format'

/** Minimal fallback while a route chunk loads. Keeps layout height stable. */
function RouteFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" aria-label="Loading" />
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  const isHome = pathname === '/'
  /** Category landings use full-width banners; main skips top pad (banner includes header offset). */
  const collectionLanding = ['/glassware', '/candles', '/kitchen-storage', '/jewellery'].includes(pathname)

  // Scroll to top on route change (or to an anchor if present) and track page view.
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    trackPageView(pathname)
    if (!pathname.startsWith('/admin')) {
      const visitorId = sessionStorage.getItem('ouat_vid') || crypto.randomUUID()
      sessionStorage.setItem('ouat_vid', visitorId)
      fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/analytics/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, visitorId }),
      }).catch(() => {})
    }
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <Header />
      {/* Home lets the hero sit under the transparent header; other pages pad for it. */}
      <main
        id="main"
        className={cx(
          'min-w-0 flex-1 w-full',
          !isHome && !collectionLanding && 'pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-20',
        )}
      >
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <WhatsAppButton />
    </div>
  )
}
