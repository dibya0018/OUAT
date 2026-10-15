import { useCallback } from 'react'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Icon from '../components/ui/Icon'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import { useForm } from '../hooks/useForm'
import { submitEnquiry } from '../services/formService'
import { trackEvent } from '../lib/analytics'

const OCCASIONS = [
  'Employee appreciation',
  'Client & partner gifting',
  'Festive & corporate occasions',
  'Sustainable brand promotions',
]

const INITIAL = { name: '', email: '', subject: '', message: '' }

export default function B2BPage() {
  const onSuccess = useCallback(() => {
    trackEvent('Lead', { content_name: 'Corporate gifting enquiry' })
  }, [])
  const { values, errors, status, handleChange, handleSubmit } = useForm(INITIAL, submitEnquiry, onSuccess)

  return (
    <>
      <Seo
        title="Gifting & B2B"
        description="Sustainable corporate gifting: upcycled glass gift boxes for employee appreciation, client and partner gifting, festive occasions and brand promotions. Made in Goa."
        path="/gifting-b2b"
      />

      <section className="section-white pb-20 pt-10 md:pb-28 md:pt-16">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
            {/* About corporate gifting */}
            <div className="lg:col-span-6 lg:pt-4">
              <p className="eyebrow">Gifting & B2B</p>
              <EditorialTitle as="h1" size="lg" accent="Sustainable" rest="Gifting" className="mt-5" />

              <div className="mt-8 flex flex-col gap-5 text-ink-soft">
                <p>
                  Celebrate your employees and partners with our exclusive{' '}
                  <strong className="font-medium text-ink">upcycled gift box creations</strong>. Elevate your corporate
                  gifting experience with thoughtfully designed, eco-conscious solutions tailored to your unique needs.
                </p>
                <p>
                  At <strong className="font-medium text-ink">O.U.A.T.</strong>, we specialise in crafting memorable and
                  sustainable gift boxes that not only express appreciation but also reduce environmental impact. From
                  reclaimed materials to eco-friendly packaging, every detail is carefully curated to reflect your brand
                  values.
                </p>
              </div>

              <p className="mt-10 font-sans text-xs uppercase tracking-eyebrow text-ink">
                Our bespoke gifting solutions are perfect for
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {OCCASIONS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-ink">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon name="check" size={14} strokeWidth={2} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-10 border-l-2 border-primary pl-5 font-display text-xl leading-snug text-primary md:text-2xl">
                Make a lasting impression while contributing to a greener future.
              </p>
            </div>

            {/* Get in touch */}
            <div id="enquiry" className="scroll-mt-24 bg-cream p-8 sm:p-10 lg:col-span-6 lg:p-12">
              <h2 className="font-display text-2xl text-ink md:text-3xl">Get in Touch</h2>

              {status === 'success' ? (
                <div role="status" className="mt-6">
                  <p className="font-display text-3xl text-primary">Thank you, {values.name.split(' ')[0]}.</p>
                  <p className="mt-4 text-ink-soft">
                    Your enquiry has reached the studio. We’ll be in touch within two working days.
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Looking for customised gifting solutions? Share your requirements with us, and we’ll create the
                    perfect upcycled gift box for your brand.
                  </p>
                  <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-7">
                    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                      <FormField label="Your name" name="name" autoComplete="name" required value={values.name} onChange={handleChange} error={errors.name} />
                      <FormField label="Your email" name="email" type="email" autoComplete="email" required value={values.email} onChange={handleChange} error={errors.email} />
                    </div>
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
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
