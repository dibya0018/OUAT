/** First image with a URL for display; optional second for hover swap. */
export function productDisplayImages(images = []) {
  const list = Array.isArray(images) ? images : []
  const withSrc = list.filter((img) => img?.src)
  const primary = withSrc[0] ?? list[0] ?? null
  const hover = withSrc.length > 1 ? withSrc[1] : null
  return { primary, hover, hasHoverSwap: Boolean(primary?.src && hover?.src) }
}
