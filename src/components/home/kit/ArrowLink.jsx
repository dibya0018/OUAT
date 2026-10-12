import { Link } from 'react-router-dom'
import Icon from '../../ui/Icon'
import { cx } from '../../../lib/format'

/**
 * Text link with an underline that draws in and an arrow that slides on hover.
 * Pass `to` for a route (React Router <Link>) or `href` for a plain <a>;
 * `tone` is 'dark' on light surfaces and 'light' on dark ones.
 */
export default function ArrowLink({ to, href, tone = 'dark', className, children, ...rest }) {
  const classes = cx('home-arrow-link', tone === 'light' && 'home-arrow-link--light', className)
  const content = (
    <>
      {/* The label stays inline inside this wrapper so the underline follows the text if it wraps. */}
      <span>
        <span className="home-arrow-link__label">{children}</span>
      </span>
      <Icon name="arrowRight" size={16} className="home-arrow-link__icon" />
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }
  // Neither given: an action rather than a destination.
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  )
}
