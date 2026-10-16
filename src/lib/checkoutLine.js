import { offerFor } from './productOffer'

/** Cart / checkout line from a product (shared by cart + buy now). `option` is a size / pack option name. */
export function buildCheckoutLine(product, { qty = 1, gift = false, option } = {}) {
  const id = product.id ?? product.slug
  const offer = offerFor(product, option)
  return {
    key: `${id}${offer.option ? `:${offer.option}` : ''}${gift ? ':gift' : ''}`,
    id,
    slug: product.slug,
    name: offer.option ? `${product.name}, ${offer.option}` : product.name,
    option: offer.option,
    price: offer.price,
    image: product.images?.[0] ?? null,
    qty,
    gift,
  }
}
