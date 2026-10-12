import jewelleryHero from '../images/jewellery-hero.png'

/**
 * Full-width jewellery banner — lifestyle photo on the right, copy on the left.
 */
export default function JewelleryHeroVisual({ children }) {
  return (
    <section className="relative isolate min-h-[24rem] overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:min-h-[32rem] md:pt-20 lg:min-h-[36rem]">
      <img
        src={jewelleryHero}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-[68%_center] lg:object-[right_center]"
        fetchPriority="high"
      />
      {/* Solid read zone — avoids showing baked-in text from wrong assets */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#f5f0e8]/85 from-0% via-[#f5f0e8]/35 via-[38%] to-transparent to-[55%] md:via-[32%] md:to-[50%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#f3ece0]/90 via-transparent to-transparent md:hidden"
      />

      <div className="relative z-[1] flex min-h-[calc(24rem-1.5rem)] items-center py-8 md:min-h-[calc(32rem-2.5rem)] md:py-14 lg:min-h-[calc(36rem-2.5rem)]">
        {children}
      </div>
    </section>
  )
}
