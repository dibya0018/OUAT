export default function CollectionSortControl({ id, sort, onSortChange, sortOptions, className = '' }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      <label htmlFor={id} className="eyebrow">
        Sort
      </label>
      <select
        id={id}
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="cursor-pointer appearance-none border-b border-line bg-transparent py-1 pr-5 text-sm text-primary focus:border-primary focus:outline-none"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
