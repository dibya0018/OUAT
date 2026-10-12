import Container from '../ui/Container'
import { SITE } from '../../lib/site'
import { ArrowLink, Eyebrow, FadeUp, RevealImage, RevealLines } from './kit'
import handsAtWork from '../images/process-reshaped.png'
import goaSunset from '../images/goa-sunset.png'
import './StudioStory.css'

/** 06 — The studio: who makes the pieces, and the place they are made in. */
export default function StudioStory() {
  return (
    <section
      className="home-studio home-bone overflow-x-clip pt-[clamp(5rem,11vw,10rem)]"
      aria-labelledby="studio-story-title"
    >
      <Container>
        {/*
          Small screens read heading, portrait, story. From lg the portrait takes the left
          columns for the full height, with the heading held to its top edge and the story to its foot.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6">
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <Eyebrow index="05">The studio</Eyebrow>
            <RevealLines
              as="h2"
              id="studio-story-title"
              className="home-display-lg mt-6 text-ink md:mt-8 lg:text-[clamp(2.25rem,4vw,3.5rem)]"
              lines={[
                'A women-led studio,',
                'working by hand',
                <em key="place" className="italic text-accent">
                  in Goa.
                </em>,
              ]}
            />
          </div>

          <div className="home-studio__bleed relative mr-[14%] mt-10 sm:mr-[30%] md:mt-14 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mr-0 lg:mt-0">
            {/* Holds a 4:5 minimum; the photograph then fills whatever height the row settles at. */}
            <div className="aspect-[4/5] lg:max-h-[min(88vh,56rem)]" />
            <div className="absolute inset-0">
              <RevealImage
                src={handsAtWork}
                alt="Hands sanding the cut edge of a green glass bottle laid on driftwood, with the sea behind in evening light"
                ratio={null}
                parallax={0.06}
                imgClassName="object-[62%_60%]"
              />
            </div>
          </div>

          <div className="mt-10 md:mt-14 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-0 lg:self-end lg:pt-16">
            <FadeUp as="p" className="max-w-[34rem] text-base text-ink-soft md:text-[1.0625rem]">
              Atika Gaur, the artist who founded O.U.A.T., came to glass the long way round: through design, through a
              move to Goa, and through a growing pile of bottles on her own kitchen counter. The first tumbler was cut
              with a borrowed tool and a lot of patience. It was uneven, a little too tall, and she still drinks from
              it.
            </FadeUp>

            <FadeUp as="figure" delay={90} className="mt-10 max-w-[34rem] border-t border-line pt-8 md:mt-12">
              {/* The negative indent hangs the opening quotation mark outside the measure. */}
              <blockquote className="-indent-[0.38em] font-display text-[clamp(1.5rem,2.1vw,1.875rem)] font-light italic leading-[1.28] text-ink">
                <p>
                  “I’m not interested in making things that look recycled. I want to make things people choose because
                  they are beautiful, and then discover the story.”
                </p>
              </blockquote>
              <figcaption className="home-label mt-6 text-ink-soft">Atika Gaur, founder</figcaption>
            </FadeUp>

            <FadeUp delay={180} className="mt-10 md:mt-12">
              <ArrowLink to="/story">Meet the studio</ArrowLink>
            </FadeUp>
          </div>
        </div>
      </Container>

      {/* The place: one wide photograph, edge to edge, captioned like a plate in a book. */}
      <figure className="mt-[clamp(4rem,9vw,8rem)]">
        <RevealImage
          src={goaSunset}
          alt="Friends dancing in the surf at sunset, backlit by the low sun"
          ratio="var(--home-studio-band)"
          parallax={0.08}
          imgClassName="object-[60%_50%] sm:object-[40%_50%]"
        />
        <Container
          as="figcaption"
          className="home-label flex items-baseline justify-between gap-6 pb-[clamp(3rem,7vw,6rem)] pt-4 text-ink-soft"
        >
          <span>{SITE.location}</span>
          <span>Est. 2022</span>
        </Container>
      </figure>
    </section>
  )
}
