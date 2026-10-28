/**
 * Skeleton loading for every photo on the site.
 *
 * Each <img> shows a soft shimmer (styled in index.css) until it has loaded. Load and error events
 * don't bubble, so one listener in the capture phase catches them for every image, including ones
 * React adds later. Loaded images get `data-loaded` (an attribute, not a class, because React
 * rewrites className when a slide or card changes and would bring the shimmer back).
 *
 * Images that should never shimmer (the logo, decorative motifs) carry `data-no-skeleton`.
 */
export function initImageSkeleton() {
  if (typeof document === 'undefined') return

  const markLoaded = (event) => {
    const img = event.target
    if (img instanceof HTMLImageElement) img.setAttribute('data-loaded', '')
  }
  document.addEventListener('load', markLoaded, true)
  document.addEventListener('error', markLoaded, true)
}
