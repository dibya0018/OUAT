import { Link } from 'react-router-dom'

export default function CollectionStoryPanel({
  eyebrow,
  titleAccent, // optional green opening words of the title
  title,
  body,
  image,
  imageAlt,
  imagePosition,
  storyLink = '/story',
  reverse = false,
  textClass = 'bg-cream',
}) {
  const textBlock = (
    <div
      className={`flex items-center px-6 py-14 sm:px-10 md:py-16 lg:min-h-[32rem] lg:px-14 lg:py-16 xl:px-20 ${textClass}`}
    >
          <div className="w-full max-w-lg">
            {eyebrow && <p className="eyebrow mb-5 text-accent">{eyebrow}</p>}
            <h2
              id="collection-story"
              className="font-display text-3xl leading-snug text-ink md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
            >
              {titleAccent && <span className="text-primary">{titleAccent} </span>}
              {title}
            </h2>
            {body && <p className="mt-6 text-base leading-relaxed text-ink-soft md:text-[1.05rem]">{body}</p>}
            <Link to={storyLink} className="link-underline mt-8 inline-block text-sm text-primary">
              Read our story
            </Link>
          </div>
    </div>
  )

  const imageBlock = (
    <div className="relative min-h-[22rem] w-full lg:min-h-[32rem]">
      <img
        src={image}
        alt={imageAlt}
        className={`absolute inset-0 h-full w-full object-cover ${imagePosition ?? 'object-[72%_center] lg:object-right'}`}
      />
    </div>
  )

  return (
    <section className="border-t border-line/40" aria-labelledby="collection-story">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-1">
        {reverse ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </section>
  )
}
