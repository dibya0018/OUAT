import { useState } from 'react'
import { cx } from '../../lib/format'
import { SITE } from '../../lib/site'

/** Brand wordmark (dark artwork on transparent). Lives in /public/images. */
const LOGO_SRC = '/images/ouat-logo.png'

/**
 * Brand logo image. `inverse` turns the dark artwork white for dark or photo
 * backgrounds. Falls back to the text wordmark if the file is missing.
 */
export default function Logo({ inverse = false, className, fallbackClassName }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className={cx('font-display font-light tracking-[0.18em]', fallbackClassName)}>O.U.A.T.</span>
  }

  return (
    <img
      data-no-skeleton
      src={LOGO_SRC}
      alt={`${SITE.name} ${SITE.longName}`}
      className={cx('block w-auto transition-[filter] duration-200', inverse && 'brightness-0 invert', className)}
      onError={() => setFailed(true)}
    />
  )
}
