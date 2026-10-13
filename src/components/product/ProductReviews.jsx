import { useCallback, useEffect, useState } from 'react'
import Container from '../ui/Container'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import { useForm } from '../../hooks/useForm'
import { getProductReviews, submitProductReview } from '../../services/productService'

const INITIAL = { name: '', email: '', rating: '5', body: '' }

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? '' : 's'}` }))

function Stars({ rating }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className="tracking-[0.15em] text-accent" role="img" aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}
      <span className="opacity-30">{'★'.repeat(5 - full)}</span>
    </span>
  )
}

/** Customer reviews for a product: approved ones are listed; new ones wait for admin approval. */
export default function ProductReviews({ productId, productName, onLoaded }) {
  const [data, setData] = useState({ count: 0, average: 0, reviews: [] })
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProductReviews(productId).then((res) => {
      if (cancelled) return
      setData(res)
      onLoaded?.(res)
    })
    return () => {
      cancelled = true
    }
  }, [productId, onLoaded])

  const submit = useCallback(
    async (values) => {
      const res = await submitProductReview(productId, { ...values, rating: Number(values.rating) })
      // No field errors to show means the request itself failed.
      if (!res.ok && !res.errors) throw new Error(res.error || 'Could not send review')
      return res
    },
    [productId],
  )
  const { values, errors, status, handleChange, handleSubmit } = useForm(INITIAL, submit)

  return (
    <section className="border-t border-line py-20 md:py-28" aria-labelledby="reviews-title">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Reviews</p>
            <h2 id="reviews-title" className="mt-4 text-3xl md:text-4xl">
              What people say
            </h2>
            {data.count > 0 ? (
              <p className="mt-4 text-sm text-ink-soft">
                <Stars rating={data.average} /> <span className="ml-2">{data.average} out of 5</span> · {data.count}{' '}
                review{data.count === 1 ? '' : 's'}
              </p>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">No reviews yet. Be the first to share yours.</p>
            )}
            {!formOpen && status !== 'success' && (
              <Button variant="outline" className="mt-8" onClick={() => setFormOpen(true)}>
                Write a review
              </Button>
            )}
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {status === 'success' ? (
              <p className="border border-line p-5 text-sm text-ink-soft" role="status">
                Thank you. Your review has been sent and will appear here once it is approved.
              </p>
            ) : (
              formOpen && (
                <form className="mb-12 flex flex-col gap-6 border border-line p-5 md:p-8" onSubmit={handleSubmit} noValidate>
                  <p className="text-sm text-ink-soft">Your review of {productName}</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      label="Name"
                      name="name"
                      autoComplete="name"
                      required
                      value={values.name}
                      onChange={handleChange}
                      error={errors.name}
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      hint="Not shown on the site."
                      value={values.email}
                      onChange={handleChange}
                      error={errors.email}
                    />
                  </div>
                  <FormField
                    label="Rating"
                    name="rating"
                    options={RATING_OPTIONS}
                    required
                    value={values.rating}
                    onChange={handleChange}
                    error={errors.rating}
                  />
                  <FormField
                    label="Review"
                    name="body"
                    as="textarea"
                    required
                    value={values.body}
                    onChange={handleChange}
                    error={errors.body}
                  />
                  {status === 'error' && (
                    <p className="text-sm text-primary" role="alert">
                      Could not send your review. Please try again.
                    </p>
                  )}
                  <div>
                    <Button type="submit" disabled={status === 'submitting'}>
                      {status === 'submitting' ? 'Sending…' : 'Submit review'}
                    </Button>
                  </div>
                </form>
              )
            )}

            {data.reviews.length > 0 && (
              <ul className="divide-y divide-line border-y border-line">
                {data.reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm text-ink">
                        <Stars rating={r.rating} /> <span className="ml-2">{r.authorName}</span>
                      </p>
                      {r.createdAt && (
                        <p className="text-xs text-ink-soft">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    {r.body && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft">{r.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
