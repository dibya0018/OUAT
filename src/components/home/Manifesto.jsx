import { Fragment } from 'react'
import Container from '../ui/Container'
import { cx } from '../../lib/format'
import { ArrowLink, Eyebrow, FadeUp, Marquee } from './kit'
import rescued from '../images/process-rescued.png'
import reshaped from '../images/process-reshaped.png'
import reborn from '../images/process-reborn.png'
import './Manifesto.css'

/** The closing ticker: the brand line in two halves, then the three steps of the making. */
const TICKER = ['Once discarded', 'Now designed', 'Rescued', 'Reshaped', 'Reborn']
const TICKER_GAP = 'clamp(1.5rem, 4.5vw, 4.5rem)'

/**
 * A small photograph set into the sentence like a word. Decorative, so it carries no alt text.
 * `mid` marks a tile inside the sentence, which narrow phones leave out (see Manifesto.css).
 */
function Tile({ src, focus, order, mid = false }) {
  return (
    <span className={cx('home-manifesto__tile', mid && 'home-manifesto__tile--mid')} style={{ '--tile-order': order }}>
      <img src={src} alt="" loading="lazy" decoding="async" style={{ objectPosition: focus }} />
    </span>
  )
}

/** 01 — The idea: the brand statement, said once and large, with photographs in the line of type. */
export default function Manifesto() {
  return (
    <section className="home-bone home-section pb-0" aria-labelledby="manifesto-title">
      <Container>
        <Eyebrow as="h2" id="manifesto-title" index="01">
          The idea
        </Eyebrow>

        <div className="mt-[clamp(2rem,4.5vw,3.5rem)] grid grid-cols-1 gap-y-[clamp(2.5rem,5.5vw,4.5rem)] md:grid-cols-12 md:gap-x-6">
          {/* Each tile is tied to the word before it, so a photograph never starts a line on its own. */}
          <FadeUp
            as="p"
            className="home-manifesto__statement home-display-lg text-pretty leading-[1.1] text-ink md:col-span-12 lg:col-span-10"
          >
            We collect bottles after their first{' '}
            <span className="whitespace-nowrap">
              life
              <Tile src={rescued} focus="50% 82%" order={0} mid />
            </span>{' '}
            and shape them,{' '}
            <em className="italic">
              by{' '}
              <span className="whitespace-nowrap">
                hand,
                <Tile src={reshaped} focus="50% 72%" order={1} mid />
              </span>
            </em>{' '}
            into glassware, candles and objects worth{' '}
            <span className="whitespace-nowrap">
              keeping.
              <Tile src={reborn} focus="50% 89%" order={2} />
            </span>
          </FadeUp>

          {/* Offset to the right at every width: a quarter in on small screens, the last columns on large ones. */}
          <FadeUp
            delay={120}
            className="ml-[25%] md:col-span-5 md:col-start-8 md:ml-0 lg:col-span-4 lg:col-start-9"
          >
            <p className="text-[0.9375rem] leading-[1.6] text-ink-soft md:text-base">
              <span className="block">A women-led studio in Goa.</span>
              <span className="block">Founded January 2022.</span>
            </p>
            <ArrowLink to="/story" className="mt-6">
              Read our story
            </ArrowLink>
          </FadeUp>
        </div>
      </Container>

      {/* Texture, not information: the same words are said properly elsewhere on the page. */}
      <Marquee
        aria-hidden="true"
        duration={64}
        gap={TICKER_GAP}
        className="mt-[clamp(4rem,9vw,8rem)] border-y border-line py-[clamp(0.75rem,1.8vw,1.75rem)]"
      >
        {TICKER.map((word) => (
          <Fragment key={word}>
            <span className="font-display text-[clamp(4.5rem,12.5vw,11rem)] font-light italic leading-[1.15] tracking-[-0.02em] text-ink/15">
              {word}
            </span>
            <span className="block h-2 w-2 bg-accent md:h-2.5 md:w-2.5" />
          </Fragment>
        ))}
      </Marquee>
    </section>
  )
}
