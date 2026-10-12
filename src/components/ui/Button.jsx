import { Link } from 'react-router-dom'
import { cx } from '../../lib/format'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xs font-sans text-sm tracking-wide ' +
  'whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ' +
  'focus-visible:outline-offset-4'

const variants = {
  /* Default CTA: dark olive fill, cream label — high contrast on cream/sage pages. */
  solid: 'border border-primary bg-primary text-cream hover:border-primary-hover hover:bg-primary-hover',
  outline:
    'border border-primary bg-transparent text-primary hover:border-primary-hover hover:bg-primary hover:text-cream',
  /* On dark olive or sage hero/footer bands: cream fill, dark label. */
  inverse: 'border border-cream bg-cream text-primary hover:border-white hover:bg-white',
  text: 'link-underline shrink-0 whitespace-normal rounded-none px-0 py-0 text-primary',
}

const sizes = {
  md: 'h-12 px-6',
  sm: 'h-10 px-4',
  text: '',
}

/**
 * Button or link styled as a button.
 * - Pass `to` for an internal route (renders React Router <Link>).
 * - Pass `href` for an external URL (renders <a>).
 * - Otherwise renders a <button>.
 */
export default function Button({
  variant = 'solid',
  size,
  to,
  href,
  type = 'button',
  className,
  children,
  fullWidth = false,
  ...rest
}) {
  const resolvedSize = size || (variant === 'text' ? 'text' : 'md')
  const classes = cx(base, variants[variant], sizes[resolvedSize], fullWidth && 'w-full', className)

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    // Only external http(s) links open in a new tab; anchors and mailto stay in place.
    const external = /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className={classes}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
