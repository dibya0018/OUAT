import Container from '../ui/Container'
import Reveal from '../ui/Reveal'

/** Recycling loop shared by the two "what it is made of" marks; the centre says which. */
const loop = (
  <>
    <path d="M38 24a14 14 0 0 1-23.9 9.9" />
    <path d="M14.1 39.5v-5.6h5.6" />
    <path d="M10 24a14 14 0 0 1 23.9-9.9" />
    <path d="M33.9 8.5v5.6h-5.6" />
  </>
)

const ICONS = {
  waste: (
    <>
      {loop}
      {/* bottle */}
      <path d="M22.3 16.5h3.4v3.2l1.8 2.8v8a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-8l1.8-2.8z" />
    </>
  ),
  natural: (
    <>
      {loop}
      {/* leaf */}
      <path d="M24 32c-5.5-2.6-6-8.6 0-15 6 6.4 5.5 12.4 0 15z" />
      <path d="M24 32v-8.5" />
    </>
  ),
  lowImpact: (
    <>
      <path d="M24 25c-6-3-6.5-10 0-17.5 6.5 7.5 6 14.5 0 17.5z" />
      <path d="M24 25V14" />
      <path d="M7 27c4.5 0 8 2 10 5.5l3 5.5" />
      <path d="M41 27c-4.5 0-8 2-10 5.5l-3 5.5" />
      <path d="M17 41h14" />
    </>
  ),
  ethical: (
    <>
      <circle cx="24" cy="24" r="18" />
      <path d="M24 13.5v20" />
      <path d="M19 33.5h10" />
      <path d="M15 17.5h18" />
      <path d="M11.5 26.5l3.5-9 3.5 9a3.5 2.6 0 0 1-7 0z" />
      <path d="M29.5 26.5l3.5-9 3.5 9a3.5 2.6 0 0 1-7 0z" />
    </>
  ),
  handcrafted: (
    <>
      <path
        d="M24 41S7 30.5 7 18.5a8.5 8.5 0 0 1 17-2.5 8.5 8.5 0 0 1 17 2.5C41 30.5 24 41 24 41z"
        strokeDasharray="2 3"
      />
      {/* needle and thread */}
      <path d="M17 30l14-14" />
      <path d="M31 16l2.5-2.5" />
      <path d="M17 30c-3 1-3.5 4-1 5s5-1.5 8-1 4 2 6 1.5" />
    </>
  ),
  women: (
    <>
      <path d="M36.7 11.3A18 18 0 1 0 42 24" />
      <path d="M40 4.5v7" />
      <path d="M36.5 8h7" />
      <circle cx="24" cy="20" r="6" />
      <path d="M24 26v10" />
      <path d="M20 31.5h8" />
    </>
  ),
}

/** Candles are poured from soy wax; everything else leads with the reclaimed glass. */
function impactPoints(product) {
  const first =
    product.collection === 'candles'
      ? { icon: 'natural', label: '100% natural & quickly renewable' }
      : { icon: 'waste', label: 'Made from waste' }
  return [
    first,
    { icon: 'lowImpact', label: 'Low impact production process' },
    { icon: 'ethical', label: 'Ethical & socially responsible' },
    { icon: 'handcrafted', label: 'Handcrafted & creates jobs' },
    { icon: 'women', label: 'Empowers women' },
  ]
}

/** "This product makes impact": five marks, the first chosen by what the product is made of. */
export default function ProductImpact({ product }) {
  return (
    <section className="section-cream border-t border-line py-20 md:py-28" aria-labelledby="impact-title">
      <Container>
        <Reveal>
          <p className="eyebrow">Impact</p>
          <h2 id="impact-title" className="mt-4 text-3xl md:text-4xl">
            This product makes impact
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:mt-16 lg:grid-cols-5">
          {impactPoints(product).map((point, i) => (
            <Reveal as="li" key={point.icon} delay={i * 60} className="flex flex-col items-center text-center max-sm:last:odd:col-span-2">
              <svg
                width="64"
                height="64"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-primary"
              >
                {ICONS[point.icon]}
              </svg>
              <p className="mt-5 max-w-[11rem] text-sm text-ink">{point.label}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
