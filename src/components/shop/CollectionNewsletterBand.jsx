import { useState } from 'react'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { PalmLineArt } from '../motifs/PalmMotifs'
import { subscribeNewsletter } from '../../services/formService'

export default function CollectionNewsletterBand({ id, eyebrow, title, titleLine2, body, variant = 'light' }) {
  const dark = variant === 'dark'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const inputId = `${id}-email`

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    const result = await subscribeNewsletter({ email })
    if (result.ok) {
      setStatus('success')
      setEmail('')
    } else {
      setStatus('idle')
      setError(result.errors?.email ?? 'Something went wrong.')
    }
  }

  return (
    <section
      className={`relative overflow-hidden py-16 md:py-20 ${dark ? 'bg-[#1f1b17] text-cream' : 'bg-cream'}`}
      aria-labelledby={id}
    >
      <PalmLineArt
        className={`pointer-events-none absolute -right-6 bottom-0 hidden md:block ${dark ? 'opacity-30' : 'opacity-80'}`}
        size={320}
      />
      <PalmLineArt className={`pointer-events-none absolute -right-20 -top-8 md:hidden ${dark ? 'opacity-20' : 'opacity-40'}`} size={200} />
      <Container className="relative max-w-xl">
        <p className={`eyebrow ${dark ? 'text-accent' : 'text-accent'}`}>{eyebrow}</p>
        <h2 id={id} className={`mt-3 font-display text-3xl leading-snug md:text-4xl ${dark ? 'text-cream' : 'text-ink'}`}>
          {title}
          {titleLine2 && <span className="block">{titleLine2}</span>}
        </h2>
        {body && <p className={`mt-4 text-base ${dark ? 'text-cream/80' : 'text-ink-soft'}`}>{body}</p>}
        {status === 'success' ? (
          <p className={`mt-6 font-display text-xl ${dark ? 'text-cream' : 'text-primary'}`} role="status">
            Thank you. We will write when something new arrives.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <label className="sr-only" htmlFor={inputId}>
              Email
            </label>
            <input
              id={inputId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className={`h-12 flex-1 border px-4 text-sm focus:outline-none ${
                dark
                  ? 'border-cream/25 bg-white/10 text-cream placeholder:text-cream/50 focus:border-accent'
                  : 'border-line bg-white/80 text-ink placeholder:text-ink-soft focus:border-primary'
              }`}
            />
            <Button
              type="submit"
              disabled={status === 'submitting'}
              className="h-12 shrink-0 border-accent bg-accent px-8 text-cream hover:border-accent-hover hover:bg-accent-hover sm:w-auto"
            >
              Subscribe
            </Button>
          </form>
        )}
        {error && (
          <p className="mt-2 text-sm text-accent" role="alert">
            {error}
          </p>
        )}
      </Container>
    </section>
  )
}
