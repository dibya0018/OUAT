/**
 * Placeholder policy copy. Replace each `sections[].body` with the final,
 * legally reviewed text. Structure (slug → title/description/sections) is
 * consumed by PolicyPage.
 */
export const POLICIES = {
  shipping: {
    title: 'Shipping',
    description: 'How and when O.U.A.T. pieces ship from Goa.',
    updated: 'October 2026',
    sections: [
      {
        heading: 'Dispatch times',
        body: 'Pieces are made in small batches and ship from Goa within 3–5 working days of your order. Custom and B2B orders follow the timeline agreed in your quotation.',
      },
      {
        heading: 'Delivery across India',
        body: 'We ship across India with tracked couriers. Typical delivery is 3–7 working days after dispatch, depending on your location. Shipping is calculated at checkout.',
      },
      {
        heading: 'International orders',
        body: 'We currently ship within India. For international enquiries, please write to us and we will do our best to help.',
      },
      {
        heading: 'Packaging',
        body: 'Glass is packed in recycled card with paper padding. If anything arrives damaged, photograph the box and the piece and contact us within 48 hours.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    description: 'Our returns and exchanges policy for O.U.A.T. pieces.',
    updated: 'October 2026',
    sections: [
      {
        heading: 'Damaged in transit',
        body: 'If a piece arrives broken, we will replace it at no cost. Send photos of the packaging and the item to our email within 48 hours of delivery.',
      },
      {
        heading: 'Change of mind',
        body: 'Unused pieces in their original packaging may be returned within 7 days of delivery for store credit. Return shipping is at the customer’s expense.',
      },
      {
        heading: 'Variation is not a defect',
        body: 'Every piece is made from a reclaimed bottle and finished by hand. Small differences in height, tint and surface are part of the object, not a fault.',
      },
      {
        heading: 'Custom and B2B orders',
        body: 'Engraved, custom-coloured and bulk orders are made to your approval and cannot be returned unless faulty.',
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    description: 'How O.U.A.T. collects and uses your information.',
    updated: 'October 2026',
    sections: [
      {
        heading: 'What we collect',
        body: 'When you place an order or write to us, we collect the details you provide: name, email, phone, delivery address and your message. If you subscribe, we keep your email address.',
      },
      {
        heading: 'How we use it',
        body: 'To fulfil orders, reply to enquiries and, if you have opted in, send occasional notes about new pieces. We do not sell your information.',
      },
      {
        heading: 'Analytics',
        body: 'We may use Google Analytics, Google Tag Manager and Meta Pixel to understand how the site is used and to measure our Instagram campaigns. These tools use cookies; you can block them in your browser.',
      },
      {
        heading: 'Your choices',
        body: 'You can unsubscribe from our emails at any time using the link in each message, or ask us to delete your information by writing to us.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    description: 'The terms that govern purchases from O.U.A.T.',
    updated: 'October 2026',
    sections: [
      {
        heading: 'Products',
        body: 'All pieces are handmade from reclaimed glass. Photographs are representative; the piece you receive will differ slightly in tint, height and finish.',
      },
      {
        heading: 'Pricing and payment',
        body: 'Prices are in Indian Rupees and include applicable taxes unless stated otherwise. Payment is processed securely by our payment partner at checkout.',
      },
      {
        heading: 'Care and use',
        body: 'Please follow the care notes on each product page. Reclaimed glass should not be exposed to sudden temperature changes. Never leave a burning candle unattended.',
      },
      {
        heading: 'Intellectual property',
        body: 'The O.U.A.T. name, designs, photography and copy on this site belong to Once Upon A Time and may not be reproduced without permission.',
      },
    ],
  },
}
