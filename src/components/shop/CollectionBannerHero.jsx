import Container from '../ui/Container'
import { cx } from '../../lib/format'

const VARIANT_STYLES = {
  glassware: {
    section: 'bg-cream',
    minHeight:
      'min-h-[26rem] md:min-h-[34rem] lg:min-h-[38rem]',
    overlay:
      'bg-gradient-to-r from-[#f0e9d3]/96 from-0% via-[#f0e9d3]/55 via-[40%] to-transparent to-[58%] md:via-[36%] md:to-[50%]',
    overlayMobile:
      'bg-gradient-to-t from-[#f0e9d3]/98 via-[#f0e9d3]/45 to-transparent md:hidden',
    accentBar: 'h-1 bg-gradient-to-r from-primary via-primary/40 to-transparent',
  },
  candles: {
    section: 'bg-ink text-cream',
    minHeight:
      'min-h-[28rem] md:min-h-[36rem] lg:min-h-[40rem]',
    overlay:
      'bg-gradient-to-r from-[#141210]/97 from-0% via-[#141210]/82 via-[38%] to-[#141210]/35 to-100%',
    overlayMobile:
      'bg-gradient-to-t from-[#141210]/98 via-[#141210]/55 to-transparent md:hidden',
    glow: 'bg-gradient-to-tr from-[#a05d49]/40 via-transparent to-transparent',
    accentBar: 'h-px bg-gradient-to-r from-accent/80 via-accent/30 to-transparent',
  },
  kitchen: {
    section: 'bg-white',
    minHeight:
      'min-h-[25rem] md:min-h-[32rem] lg:min-h-[36rem]',
    overlay:
      'bg-gradient-to-r from-white/97 from-0% via-white/75 via-[42%] to-transparent to-[56%] md:to-[50%]',
    overlayMobile:
      'bg-gradient-to-t from-white/98 via-white/55 to-transparent md:hidden',
    accentBar: 'h-1 bg-gradient-to-r from-primary/70 via-sage/50 to-transparent',
    weave: true,
  },
  jewellery: {
    section: 'bg-cream',
    minHeight: 'min-h-[24rem] md:min-h-[32rem] lg:min-h-[36rem]',
    overlay:
      'bg-gradient-to-r from-[#f5f0e8]/85 from-0% via-[#f5f0e8]/35 via-[38%] to-transparent to-[55%] md:via-[32%] md:to-[50%]',
    overlayMobile:
      'bg-gradient-to-t from-[#f3ece0]/90 via-transparent to-transparent md:hidden',
    accentBar: 'h-0',
  },
}

/**
 * Full-width collection banner — lifestyle photo, copy on the left (same pattern as jewellery).
 * @param {{ banner: import('../../lib/collectionBanners').CollectionBannerConfig, children: import('react').ReactNode, align?: 'left'|'center' }} props
 */
export default function CollectionBannerHero({ banner, children, align = 'left' }) {
  if (!banner?.src) return null

  const variant = banner.variant ?? 'glassware'
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.glassware
  const centered = align === 'center'

  return (
    <section
      className={cx(
        'collection-banner relative isolate flex w-full flex-col overflow-hidden',
        'pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-20',
        styles.section,
        styles.minHeight,
      )}
    >
      <img
        src={banner.src}
        alt=""
        aria-hidden
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={cx(
          'absolute inset-0 h-full w-full object-cover',
          banner.objectClass ?? 'object-[70%_center] sm:object-[68%_center] lg:object-[right_center]',
        )}
        style={banner.objectPosition ? { objectPosition: banner.objectPosition } : undefined}
        fetchPriority="high"
      />

      <div aria-hidden className={cx('absolute inset-0', styles.overlay)} />
      {styles.overlayMobile && <div aria-hidden className={cx('absolute inset-0', styles.overlayMobile)} />}
      {styles.glow && <div aria-hidden className={cx('absolute inset-0', styles.glow)} />}
      {styles.weave && (
        <div aria-hidden className="pointer-events-none absolute inset-0 texture-weave opacity-35" />
      )}
      {variant === 'glassware' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 texture-grain opacity-[0.14] mix-blend-multiply"
        />
      )}

      <div
        className={cx(
          'relative z-[1] flex flex-1 items-center py-10 md:py-14 lg:py-16',
          centered && 'justify-center text-center',
        )}
      >
        <Container
          className={cx(
            'relative w-full',
            centered ? 'flex justify-center' : '',
          )}
        >
          <div className={cx('relative z-[2] w-full min-w-0', centered ? 'max-w-2xl' : 'max-w-xl')}>
            {children}
          </div>
        </Container>
      </div>

      <div aria-hidden className={cx('absolute inset-x-0 bottom-0', styles.accentBar)} />
    </section>
  )
}
