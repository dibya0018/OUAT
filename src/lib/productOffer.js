/**
 * What a product actually sells for: its size / pack options, compare-at price and stock,
 * as set in the admin product editor (stored under product.details).
 */

/** Size / pack options that have a name. Empty for a plain single-price product. */
export function packOptions(product) {
  const list = product?.details?.packOptions
  if (!Array.isArray(list)) return []
  return list
    .filter((o) => o && String(o.size ?? '').trim())
    .map((o) => ({ ...o, size: String(o.size).trim() }))
}

export function defaultOption(product) {
  const options = packOptions(product)
  return options.find((o) => o.isDefault) ?? options[0] ?? null
}

/**
 * Price, compare-at price and stock for a product, or for one of its options.
 * `stock` is null when the quantity is unknown (mock catalogue) — treat that as in stock.
 */
export function offerFor(product, optionSize) {
  const options = packOptions(product)
  const option = options.length
    ? (options.find((o) => o.size === optionSize) ?? defaultOption(product))
    : null

  const price = Number(option ? option.price : product?.price) || 0
  const compare = Number(option ? option.compareAtPrice : product?.details?.compareAtPrice) || 0
  const rawStock = option ? option.stock : product?.availableQuantity

  return {
    option: option?.size ?? null,
    badge: option?.badge ? String(option.badge) : '',
    price,
    compareAtPrice: compare > price ? compare : null,
    stock: rawStock == null || rawStock === '' ? null : Number(rawStock) || 0,
  }
}
