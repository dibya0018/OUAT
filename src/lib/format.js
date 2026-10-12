/** Formats a rupee amount, e.g. 1250 -> "₹1,250". Amounts are whole rupees. */
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatPrice(amount) {
  return inr.format(amount)
}

/** Joins class names, skipping falsy values. */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}
