import { useRef, useState } from 'react'
import Container from '../ui/Container'
import Icon from '../ui/Icon'
import { subscribeNewsletter } from '../../services/formService'
import { FadeUp, RevealLines } from './kit'

const FALLBACK_ERROR = 'We could not sign you up just now. Please try again.'

/** Newsletter sign-up: a large quiet heading beside a single underlined email field. */
export default function HomeNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const submitting = status === 'submitting'

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setStatus('submitting')
    setError(null)

    let result
    try {
      result = await subscribeNewsletter({ email })
    } catch {
      result = { ok: false }
    }

    if (result.ok) {
      setStatus('success')
      setEmail('')
      return
    }
    setStatus('idle')
    setError(result.errors?.email || FALLBACK_ERROR)
    inputRef.current?.focus()
  }

  return (
    <section className="home-section bg-cream text-ink" aria-labelledby="home-newsletter-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-10 border-t border-line pt-10 md:grid-cols-12 md:items-end md:gap-x-6 md:pt-14 lg:gap-x-8">
          <RevealLines
            as="h2"
            id="home-newsletter-title"
            className="home-display-lg text-ink md:col-span-6"
            lines={[
              'Letters',
              <em key="goa" className="italic text-accent">
                from Goa
              </em>,
            ]}
          />

          <FadeUp className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8" delay={120}>
            <p className="home-lede max-w-[34rem] text-ink-soft">Occasional notes on new pieces and studio life.</p>

            {status !== 'success' && (
              <form onSubmit={onSubmit} noValidate className="mt-8 md:mt-10">
                <label htmlFor="home-newsletter-email" className="home-label block text-ink/70">
                  Email address
                </label>
                {/* The resting hairline is the field; a full-strength line draws over it on focus. */}
                <div className="relative mt-1 flex items-baseline gap-4 border-b border-ink/60 after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-500 after:ease-out-soft focus-within:after:scale-x-100">
                  <input
                    ref={inputRef}
                    id="home-newsletter-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? 'home-newsletter-error home-newsletter-note' : 'home-newsletter-note'}
                    className="min-w-0 flex-1 appearance-none rounded-none bg-transparent py-3 font-sans text-base text-ink placeholder:text-ink/45 focus:outline-none autofill:shadow-[inset_0_0_0_100px_var(--color-cream)]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex min-h-11 shrink-0 items-center gap-2.5 font-sans text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Sending…' : 'Subscribe'}
                    <Icon
                      name="arrowRight"
                      size={16}
                      className="transition-transform duration-500 ease-out-soft group-hover:translate-x-1 group-focus-visible:translate-x-1"
                    />
                  </button>
                </div>
                {error && (
                  <p id="home-newsletter-error" role="alert" className="mt-3 text-sm text-accent-hover">
                    {error}
                  </p>
                )}
              </form>
            )}

            {/* Always mounted, so the thank-you is announced when it arrives. */}
            <div role="status">
              {status === 'success' && (
                <p className="mt-8 font-display text-2xl font-light text-ink md:mt-10 md:text-3xl">
                  Thank you. We’ll write soon.
                </p>
              )}
            </div>

            <p id="home-newsletter-note" className="mt-4 text-xs text-ink-soft">
              No more than once a month. Unsubscribe any time.
            </p>
          </FadeUp>
        </div>
      </Container>
    </section>
  )
}
