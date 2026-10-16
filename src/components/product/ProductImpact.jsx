import Container from '../ui/Container'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

/** Line marks drawn on a 48×48 grid, 1.5px stroke, so all four read as one set. */
const ICONS = {
  // Open hand, palm facing out.
  handcrafted: (
    <>
      <path d="M17 25V13.5a2.5 2.5 0 0 1 5 0V23" />
      <path d="M22 22V10.5a2.5 2.5 0 0 1 5 0V22" />
      <path d="M27 22V12.5a2.5 2.5 0 0 1 5 0V24" />
      <path d="M32 24v-6.5a2.5 2.5 0 0 1 5 0v10C37 35.5 31.5 41 24.5 41h-1c-4 0-6.6-1.6-8.8-4.6L9.6 29.3a2.6 2.6 0 0 1 3.9-3.4L17 29" />
    </>
  ),
  // Two women side by side.
  women: (
    <>
      <circle cx="17" cy="15" r="5" />
      <path d="M8 38v-3.5a9 9 0 0 1 18 0V38" />
      <circle cx="32" cy="17" r="4.5" />
      <path d="M29 26.4a8 8 0 0 1 11 7.6V38" />
    </>
  ),
  // A bottle held inside a closed loop of arrows.
  waste: (
    <>
      <path d="M39 24a15 15 0 0 1-25.6 10.6" />
      <path d="M13.4 40.2v-5.6H19" />
      <path d="M9 24a15 15 0 0 1 25.6-10.6" />
      <path d="M34.6 7.8v5.6H29" />
      <path d="M22 15.5h4v3.6l2 3.1v9.3a1.5 1.5 0 0 1-1.5 1.5h-5a1.5 1.5 0 0 1-1.5-1.5v-9.3l2-3.1z" />
      <path d="M20 26h8" />
    </>
  ),
  // A single leaf with its vein, for lower-energy making.
  leaf: (
    <>
      <path d="M11 37C11 21 22 11 38 10c0 16-10 27-25.5 27z" />
      <path d="M11 37c6.5-8 13-14 21-20" />
      <path d="M20 28.5l-.5-6M25.5 23.5l-.5-5.5M20 28.5l6 .5M25.5 23.5l5.5.5" />
    </>
  ),
}

const POINTS = [
  { icon: 'handcrafted', label: 'Handcrafted', text: 'Cut, ground and finished by hand in our Goa studio.' },
  { icon: 'women', label: 'Women-Owned', text: 'A studio owned and run by women.' },
  { icon: 'waste', label: 'Waste Reimagined', text: 'Every piece begins as a discarded glass bottle.' },
  { icon: 'leaf', label: 'Lower-Impact Making', text: 'No remelting, and minimal electricity.' },
]

/** "Made with Purpose": four brand promises under every product, in the same style as the Impact page values. */
export default function ProductImpact() {
  return (
    <section className="section-cream border-t border-line py-20 md:py-28" aria-labelledby="impact-title">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Our promise" titleAccent="Made with" titleRest="Purpose" id="impact-title" />
        </Reveal>
        <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {POINTS.map((point, i) => (
            <Reveal as="li" key={point.icon} delay={i * 80} className="border-t border-line pt-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-cream">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {ICONS[point.icon]}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-2xl">{point.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{point.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
