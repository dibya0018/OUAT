/** Geometry for the Goa atmosphere effects: palm fronds, wave edges, seeded scatter. */

const f = (n) => n.toFixed(1)

/** Small seeded generator, so scattered effects land in the same places on every render. */
export function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/** Thin pointed leaflet from (px,py) to (ex,ey). */
function leaflet(px, py, ex, ey, w) {
  const mx = (px + ex) / 2
  const my = (py + ey) / 2
  const len = Math.hypot(ex - px, ey - py) || 1
  const nx = (-(ey - py) / len) * w
  const ny = ((ex - px) / len) * w
  return `M${f(px)} ${f(py)}Q${f(mx + nx)} ${f(my + ny)} ${f(ex)} ${f(ey)}Q${f(mx - nx * 0.35)} ${f(my - ny * 0.35)} ${f(px)} ${f(py)}Z`
}

/**
 * Silhouette of one palm frond leaving the origin.
 * @param {[number, number, number]} spec angle in degrees (0 = right, 90 = down), length, extra droop at the tip
 * @returns {string} SVG path data: midrib plus leaflets
 */
export function frondPath([angle, length, droop]) {
  const a = (angle * Math.PI) / 180
  const k = length / 125
  const tx = Math.cos(a) * length
  const ty = Math.sin(a) * length + droop
  const cx = Math.cos(a) * length * 0.45
  const cy = Math.sin(a) * length * 0.45 - length * 0.16
  const count = 24
  let d = ''
  let prev = [0, 0]
  for (let i = 1; i <= count; i += 1) {
    const t = 0.05 + (i / count) * 0.94
    const u = 1 - t
    const x = 2 * u * t * cx + t * t * tx
    const y = 2 * u * t * cy + t * t * ty
    let dx = 2 * u * cx + 2 * t * (tx - cx)
    let dy = 2 * u * cy + 2 * t * (ty - cy)
    const dl = Math.hypot(dx, dy) || 1
    dx /= dl
    dy /= dl
    // the midrib, as a run of short thick segments
    d += leaflet(prev[0], prev[1], x, y, 2.2 * k * (1.2 - t))
    prev = [x, y]
    const size = (8 + 30 * Math.max(0, Math.sin(Math.PI * Math.min(1, t))) ** 0.75) * k
    for (const side of [-1, 1]) {
      // leaflets sweep toward the tip and hang a little under their own weight
      let lx = dx * 0.7 - dy * side * 0.8
      let ly = dy * 0.7 + dx * side * 0.8 + 0.4
      const ll = Math.hypot(lx, ly) || 1
      lx /= ll
      ly /= ll
      d += leaflet(x, y, x + lx * size, y + ly * size, 2.5 * k)
    }
  }
  return d
}

/**
 * Closed wave shape for a 1440-wide, 100-tall viewBox, wavy on top and flat below.
 * Periods must divide 720 so the shape loops when slid by half its width.
 * @returns {{ fill: string, crest: string }} filled shape and its top edge on its own
 */
export function wavePath({ base = 30, amp = 14, period = 720, phase = 0, ripple = 0.3 }) {
  const step = 8
  let crest = ''
  for (let x = 0; x <= 1440; x += step) {
    const p = (x / period) * Math.PI * 2 + phase
    const y = base + amp * Math.sin(p) + amp * ripple * Math.sin(p * 3 + 1.3)
    crest += `${x === 0 ? 'M' : 'L'}${x} ${f(y)}`
  }
  return { fill: `${crest}V100H0Z`, crest }
}
