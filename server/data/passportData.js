/**
 * Bottle passport data.
 *
 * Until the studio records real batches, every passport is derived from this file:
 * the village, maker and dates are picked deterministically from the order line, so a
 * passport always shows the same story. To use real records, add entries to `batches`
 * (keyed by product id, or by `item:<order_items.id>` for a single line). Any field a
 * batch gives wins over the derived one. Set `isSample` to false once the data is real
 * so the "illustrative" note disappears from emails and the passport page.
 */
export default {
  isSample: true,

  /** Where bottles are collected, with how many have been rescued there so far. */
  villages: [
    { name: 'Calangute', bottles: 128 },
    { name: 'Merces', bottles: 211 },
    { name: 'Siolim', bottles: 76 },
    { name: 'Panjim', bottles: 94 },
  ],

  artisans: [
    { name: 'Lakshmi', role: 'Glass cutter and polisher' },
    { name: 'Santosh', role: 'Glass cutter' },
    { name: 'Meera', role: 'Finisher and quality check' },
  ],

  /**
   * Real batch records. Example:
   * 'prod-123': {
   *   village: 'Siolim',
   *   was: 'Amber beer bottle',
   *   now: 'Candle',
   *   artisan: { name: 'Lakshmi', role: 'Glass cutter and polisher' },
   *   dates: { rescued: '2026-08-12', cleaned: '2026-08-14', cut: '2026-08-20', finished: '2026-08-26' },
   * },
   */
  batches: {},
}
