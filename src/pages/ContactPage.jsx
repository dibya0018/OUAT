import { useCallback } from 'react'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Icon from '../components/ui/Icon'
import { useForm } from '../hooks/useForm'
import { submitContact } from '../services/formService'
import { trackEvent } from '../lib/analytics'
import { SITE } from '../lib/site'
import contactPhoto from '../components/images/gifting-4.webp'

const INITIAL = { name: '', email: '', subject: '', message: '' }

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

      <section className="section-white pb-20 pt-10 md:pb-28 md:pt-16">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-0">
            {/* Message form */}
            <div className="lg:pr-12">
              <p className="eyebrow">Send us a message</p>
              <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">
                Let’s Create Something Beautiful Together
              </h1>
              <p className="mt-4 max-w-md text-ink-soft">
                Have a question, collaboration idea, or just want to say hello? We’d love to hear from you.
              </p>

              {status === 'success' ? (
                <div role="status" className="mt-10 border-t border-line pt-8">
                  <p className="font-display text-3xl text-primary">Thank you, {values.name.split(' ')[0]}.</p>
                  <p className="mt-4 text-ink-soft">Your message has reached the studio. We’ll reply soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-7">
                  <FormField label="Your name" name="name" autoComplete="name" required value={values.name} onChange={handleChange} error={errors.name} />
                  <FormField label="Your email" name="email" type="email" autoComplete="email" required value={values.email} onChange={handleChange} error={errors.email} />
                  <FormField label="Subject" name="subject" required value={values.subject} onChange={handleChange} error={errors.subject} />
                  <FormField label="Your message (optional)" name="message" as="textarea" value={values.message} onChange={handleChange} error={errors.message} />
                  {status === 'error' && (
                    <p role="alert" className="text-sm text-primary">
                      Something went wrong. Please try again or email us.
                    </p>
                  )}
                  <div>
                    <Button type="submit" disabled={status === 'submitting'}>
                      {status === 'submitting' ? 'Sending…' : 'Submit'}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Photo, FAQ note and contact details */}
            <div className="lg:border-l lg:border-line lg:pl-12">
              <img
                src={contactPhoto}
                alt="O.U.A.T. gift box with upcycled green glassware on a wooden table"
                decoding="async"
                className="aspect-[5/3] w-full object-cover"
              />

              <p className="mt-8 font-sans text-xs font-medium uppercase tracking-eyebrow text-ink">Contact us</p>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <Icon name="mobile" size={30} strokeWidth={1} className="shrink-0 text-ink-soft" />
                  <div className="text-sm leading-relaxed">
                    <p>
                      <span className="font-medium text-ink">Phone:</span>{' '}
                      <a href={SITE.phoneHref} className="link-underline text-ink-soft">
                        {SITE.phone}
                      </a>
                    </p>
                    <p>
                      <span className="font-medium text-ink">Email:</span>{' '}
                      <a href={`mailto:${SITE.email}`} className="link-underline text-primary">
                        {SITE.email}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Icon name="chat" size={30} strokeWidth={1} className="shrink-0 text-ink-soft" />
                  <p className="text-sm font-medium leading-relaxed text-ink">
                    Support forum
                    <br />
                    for over 24h
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-line pt-6 text-sm">
                <p className="font-medium text-ink">Have questions or need assistance?</p>
                <a href={`mailto:${SITE.email}`} className="link-underline mt-1 inline-block font-medium text-primary">
                  Send us an email and we’ll get in touch shortly.
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
