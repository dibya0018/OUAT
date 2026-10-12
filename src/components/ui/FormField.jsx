import { useId } from 'react'
import { cx } from '../../lib/format'

const controlBase =
  'w-full border-0 border-b bg-transparent py-3 font-sans text-base text-ink ' +
  'placeholder:text-ink/40 transition-colors duration-200 focus:outline-none ' +
  'focus:border-primary rounded-none'

/**
 * Labelled form control with inline error. Supports input, textarea and select.
 * Pass `options` ([{ value, label }]) to render a select.
 */
export default function FormField({
  label,
  name,
  type = 'text',
  as,
  options,
  error,
  hint,
  required = false,
  className,
  ...rest
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  const shared = {
    id,
    name,
    required,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    className: cx(controlBase, error ? 'border-primary' : 'border-line'),
    ...rest,
  }

  let control
  if (as === 'textarea') {
    control = <textarea rows={4} {...shared} />
  } else if (options) {
    control = (
      <select {...shared} className={cx(shared.className, 'appearance-none pr-6')}>
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  } else {
    control = <input type={type} {...shared} />
  }

  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="eyebrow">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {control}
        {options && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-primary"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  )
}
