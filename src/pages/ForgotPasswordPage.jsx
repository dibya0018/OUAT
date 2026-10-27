import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import FormAlert from '../components/ui/FormAlert'
import { useForm } from '../hooks/useForm'
import { requestPasswordReset } from '../services/authService'

export default function ForgotPasswordPage() {
  const location = useLocation()
  const [sentMessage, setSentMessage] = useState('')

  const { values, errors, status, handleChange, handleSubmit } = useForm(
    { email: location.state?.email ?? '' },
    async (v) => {
      const result = await requestPasswordReset(v)
      if (result.ok) setSentMessage(result.message)
      return result
    },
  )

  return (
    <>
      <Seo title="Forgot password" description="Reset your O.U.A.T. account password." path="/forgot-password" noIndex />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container className="max-w-md">
          <p className="eyebrow">Account</p>
          <EditorialTitle as="h1" size="lg" accent="Forgot" rest="password" className="mt-6" />

          {sentMessage ? (
            <div className="mt-10 flex flex-col gap-8">
              <div role="status" className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm text-ink">
                {sentMessage}
              </div>
              <p className="text-sm text-ink-soft">
                Didn&apos;t get it? Check your spam folder, or{' '}
                <button
                  type="button"
                  className="link-underline text-primary"
                  onClick={() => setSentMessage('')}
                >
                  try again
                </button>
                .
              </p>
              <Button to="/login">Back to sign in</Button>
            </div>
          ) : (
            <>
              <p className="mt-4 text-sm text-ink-soft">
                Enter the email you use for your account and we&apos;ll send you a link to choose a new password.
              </p>
              <form className="mt-10 flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                <FormAlert message={errors.form} />

                <Button type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}

          <p className="mt-10 text-sm text-ink-soft">
            Remembered it?{' '}
            <Link to="/login" className="link-underline text-primary">
              Sign in
            </Link>
          </p>
        </Container>
      </section>
    </>
  )
}
