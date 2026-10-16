/**
 * Split a catalogue name into a display title and its details.
 *   "Morning Shot Glasses | Set of 4 (120 ml) | Upcycled Beer Bottle Drinkware"
 *     → { title: 'Morning Shot Glasses', details: 'Set of 4 (120 ml) · Upcycled Beer Bottle Drinkware' }
 *   "Nourishing Massage Candle Collection (Set of 3 × 70g)"
 *     → { title: 'Nourishing Massage Candle Collection', details: 'Set of 3 × 70g' }
 * Names without pipes or a trailing bracket come back unchanged with no details.
 */
export function productTitleParts(name = '') {
  const [first, ...rest] = String(name)
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
  let title = first ?? ''
  const details = [...rest]
  const bracket = title.match(/^(.*\S)\s*\(([^()]+)\)$/)
  if (bracket && bracket[1].length > 3) {
    title = bracket[1]
    details.unshift(bracket[2])
  }
  return { title, details: details.join(' · ') }
}
