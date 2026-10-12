import { frondPath } from './shapes'

/*
 * Fronds hang down-left from a crown just outside the top-right corner.
 * [angle (90 = straight down, 180 = left), length, droop at the tip]
 */
const BACK = [
  [100, 430, 50],
  [128, 470, 30],
  [156, 460, 20],
  [184, 420, 10],
  [208, 330, 0],
]
  .map(frondPath)
  .join('')

const FRONT = [
  [62, 240, 90],
  [86, 330, 70],
  [114, 400, 44],
  [142, 480, 24],
  [170, 440, 14],
  [196, 380, 6],
]
  .map(frondPath)
  .join('')

const VIEW_BOX = '-520 -60 580 580'

function Palm({ side }) {
  return (
    <div className={`goa-palm goa-palm--${side}`}>
      <svg viewBox={VIEW_BOX}>
        <path d={BACK} />
      </svg>
      <svg viewBox={VIEW_BOX}>
        <path d={FRONT} />
      </svg>
    </div>
  )
}

/**
 * Soft shadows of palm fronds swaying over the parent (which must be positioned).
 * `strength` is the overall darkness, 0–1.
 */
export default function PalmShadows({ strength = 0.3, left = true }) {
  return (
    <div className="goa-shadows" style={{ '--goa-shadow': strength }} aria-hidden="true">
      <Palm side="right" />
      {left && <Palm side="left" />}
    </div>
  )
}
