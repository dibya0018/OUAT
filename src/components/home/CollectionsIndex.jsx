import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Icon from '../ui/Icon'
import { cx } from '../../lib/format'
import { getCollectionPath } from '../../lib/collections'
import { getCollectionBanner } from '../../lib/collectionBanners'
import { getCollections } from '../../services/productService'
import { ArrowLink, Eyebrow, FadeUp, RevealImage, RevealLines } from './kit'
import './CollectionsIndex.css'

const TITLE_ID = 'collections-index-title'
const NOTE_ID = 'collections-index-note'

const TITLE_LINES = [
  'Four ways',
  <Fragment key="comes-back">
    a bottle <em className="italic text-accent">comes back</em>
  </Fragment>,
]

/** Placeholders that hold the layout while the collections load. */
const SKELETON = ['one', 'two', 'three', 'four']

/** One index row: numeral, name and tagline, arrow. Shared by the rows and their skeleton. */
const ROW = 'grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-6 py-7 xl:gap-x-8 xl:py-9'
/** Card photographs are 3:2 on a phone and 4:5 from two columns up. */
const CARD_RATIO = 'aspect-[3/2] sm:aspect-[4/5]'
/** The calm tone a frame shows before (or without) its photograph. */
const FRAME_TONE = 'bg-cream/70'

/*
 * The studio photographs were composed as wide banners. Cut to a 4:5 or 3:2
 * frame they need telling where the subject sits; anything else is centred.
 */
const CENTRED = 'top-0 h-full object-center'
const FRAMING = [
  // This file carries a pale border above and below the picture, so it is drawn taller than its frame.
  { match: /glassware-hero/, className: 'top-[-5.3%] h-[123%] object-[91%_50%]' },
  { match: /jewellery-hero/, className: 'top-0 h-full object-[92%_50%]' },
  { match: /goa-sunset/, className: 'top-0 h-full object-[58%_50%]' },
  { match: /process-(rescued|reborn)/, className: 'top-0 h-full object-[50%_80%]' },
]

function framingFor(src) {
  return FRAMING.find((entry) => entry.match.test(src))?.className ?? CENTRED
}

/** What a row, a card and the preview each need from one collection. */
function toEntry(collection, index) {
  const src = collection.image?.src || getCollectionBanner(collection.slug)?.src || null
  return {
    slug: collection.slug,
    name: collection.name,
    tagline: collection.tagline,
    description: collection.description,
    to: getCollectionPath(collection.slug),
    numeral: String(index + 1).padStart(2, '0'),
    // The jewellery collection is not open yet.
    soon: collection.slug === 'jewellery',
    src,
    framing: src ? framingFor(src) : CENTRED,
  }
}

/** The tiny tag beside a collection that has not opened. */
function SoonTag() {
  return <span className="home-label whitespace-nowrap text-accent">Coming soon</span>
}

/** A collection as a card: photograph, numeral, name, tagline. Used where there is no hover. */
function CollectionCard({ entry }) {
  return (
    <li>
      <Link to={entry.to} className="home-zoom block">
        {entry.src ? (
          <RevealImage
            src={entry.src}
            alt=""
            ratio={null}
            className={cx('h-auto', CARD_RATIO, FRAME_TONE)}
            imgClassName={entry.framing}
          />
        ) : (
          <div className={cx(CARD_RATIO, FRAME_TONE)} />
        )}
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <span className="home-label tabular-nums text-ink-soft">{entry.numeral}</span>
          {entry.soon && <SoonTag />}
        </div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h3 className="home-display-md text-ink">{entry.name}</h3>
          <Icon name="arrowRight" size={20} strokeWidth={1} className="mb-1.5 shrink-0 text-primary" />
        </div>
        <p className="mt-2 text-sm text-ink-soft">{entry.tagline}</p>
      </Link>
    </li>
  )
}

