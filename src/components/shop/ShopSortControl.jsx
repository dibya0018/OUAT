import { SORT_OPTIONS } from '../../services/productService'
import { cx } from '../../lib/format'

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234D694E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

/**
 * @param {{ value: string, onChange: (value: string) => void, variant?: 'mobile' | 'desktop' }} props
 */
export default function ShopSortControl({ value, onChange, variant = 'desktop' }) {
  const mobile = variant === 'mobile'
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Featured'

  return (
    <div className={cx(mobile ? 'shrink-0' : 'min-w-0 md:shrink-0')}>
      {!mobile && (
        <label htmlFor="shop-sort-desktop" className="eyebrow">
          Sort
        </label>
      )}
      <select
        id={mobile ? 'shop-sort-mobile' : 'shop-sort-desktop'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={mobile ? `Sort: ${currentLabel}` : undefined}
        className={cx(
          'cursor-pointer appearance-none text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2',
          mobile
            ? 'max-w-[6.75rem] truncate rounded-full border border-line bg-white py-2 pr-7 pl-3 text-xs font-medium'
            : 'mt-2 w-full min-w-0 border-b border-line bg-transparent py-2 pr-8 text-sm md:w-auto md:min-w-[10rem]',
        )}
        style={{
          backgroundImage: CHEVRON,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.65rem center',
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
