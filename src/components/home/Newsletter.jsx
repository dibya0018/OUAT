import { useState } from 'react'
import Container from '../ui/Container'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'
import { subscribeNewsletter } from '../../services/formService'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [error, setError] = useState(null)

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
      setError(result.errors.email)
    }
  }

  return (
    <section className="goa-sand py-24 md:py-32" aria-labelledby="newsletter-title">
      <Container>
        <Reveal className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="eyebrow">Letters from Goa</p>
            <h2 id="newsletter-title" className="mt-4 text-3xl md:text-4xl">
              Occasional notes on new pieces and studio life.
            </h2>
            <p className="mt-4 max-w-md text-sm text-ink-soft">No more than once a month. Unsubscribe any time.</p>
          </div>

          <div className="md:col-span-5 md:col-start-8 md:self-end">
            {status === 'success' ? (
              <p role="status" className="font-display text-2xl text-primary">
                Thank you. We’ll write soon.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="newsletter-email" className="eyebrow">
                    Email
                  </label>
                  <div className="flex items-end gap-4 border-b border-primary">
                    <input
                      id="newsletter-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={error ? 'true' : undefined}
                      aria-describedby={error ? 'newsletter-error' : undefined}
                      className="w-full bg-transparent py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none"
                    />
                    <Button type="submit" variant="text" disabled={status === 'submitting'} className="pb-3">
                      {status === 'submitting' ? 'Sending…' : 'Subscribe'}
                    </Button>
                  </div>
                  {error && (
                    <p id="newsletter-error" role="alert" className="text-xs text-primary">
                      {error}
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
