import { cx } from '../../lib/format'

/**
 * Form-level error banner (e.g. "Invalid email or password.").
 * Renders nothing when there is no message.
 */
export default function FormAlert({ message, className }) {
  if (!message) return null
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cx(
        'flex items-start gap-3 border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5v.01" strokeLinecap="round" />
      </svg>
      <p>{message}</p>
    </div>
  )
}
