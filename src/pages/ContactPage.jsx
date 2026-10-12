import { useCallback } from 'react'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Icon from '../components/ui/Icon'
import { useForm } from '../hooks/useForm'
import { submitContact } from '../services/formService'
import { trackEvent } from '../lib/analytics'
import { SITE } from '../lib/site'

const INITIAL = { name: '', email: '', message: '' }

export default function ContactPage() {
  const onSuccess = useCallback(() => trackEvent('Lead', { content_name: 'Contact form' }), [])
  const { values, errors, status, handleChange, handleSubmit } = useForm(INITIAL, submitContact, onSuccess)

  return (
    <>
      <Seo
        title="Contact"
        description="Questions about a piece, an order or a collaboration? Write to the O.U.A.T. studio in Goa."
        path="/contact"
      />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            {/* Intro + details */}
            <div className="md:col-span-5">
              <p className="eyebrow">Contact</p>
              <EditorialTitle as="h1" size="lg" accent="Say" rest="hello" className="mt-6" />
              <p className="mt-6 max-w-md text-ink-soft">
                For questions about a piece, an order, or an idea you’d like to talk through. We answer every message
                ourselves, usually within two working days.
              </p>

              <dl className="mt-12 flex flex-col gap-6 border-t border-line pt-8 text-sm">
                <div>
                  <dt className="eyebrow">Email</dt>
                  <dd className="mt-2">
                    <a href={`mailto:${SITE.email}`} className="link-underline inline-flex items-center gap-2 text-primary">
                      <Icon name="mail" size={16} /> {SITE.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Instagram</dt>
                  <dd className="mt-2">
                    <a
                      href={SITE.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-underline inline-flex items-center gap-2 text-primary"
                    >
                      <Icon name="instagram" size={16} /> @{SITE.instagramHandle}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Studio</dt>
                  <dd className="mt-2 text-ink-soft">{SITE.location}. Visits by appointment.</dd>
                </div>
              </dl>
            </div>

            {/* Form */}
            <div className="md:col-span-6 md:col-start-7">
              {status === 'success' ? (
                <div role="status" className="border-t border-line pt-8 md:border-0 md:pt-0">
                  <p className="font-display text-3xl text-primary">Thank you, {values.name.split(' ')[0]}.</p>
                  <p className="mt-4 text-ink-soft">Your message has reached the studio. We’ll reply soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                  <FormField label="Your name" name="name" autoComplete="name" required value={values.name} onChange={handleChange} error={errors.name} />
                  <FormField label="Email" name="email" type="email" autoComplete="email" required value={values.email} onChange={handleChange} error={errors.email} />
                  <FormField label="Message" name="message" as="textarea" required value={values.message} onChange={handleChange} error={errors.message} />
                  {status === 'error' && (
                    <p role="alert" className="text-sm text-primary">
                      Something went wrong. Please try again or email us.
                    </p>
                  )}
                  <div>
                    <Button type="submit" disabled={status === 'submitting'}>
                      {status === 'submitting' ? 'Sending…' : 'Send message'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
