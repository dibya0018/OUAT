import { cx } from '../../../lib/format'

/**
 * Seamless horizontal ticker: the children are laid out twice and the track
 * slides by exactly one copy. `duration` is seconds per loop; `gap` is any CSS length.
 */
export default function Marquee({ duration = 40, reverse = false, gap = '3rem', className, style, children, ...rest }) {
  return (
    <div
      className={cx('home-marquee', reverse && 'home-marquee--reverse', className)}
      style={{
        '--home-marquee-duration': `${duration}s`,
        '--home-marquee-gap': typeof gap === 'number' ? `${gap}px` : gap,
        ...style,
      }}
      {...rest}
    >
      <div className="home-marquee__track">
        <div className="home-marquee__group">{children}</div>
        <div className="home-marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
