/**
 * Brand-wide constants and copy used across pages.
 * Keep approved claims here so wording stays consistent and on-brand.
 */
export const SITE = {
  name: 'O.U.A.T.',
  longName: 'Once Upon A Time',
  url: 'https://ouat.in', // update when the real domain is live
  tagline: 'Every bottle has a past. We give it a future.',
  secondaryLines: ['Once discarded. Now designed.', 'Once Upon A Time… a bottle. Now, a glass.'],
  location: 'Goa, India',
  email: 'hello@ouat.in',
  instagramHandle: 'ouat_goa',
  instagramUrl: 'https://www.instagram.com/ouat_goa/',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  currency: 'INR',
}

/** The only sustainability claims approved for use on the site. */
export const IMPACT_FACTS = [
  {
    value: '6,000+',
    label: 'glass bottles given a second life',
  },
  {
    value: 'Low-energy',
    label: 'glass is upcycled without remelting',
  },
  {
    value: 'Goa',
    label: 'handcrafted by local artisans',
  },
]

/** Savings per 1 kg of upcycled glass, as published on ouatworld.com/about. */
export const IMPACT_PER_KG = [
  { value: '1.2 kg', label: 'raw materials saved' },
  { value: '0.105 kg', label: 'fuel saved' },
  { value: '0.9 kg', label: 'CO₂ emissions reduced' },
]

export const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/story', label: 'Our Story' },
  { to: '/impact', label: 'Impact' },
  { to: '/gifting-b2b', label: 'Gifting & B2B' },
  { to: '/contact', label: 'Contact' },
]

export const POLICY_LINKS = [
  { to: '/policies/shipping', label: 'Shipping' },
  { to: '/policies/returns', label: 'Returns' },
  { to: '/policies/privacy', label: 'Privacy' },
  { to: '/policies/terms', label: 'Terms' },
]
