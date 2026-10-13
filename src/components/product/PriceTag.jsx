import { formatPrice } from '../../lib/format'
import { offerFor } from '../../lib/productOffer'

/** A product's price, with the compare-at price struck through beside it when one is set. */
export default function PriceTag({ product, option }) {
  const { price, compareAtPrice } = offerFor(product, option)
  return (
    <>
      {compareAtPrice && (
        <>
          <span className="sr-only">Was </span>
          <s className="mr-2 opacity-60">{formatPrice(compareAtPrice)}</s>
          <span className="sr-only">now </span>
        </>
      )}
      {formatPrice(price)}
    </>
  )
}
