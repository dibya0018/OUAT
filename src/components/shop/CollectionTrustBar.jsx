import Container from '../ui/Container'
import Icon from '../ui/Icon'
import floralRepeat from '../../assets/motifs/floral-repeat.svg?url'

export default function CollectionTrustBar({ barClass, iconBorder, items }) {
  if (!items?.length) return null

  return (
    <section className={`relative py-12 md:py-16 ${barClass ?? 'border-y border-accent/10 bg-[#fdfbf7]'}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url(${floralRepeat})`,
          backgroundSize: '120px 120px',
        }}
      />
      <Container className="relative">
        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-center px-2 text-center lg:border-l lg:border-accent/10 lg:first:border-l-0 lg:px-6"
            >
              <span
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full border ${iconBorder ?? 'border-accent/25 text-accent/90'}`}
              >
                <Icon name={item.icon} size={20} strokeWidth={1} />
              </span>
              <p className="font-display text-xl leading-snug text-ink md:text-[1.35rem]">{item.title}</p>
              <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
