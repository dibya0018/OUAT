import { wavePath } from './shapes'

/* Deep water at the back, pale shallows in front. Stops are [top, bottom] of each wave. */
const WAVES = [
  {
    layer: 'back',
    shape: wavePath({ base: 34, amp: 16, period: 720, phase: 0.4, ripple: 0.22 }),
    stops: ['#236a70', '#3a8a87'],
    opacity: 0.82,
  },
  {
    layer: 'mid',
    shape: wavePath({ base: 34, amp: 13, period: 360, phase: 2.1, ripple: 0.3 }),
    stops: ['#3f9391', '#62aea4'],
    opacity: 0.86,
  },
  {
    layer: 'front',
    shape: wavePath({ base: 34, amp: 11, period: 240, phase: 4.2, ripple: 0.25 }),
    stops: ['#74bcb0', '#9fd3c6'],
    opacity: 0.94,
    foam: true,
  },
]

/** Uneven lobes where the water thins out over the sand. */
const SWASH_EDGE =
  'C1380 74 1300 80 1230 62C1160 44 1100 58 1040 72C960 90 880 84 820 64C760 46 700 52 640 70C560 92 470 86 400 62C340 44 280 54 220 70C150 88 70 82 0 56'

/** The same edge set back by `dy`, for the lines of bubbles left behind the foam. */
const edgeRaised = (dy) => SWASH_EDGE.replace(/(\d+) (\d+)/g, (_, x, y) => `${x} ${Number(y) - dy}`)
const BUBBLES_NEAR = edgeRaised(9)
const BUBBLES_FAR = edgeRaised(19)

function Wave({ layer, shape, stops, opacity, foam }) {
  const id = `goa-wave-${layer}`
  return (
    <svg className={`goa-wave goa-wave--${layer}`} viewBox="0 0 1440 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={stops[0]} stopOpacity={opacity} />
          <stop offset="1" stopColor={stops[1]} stopOpacity={opacity} />
        </linearGradient>
      </defs>
      <path d={shape.fill} fill={`url(#${id})`} />
      {foam && (
        <>
          <path className="goa-wave__foam goa-wave__foam--soft" d={shape.crest} />
          <path className="goa-wave__foam" d={shape.crest} />
        </>
      )}
    </svg>
  )
}

/**
 * The sea meeting the sand. Sits on the seam between the hero and the section
 * below it: waves roll over the foot of the photo, and a sheet of water runs
 * up the sand and slides back, leaving it wet.
 */
export default function Shoreline() {
  return (
    <div className="goa-shore" aria-hidden="true">
      <div className="goa-shore__band">
        <div className="goa-shore__wet" />
        {WAVES.map((w) => (
          <Wave key={w.layer} {...w} />
        ))}
        <div className="goa-shore__glitter" />
        <svg className="goa-swash" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="goa-swash-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#99cfc3" stopOpacity="0.97" />
              <stop offset="0.45" stopColor="#bfe2d7" stopOpacity="0.78" />
              <stop offset="1" stopColor="#f4fbf7" stopOpacity="0.42" />
            </linearGradient>
          </defs>
          <path d={`M0 0H1440V52${SWASH_EDGE}Z`} fill="url(#goa-swash-fill)" />
          {/* foam: a soft band, a bright edge, and bubbles left behind it */}
          <path className="goa-swash__foam goa-swash__foam--soft" d={`M1440 52${SWASH_EDGE}`} />
          <path className="goa-swash__foam" d={`M1440 52${SWASH_EDGE}`} />
          <path className="goa-swash__bubbles" d={`M1440 43${BUBBLES_NEAR}`} />
          <path className="goa-swash__bubbles goa-swash__bubbles--far" d={`M1440 33${BUBBLES_FAR}`} />
        </svg>
      </div>
    </div>
  )
}
