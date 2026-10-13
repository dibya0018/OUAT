/**
 * Placeholder policy copy. Replace each `sections[].body` with the final,
 * legally reviewed text. Structure (slug → title/description/sections) is
 * consumed by PolicyPage. An optional `intro` paragraph shows above the sections;
 * line breaks (\n) in a body are kept on the page.
 */
export const POLICIES = {
  shipping: {
    title: 'Shipping Policy',
    description: 'Processing times, delivery times and shipping charges for O.U.A.T. orders.',
    updated: 'October 2026',
    sections: [
      {
        heading: 'Processing Time',
        body: 'Orders are processed within 24-48 working hours.',
      },
      {
        heading: 'Delivery Time',
        body: 'Urban Areas: 3-7 business days\nOther Areas: 5-8 business days',
      },
      {
        heading: 'Special Regions',
        body: 'For certain remote locations, a flat shipping charge of ₹130 may apply. COD may not be available in these areas.',
      },
      {
        heading: 'Delivery Information',
        body: 'Deliveries are made between 9 AM – 7 PM, Monday to Friday.\n\nDelays may occur due to unforeseen circumstances or courier issues.',
      },
      {
        heading: 'Note',
        body: 'O.U.A.T. is not responsible for delays caused by third-party logistics partners.',
      },
      {
        heading: 'Contact',
        body: 'For shipping queries, contact us at info@indieyaa.com.',
      },
    ],
  },
  returns: {
    title: 'Refund and Returns Policy',
    description: 'Returns, refunds and cancellations for O.U.A.T. orders.',
    updated: 'October 2026',
    intro:
      'At O.U.A.T., we take pride in creating handcrafted products from upcycled materials. Each piece is unique and made with care.',
    sections: [
      {
        heading: 'Return Policy',
        body: 'Returns are accepted within 3 days of delivery.\n\nItems must be unused and in original condition.',
      },
      {
        heading: 'Eligibility',
        body: '• Defective or damaged products\n• Incorrect item received',
      },
      {
        heading: 'Non-Returnable Items',
        body: '• Used products\n• Items returned after 3 days\n• Personalized items\n• Sale or discounted products',
      },
      {
        heading: 'Return Process',
        body: 'Email us at info@indieyaa.com with your order ID and product images within 24 hours of delivery.',
      },
      {
        heading: 'Refunds',
        body: 'Once approved, you may receive:\n\n• A credit note (valid for 90 days), or\n• A refund to your original payment method (excluding shipping charges)',
      },
      {
        heading: 'Shipping for Returns',
        body: 'Customers are responsible for return shipping costs. These charges are non-refundable.',
      },
      {
        heading: 'Cancellation Policy',
        body: '• Orders can be cancelled before dispatch by emailing us with your order ID.\n• Orders already shipped or purchased on discount cannot be cancelled.',
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
