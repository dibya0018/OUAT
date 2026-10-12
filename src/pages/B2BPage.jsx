import { useCallback } from 'react'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import SectionHeading from '../components/ui/SectionHeading'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import { useForm } from '../hooks/useForm'
import { submitEnquiry } from '../services/formService'
import { trackEvent } from '../lib/analytics'
import { SITE } from '../lib/site'

const AUDIENCES = [
  {
    title: 'Hospitality',
    text: 'Glassware and candles for hotels, restaurants and bars. Sets that hold up to service and carry a story your guests will ask about.',
    image: { alt: 'Tumblers set on a restaurant table', tone: 'sand' },
  },
  {
    title: 'Corporate gifting',
    text: 'Gift boxes for clients and teams, from twenty to several thousand units, with optional engraving and a card in your words.',
    image: { alt: 'Stack of gift boxes with candles inside', tone: 'olive' },
  },
  {
    title: 'Interior designers',
    text: 'Custom colours, sizes and finishes for residential and commercial projects. We work from your drawings or ours.',
    image: { alt: 'Vases styled on a console in a designed interior', tone: 'sand' },
  },
  {
    title: 'Lifestyle stores',
    text: 'Wholesale pricing and a considered range for retailers who care about where things come from.',
    image: { alt: 'Shelf display of O.U.A.T. pieces in a concept store', tone: 'olive' },
  },
]

const CUSTOMISATION = [
  { title: 'Engraving', text: 'Logos, monograms or a single line, sandblasted into the glass.' },
  { title: 'Colour selection', text: 'Green, amber, clear or cobalt, matched to your palette where supply allows.' },
  { title: 'Sizes & sets', text: 'Tumbler heights, carafe volumes and set configurations to suit your table.' },
  { title: 'Scent', text: 'Candles poured in one of our scents or developed with you.' },
  { title: 'Packaging', text: 'Recycled card boxes, cotton pouches and printed cards in your words.' },
  { title: 'Volume', text: 'Minimum order of 20 pieces. Lead time scales with quantity.' },
]

const PROCESS = [
  { step: '01', title: 'Enquiry', text: 'Tell us what you have in mind using the form below.' },
  { step: '02', title: 'Sample', text: 'We send a sample or two so you can hold the piece.' },
  { step: '03', title: 'Quotation', text: 'A clear quote with unit pricing, lead time and shipping.' },
  { step: '04', title: 'Approval', text: 'You sign off on the sample, finish and quantities.' },
  { step: '05', title: 'Advance payment', text: 'A 50% advance confirms the order and books studio time.' },
  { step: '06', title: 'Production', text: 'Pieces are cut, finished and quality-checked in Goa.' },
  { step: '07', title: 'Dispatch', text: 'Packed in recycled card and shipped with tracking.' },
]

const BUSINESS_TYPES = [
  { value: 'hospitality', label: 'Hospitality (hotel, restaurant, bar)' },
  { value: 'corporate', label: 'Corporate gifting' },
  { value: 'interior', label: 'Interior design' },
  { value: 'retail', label: 'Lifestyle store / retail' },
  { value: 'other', label: 'Other' },
]

const QUANTITIES = [
  { value: '20-50', label: '20–50 pieces' },
  { value: '50-200', label: '50–200 pieces' },
  { value: '200-1000', label: '200–1,000 pieces' },
  { value: '1000+', label: '1,000+ pieces' },
]

const PRODUCT_INTEREST = [
  { value: 'glassware', label: 'Glassware' },
  { value: 'candles', label: 'Candles' },
  { value: 'kitchen-storage', label: 'Kitchen & Storage' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'mixed', label: 'Mixed / gift boxes' },
  { value: 'custom', label: 'Something custom' },
]

const INITIAL = {
  name: '',
  email: '',
  company: '',
  businessType: '',
  quantity: '',
  productInterest: '',
  message: '',
}

