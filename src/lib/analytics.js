/**
 * Analytics
 * ---------
 * Thin wrapper around GA4 (gtag), Meta Pixel (fbq) and GTM (dataLayer).
 * Scripts are only injected when the matching env variable is set; when an
 * ID is missing the corresponding call is a silent no-op.
 *
 * Usage:
 *   initAnalytics()                       // once, at app start
 *   trackEvent('AddToCart', { ... })      // anywhere
 *   trackPageView(path)                   // on route change
 */

const GA4_ID = import.meta.env.VITE_GA4_ID
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID
const GTM_ID = import.meta.env.VITE_GTM_ID

const isBrowser = typeof window !== 'undefined'
let initialised = false

/** Appends a <script> tag once. */
function injectScript(src, { id, inline } = {}) {
  if (!isBrowser || (id && document.getElementById(id))) return
  const s = document.createElement('script')
  if (id) s.id = id
  if (inline) s.textContent = inline
  else {
    s.async = true
    s.src = src
  }
  document.head.appendChild(s)
}

/** Loads the analytics scripts whose IDs are configured. Safe to call twice. */
export function initAnalytics() {
  if (!isBrowser || initialised) return
  initialised = true

  if (GTM_ID) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`, { id: 'gtm-script' })
  }

  if (GA4_ID) {
    window.dataLayer = window.dataLayer || []
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments)
      }
    window.gtag('js', new Date())
    // We send page views manually on route change (SPA).
    window.gtag('config', GA4_ID, { send_page_view: false })
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`, { id: 'ga4-script' })
  }

  if (META_PIXEL_ID) {
    injectScript(null, {
      id: 'meta-pixel',
      inline: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');`,
    })
  }
}

/**
 * Maps our event names to GA4's recommended ecommerce event names.
 * Meta Pixel uses the keys as-is (they match Meta's standard events).
 */
const GA4_EVENT_NAMES = {
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Lead: 'generate_lead',
}

/**
 * Fires an event to every configured destination.
 * @param {'ViewContent'|'AddToCart'|'InitiateCheckout'|'Lead'|string} name
 * @param {Record<string, unknown>} [params]
 */
export function trackEvent(name, params = {}) {
  if (!isBrowser) return

  if (GTM_ID && window.dataLayer) {
    window.dataLayer.push({ event: name, ...params })
  }
  if (GA4_ID && typeof window.gtag === 'function') {
    window.gtag('event', GA4_EVENT_NAMES[name] || name, params)
  }
  if (META_PIXEL_ID && typeof window.fbq === 'function') {
    window.fbq('track', name, params)
  }
}

/** Sends an SPA page view to GA4 and Meta Pixel. */
export function trackPageView(path) {
  if (!isBrowser) return
  if (GA4_ID && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href })
  }
  if (META_PIXEL_ID && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
  if (GTM_ID && window.dataLayer) {
    window.dataLayer.push({ event: 'page_view', page_path: path })
  }
}
