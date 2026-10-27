import { useId, useState } from 'react'
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
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password' && !as && !options
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
  } else if (isPassword) {
    control = (
      <input
        {...shared}
        type={showPassword ? 'text' : 'password'}
        className={cx(shared.className, 'pr-14')}
      />
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
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            aria-controls={id}
            /* 40px target; 20px icon centred in it sits ~12px in from the field's right edge. */
            className="absolute top-1/2 right-0.5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xs text-primary/80 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-primary"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M3 3l18 18" />
                  <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.9 3.8" />
                  <path d="M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 7 9.5 7a9.6 9.6 0 0 0 5.4-1.6" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </>
              ) : (
                <>
                  <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        )}
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
