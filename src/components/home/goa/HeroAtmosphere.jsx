import PalmShadows from './PalmShadows'
import { seeded } from './shapes'

const rand = seeded(19870612)

/** Points of light drifting up through the lower part of the hero. */
const GLINTS = Array.from({ length: 30 }, (_, i) => {
  const size = 3 + rand() * rand() * 9
  return {
    id: i,
    style: {
      left: `${(2 + rand() * 96).toFixed(1)}%`,
      top: `${(38 + rand() * 58).toFixed(1)}%`,
      width: `${size.toFixed(1)}px`,
      height: `${size.toFixed(1)}px`,
      animationDuration: `${(4 + rand() * 6).toFixed(1)}s`,
      animationDelay: `${(rand() * -10).toFixed(1)}s`,
      '--drift': `${(rand() * 30 - 15).toFixed(0)}px`,
    },
  }
})

/** Light and air over the hero photo: low sun, palm shadows, glints of spray. */
export default function HeroAtmosphere() {
  return (
    <>
      <div className="goa-sun" aria-hidden="true" />
      <PalmShadows strength={0.3} />
      <div className="goa-glints" aria-hidden="true">
        {GLINTS.map((g) => (
          <span key={g.id} className="goa-glint" style={g.style} />
        ))}
      </div>
    </>
  )
}
