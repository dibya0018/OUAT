import Button from '../../ui/Button'
import EditorialTitle from '../../ui/EditorialTitle'
import CollectionBannerHero from '../CollectionBannerHero'

export default function CollectionHeroBlock({
  banner,
  editorial,
  categories,
  heroAccent,
  heroRest,
  description,
  audienceLine,
}) {
  if (!banner || !editorial) return null

  return (
    <CollectionBannerHero banner={banner}>
      <div className="relative z-[2] w-full min-w-0 max-w-xl text-left">
        <p className={`eyebrow ${editorial.heroOnDark ? 'text-cream/85' : categories.accentClass}`}>
          {editorial.heroEyebrow}
        </p>
        <EditorialTitle
          as="h1"
          size="lg"
          onDark={editorial.heroOnDark}
          accent={heroAccent}
          rest={heroRest}
          className="mt-5 [text-wrap:wrap]"
        />
        <p
          className={`mt-6 w-full max-w-lg text-base leading-relaxed ${editorial.heroOnDark ? 'text-cream/85' : 'text-ink-soft'}`}
        >
          {description}
        </p>
        {audienceLine && (
          <p
            className={`mt-4 max-w-lg font-display text-lg leading-snug italic ${editorial.heroOnDark ? 'text-cream/90' : 'text-ink/90'}`}
          >
            {audienceLine}
          </p>
        )}
        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button href={editorial.heroPrimaryCta.href} variant="outline" className={editorial.primaryButtonClass}>
            {editorial.heroPrimaryCta.label}
          </Button>
          <Button
            to={editorial.heroSecondaryCta.to}
            variant="text"
            className={editorial.secondaryButtonClass ?? 'justify-center text-primary sm:justify-start'}
          >
            {editorial.heroSecondaryCta.label}
          </Button>
        </div>
      </div>
    </CollectionBannerHero>
  )
}
