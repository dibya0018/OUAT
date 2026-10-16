import Container from '../ui/Container'

const PROMISES = [
  'Hand cut & fire-polished',
  'Ships from Goa in 3 to 5 days',
  'Rescued glass, never remelted',
  'Women-led studio',
]

/** Site-wide trust ribbon between manifesto and collections. */
export default function HomePromiseBand() {
  return (
    <div className="border-y border-primary/20 bg-primary text-cream">
      <Container className="py-4 md:py-5">
        <ul className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:flex-wrap sm:gap-x-10 md:gap-x-14">
          {PROMISES.map((label) => (
            <li key={label} className="home-label text-cream/90">
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  )
}