/** 02 — Collections: a typographic index of the collections, and a photograph that answers it. */
export default function CollectionsIndex() {
  // null while the request is out, then one entry per collection.
  const [entries, setEntries] = useState(null)
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [focusing, setFocusing] = useState(false)

  useEffect(() => {
    let alive = true
    getCollections()
      .then((list) => {
        if (alive) setEntries(Array.isArray(list) ? list.map(toEntry) : [])
      })
      .catch(() => {
        if (alive) setEntries([])
      })
    return () => {
      alive = false
    }
  }, [])

  // Nothing came back: leave the section out rather than show an empty index.
  if (entries && entries.length === 0) return null

  const loading = entries === null
  const engaged = hovering || focusing

  return (
    <section className="home-bone home-section" aria-labelledby={TITLE_ID} aria-busy={loading || undefined}>
      <Container>
        <header className="flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between lg:gap-x-10">
          <div>
            <Eyebrow index="02">Collections</Eyebrow>
            <RevealLines id={TITLE_ID} lines={TITLE_LINES} className="home-display-lg mt-6 text-ink lg:mt-8" />
          </div>
          <FadeUp delay={200} className="lg:pb-2">
            <ArrowLink to="/shop">View all pieces</ArrowLink>
          </FadeUp>
        </header>

        {/* Wide screens with a pointer: the index on the left drives the photograph on the right. */}
        <div className="home-collections__index mt-14 grid-cols-12 gap-x-10 xl:mt-20 xl:gap-x-16">
          <FadeUp
            as="ul"
            className={cx('home-collections__list col-span-7 border-t border-line', engaged && 'is-engaged')}
            onMouseLeave={() => setHovering(false)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocusing(false)
            }}
          >
            {loading
              ? SKELETON.map((key) => (
                  <li key={key} className="border-b border-line" aria-hidden="true">
                    <div className={ROW}>
                      <span className="home-label">&nbsp;</span>
                      <div>
                        <div className="home-display-lg">&nbsp;</div>
                        <div className="mt-3 text-sm">&nbsp;</div>
                      </div>
                    </div>
                  </li>
                ))
              : entries.map((entry, index) => {
                  const isActive = index === active
                  return (
                    <li key={entry.slug} className="border-b border-line">
                      <Link
                        to={entry.to}
                        aria-describedby={`${NOTE_ID}-${entry.slug}`}
                        className={cx('home-collections__row -outline-offset-2', ROW, isActive && 'is-active')}
                        onMouseEnter={() => {
                          setActive(index)
                          setHovering(true)
                        }}
                        onFocus={(event) => {
                          setActive(index)
                          // A click focuses the row too; only keyboard focus should hold the list engaged.
                          if (event.currentTarget.matches(':focus-visible')) setFocusing(true)
                        }}
                      >
                        <span className="home-label tabular-nums text-ink-soft">{entry.numeral}</span>
                        <div className="min-w-0">
                          <div className="home-collections__name flex flex-wrap items-baseline gap-x-5 gap-y-1">
                            <h3 className={cx('home-display-lg', isActive ? 'text-primary' : 'text-ink')}>
                              {entry.name}
                            </h3>
                            {entry.soon && <SoonTag />}
                          </div>
                          <p className="mt-3 text-sm text-ink-soft">{entry.tagline}</p>
                        </div>
                        <Icon
                          name="arrowRight"
                          size={22}
                          strokeWidth={1}
                          className={cx('home-collections__arrow self-center', isActive ? 'text-primary' : 'text-ink')}
                        />
                      </Link>
                    </li>
                  )
                })}
          </FadeUp>

          <div className="col-span-5">
            <div className="home-collections__preview ml-auto">
              <FadeUp delay={150}>
                {/* Decorative: every row already names its collection. */}
                <div className={cx('relative aspect-[4/5] overflow-hidden', FRAME_TONE)} aria-hidden="true">
                  {!loading &&
                    entries.map((entry, index) =>
                      entry.src ? (
                        <div
                          key={entry.slug}
                          className={cx('home-collections__shot absolute inset-0', index === active && 'is-active')}
                        >
                          <img
                            src={entry.src}
                            alt=""
                            decoding="async"
                            className={cx('absolute left-0 w-full max-w-none object-cover', entry.framing)}
                          />
                        </div>
                      ) : null,
                    )}
                </div>
                {/* Stacked in one cell so the caption is as tall as the longest note and never jumps. */}
                <div className="mt-5 grid min-h-[4.25rem]">
                  {!loading &&
                    entries.map((entry, index) => (
                      <p
                        key={entry.slug}
                        id={`${NOTE_ID}-${entry.slug}`}
                        className={cx(
                          'home-collections__note col-start-1 row-start-1 text-sm text-ink-soft',
                          index === active && 'is-active',
                        )}
                      >
                        {entry.description}
                      </p>
                    ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </div>

        {/* Narrow or touch screens: no hover to lean on, so each collection is a card. */}
        <ul className="home-collections__cards mt-12 grid-cols-1 gap-x-6 gap-y-12 sm:mt-14 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-4">
          {loading
            ? SKELETON.map((key) => (
                <li key={key} aria-hidden="true">
                  <div className={cx(CARD_RATIO, FRAME_TONE)} />
                  <div className="home-label mt-5">&nbsp;</div>
                  <div className="home-display-md mt-2">&nbsp;</div>
                  <div className="mt-2 text-sm">&nbsp;</div>
                </li>
              ))
            : entries.map((entry) => <CollectionCard key={entry.slug} entry={entry} />)}
        </ul>
      </Container>
    </section>
  )
}
