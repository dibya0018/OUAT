import { IMPACT_PER_KG } from '../lib/site'

/** Shared FAQ shown on every product page. `content` may be a string or JSX. */
export const PRODUCT_FAQ = [
  {
    title: 'What are your products made from?',
    content:
      'Our products are crafted from locally collected waste glass bottles that are thoughtfully upcycled into functional lifestyle pieces. Each item is carefully packed using sustainable materials, making it both eco-friendly and unique.',
  },
  {
    title: 'Are all products handmade?',
    content:
      'Yes, every piece is handcrafted with care. Each bottle is thoroughly cleaned, hand-cut, and processed using a low-impact method that relies on minimal electricity. Our process involves cutting bottles into different forms and meticulously sanding the edges using energy-efficient techniques. The result is an artisanal product that beautifully blends sustainability with style.',
  },
  {
    title: 'Why do products look slightly different?',
    content:
      'Each piece is handcrafted from reclaimed bottles, so slight variations in colour, shape, and size are natural. These unique details reflect the character of upcycled glass and the hand-finished process.',
  },
  {
    title: 'Are your products safe to use?',
    content:
      'Absolutely. All products are carefully smoothed and polished to remove sharp edges, ensuring they are safe for everyday use. Our candles are made with safe, natural and cruelty-free ingredients.',
  },
  {
    title: 'Do you offer Cash on Delivery (COD)?',
    content:
      'Yes, we offer Cash on Delivery (COD) on selected orders and locations. You can check availability at checkout.',
  },
  {
    title: 'How is upcycling different from recycling?',
    content: (
      <div className="flex flex-col gap-4">
        <p>
          Upcycling transforms waste materials into higher-value products without breaking them down, preserving the
          energy and character of the original material. Recycling, on the other hand, processes materials back into
          raw form before creating something new, which requires more fuel and additional raw materials.
        </p>
        <p>
          By choosing upcycled glass, you actively reduce environmental impact. Compared to producing new glass,{' '}
          <strong className="font-medium text-ink">1 kg of upcycled glass saves:</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {IMPACT_PER_KG.map((item) => (
            <li key={item.label}>
              {item.value} of {item.label.replace(/ (saved|reduced)$/, '')}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
]
