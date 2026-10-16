import { Link } from 'react-router-dom'
import jewelleryStory from '../images/jewellery-story.png'

/** 50/50 story band — aligned columns, lifestyle photo on the right. */
export default function JewelleryStoryPanel() {
  return (
    <section className="border-t border-line/40" aria-labelledby="jewellery-story">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-1">
        <div className="flex items-center bg-cream px-6 py-14 sm:px-10 md:py-16 lg:min-h-[32rem] lg:px-14 lg:py-16 xl:px-20">
          <div className="w-full max-w-lg">
            <p className="eyebrow text-accent">The essence of Goa</p>
            <h2
              id="jewellery-story"
              className="mt-5 font-display text-3xl leading-snug text-ink md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
            >
              Fragments from the bench, worn close to the skin.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-soft md:text-[1.05rem]">
              Our glassware leaves beautiful offcuts. We tumble them smooth, like sea glass, and set each piece in
              brass by hand. No two fragments match; that is the point.
            </p>
            <Link to="/story" className="link-underline mt-8 inline-block text-sm text-primary">
              Read our story
            </Link>
          </div>
        </div>

        <div className="relative min-h-[22rem] w-full lg:min-h-[32rem]">
          <img
            src={jewelleryStory}
            alt="Woman wearing sea-glass jewellery on a Goa beach at sunset"
            className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:object-right"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
