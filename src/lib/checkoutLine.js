/** Cart / checkout line from a product (shared by cart + buy now). */
export function buildCheckoutLine(product, { qty = 1, gift = false } = {}) {
  const id = product.id ?? product.slug
  return {
    key: `${id}${gift ? ':gift' : ''}`,
    id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images?.[0] ?? null,
    qty,
    gift,
  }
}