export default function B2BPage() {
  const onSuccess = useCallback((values) => {
    trackEvent('Lead', { content_name: 'B2B enquiry', content_category: values.businessType })
  }, [])
  const { values, errors, status, handleChange, handleSubmit } = useForm(INITIAL, submitEnquiry, onSuccess)

  return (
    <>
      <Seo
        title="Gifting & B2B"
        description="Bespoke reclaimed-glass sets, engraved pieces and gift boxes for hotels, restaurants, corporate gifting, interior designers and lifestyle stores. Made in Goa."
        path="/gifting-b2b"
      />

      {/* Intro */}
      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow">Gifting & B2B</p>
              <h1 className="mt-6 text-4xl md:text-6xl">Glassware with a story, at the scale you need.</h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="text-ink-soft">
                We work with hotels, companies, designers and stores on pieces that carry their name and ours. Every order
                is made by hand in Goa.
              </p>
              <Button href="#enquiry" variant="text" className="mt-6">
                Go to the enquiry form
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Audiences */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="audiences-title">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Who we work with" title="Four kinds of partner" id="audiences-title" />
          </Reveal>
          <ul className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <Reveal as="li" key={a.title} delay={i * 80}>
                <div className="zoom-media">
                  <ImagePlaceholder ratio="product" alt={a.image.alt} tone={a.image.tone} label={a.title} />
                </div>
                <h3 className="mt-6 font-display text-2xl">{a.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{a.text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Customisation */}
      <section className="section-cream py-24 md:py-32" aria-labelledby="custom-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <SectionHeading
                eyebrow="Customisation"
                title="Make it yours"
                lede="Most of what we make can be adjusted. Here is where to start."
                id="custom-title"
              />
            </Reveal>
            <Reveal delay={100} className="md:col-span-7 md:col-start-6">
              <dl className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
                {CUSTOMISATION.map((c) => (
                  <div key={c.title} className="border-t border-line pt-4">
                    <dt className="font-display text-xl text-primary">{c.title}</dt>
                    <dd className="mt-2 text-sm text-ink-soft">{c.text}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-24 md:py-32" aria-labelledby="b2b-process-title">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="How it works" title="From enquiry to dispatch" id="b2b-process-title" />
          </Reveal>
          <ol className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal as="li" key={p.step} delay={i * 60} className="border-t border-line pt-4">
                <span className="font-sans text-xs tracking-eyebrow text-ink-soft">{p.step}</span>
                <h3 className="mt-3 font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" className="border-t border-line py-24 md:py-32 scroll-mt-24" aria-labelledby="enquiry-title">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <SectionHeading
                eyebrow="Enquiry"
                title="Tell us about your project"
                lede="We reply within two working days. Prefer email? Write to us directly."
                id="enquiry-title"
              />
              <a href={`mailto:${SITE.email}`} className="link-underline mt-6 inline-block text-sm text-primary">
                {SITE.email}
              </a>
            </div>

            <div className="md:col-span-7 md:col-start-6">
              {status === 'success' ? (
                <div role="status" className="border-t border-line pt-8">
                  <p className="font-display text-3xl text-primary">Thank you, {values.name.split(' ')[0]}.</p>
                  <p className="mt-4 text-ink-soft">
                    Your enquiry has reached the studio. We’ll be in touch within two working days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <FormField label="Your name" name="name" autoComplete="name" required value={values.name} onChange={handleChange} error={errors.name} />
                    <FormField label="Email" name="email" type="email" autoComplete="email" required value={values.email} onChange={handleChange} error={errors.email} />
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <FormField label="Company" name="company" autoComplete="organization" required value={values.company} onChange={handleChange} error={errors.company} />
                    <FormField label="Business type" name="businessType" options={BUSINESS_TYPES} required value={values.businessType} onChange={handleChange} error={errors.businessType} />
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <FormField label="Quantity" name="quantity" options={QUANTITIES} required value={values.quantity} onChange={handleChange} error={errors.quantity} />
                    <FormField label="Product interest" name="productInterest" options={PRODUCT_INTEREST} required value={values.productInterest} onChange={handleChange} error={errors.productInterest} />
                  </div>
                  <FormField
                    label="Message"
                    name="message"
                    as="textarea"
                    value={values.message}
                    onChange={handleChange}
                    error={errors.message}
                    hint="Timelines, colours, engraving, anything that helps us picture it."
                  />
                  {status === 'error' && (
                    <p role="alert" className="text-sm text-primary">
                      Something went wrong. Please try again or email us.
                    </p>
                  )}
                  <div>
                    <Button type="submit" disabled={status === 'submitting'}>
                      {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
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
