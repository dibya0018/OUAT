import { useEffect, useState } from 'react'
import { formatPrice } from '../../lib/format'
import { getOffers } from '../../services/productService'

function offerText(offer) {
  return offer.discountType === 'percent'
    ? `${offer.discountValue}% off your order`
    : `${formatPrice(offer.discountValue)} off your order`
}

/** "Available offers": coupons the admin has marked to show on the website. */
export default function ProductOffers({ className }) {
  const [offers, setOffers] = useState([])

  useEffect(() => {
    let cancelled = false
    getOffers().then((list) => {
      if (!cancelled) setOffers(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!offers.length) return null

  return (
    <div className={className}>
      <p className="eyebrow">Available offers</p>
      <ul className="mt-3 flex flex-col gap-2">
        {offers.map((offer) => (
          <li key={offer.code} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink-soft">
            <span className="border border-dashed border-primary px-2 py-0.5 font-sans text-xs tracking-wide text-primary">
              {offer.code}
            </span>
            <span>{offerText(offer)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ink-soft">Enter the code at checkout.</p>
    </div>
  )
}
