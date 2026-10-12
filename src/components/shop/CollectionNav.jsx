import { Link, useSearchParams } from 'react-router-dom'
import { collectionChipLabel, getCollectionPath } from '../../lib/collections'
import { cx } from '../../lib/format'

function chipClass(active) {
  return cx(
    'inline-flex shrink-0 snap-start items-center rounded-full border px-3.5 py-2 text-xs font-medium tracking-wide transition-colors duration-200',
    active
      ? 'border-primary bg-primary text-cream shadow-sm'
      : 'border-line/80 bg-white text-ink-soft hover:border-primary/40 hover:text-primary',
  )
}

/** Category navigation — chips on mobile, text tabs on desktop. */
export default function CollectionNav({ collections, activeSlug = null, className }) {
  const [searchParams] = useSearchParams()
  const search = searchParams.toString() ? `?${searchParams}` : ''

  return (
    <>
      {/* Mobile: horizontal chips + edge fade */}
      <nav
        aria-label="Collections"
        className={cx(
          'min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-2.5 pl-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden',
          className,
        )}
      >
        <ul className="flex w-max snap-x snap-mandatory gap-2 pr-3">
          <li className="snap-start">
            <Link
              to={`/shop${search}`}
              className={chipClass(activeSlug === null)}
              aria-current={activeSlug === null ? 'page' : undefined}
            >
              All
            </Link>
          </li>
          {collections.map((c) => (
            <li key={c.slug} className="snap-start">
              <Link
                to={`${getCollectionPath(c.slug)}${search}`}
                className={chipClass(activeSlug === c.slug)}
                aria-current={activeSlug === c.slug ? 'page' : undefined}
              >
                {collectionChipLabel(c)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: underline tabs */}
      <nav aria-label="Collections" className={cx('hidden min-w-0 md:block', className)}>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <li>
            <Link
              to={`/shop${search}`}
              className={cx(
                'link-underline',
                activeSlug === null ? 'font-medium text-primary' : 'text-ink-soft',
              )}
              aria-current={activeSlug === null ? 'page' : undefined}
            >
              All
            </Link>
          </li>
          {collections.map((c) => (
            <li key={c.slug}>
              <Link
                to={`${getCollectionPath(c.slug)}${search}`}
                className={cx(
                  'link-underline',
                  activeSlug === c.slug ? 'font-medium text-primary' : 'text-ink-soft',
                )}
                aria-current={activeSlug === c.slug ? 'page' : undefined}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
