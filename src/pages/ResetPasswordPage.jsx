import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import FormAlert from '../components/ui/FormAlert'
import { useForm } from '../hooks/useForm'
import { resetPassword } from '../services/authService'

const INITIAL = { password: '', passwordConfirm: '' }
const REDIRECT_SECONDS = 4

function validate(values) {
  const errors = {}
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!values.passwordConfirm) errors.passwordConfirm = 'Please confirm your password.'
  else if (values.password !== values.passwordConfirm) errors.passwordConfirm = 'Passwords do not match.'
  return errors
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const [tokenInvalid, setTokenInvalid] = useState(!/^[a-f0-9]{64}$/.test(token))
  const [doneMessage, setDoneMessage] = useState('')

  const { values, errors, status, handleChange, handleSubmit } = useForm(INITIAL, async (v) => {
    const fieldErrors = validate(v)
    if (Object.keys(fieldErrors).length) return { ok: false, errors: fieldErrors }
    const result = await resetPassword({ ...v, token })
    if (result.ok) setDoneMessage(result.message)
    else if (result.tokenInvalid) setTokenInvalid(true)
    return result
  })

  useEffect(() => {
    if (!doneMessage) return undefined
    const t = setTimeout(() => navigate('/login', { replace: true }), REDIRECT_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [doneMessage, navigate])

  let content
  if (doneMessage) {
    content = (
      <div className="mt-10 flex flex-col gap-8">
        <div role="status" className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm text-ink">
          {doneMessage} Taking you to sign in…
        </div>
        <Button to="/login" replace>
          Sign in now
        </Button>
      </div>
    )
  } else if (tokenInvalid) {
    content = (
      <div className="mt-10 flex flex-col gap-8">
        <FormAlert message="This reset link is invalid or has expired. Links work once and last 60 minutes." />
        <Button to="/forgot-password">Request a new link</Button>
      </div>
    )
  } else {
    content = (
      <>
        <p className="mt-4 text-sm text-ink-soft">Choose a new password for your account.</p>
        <form className="mt-10 flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
          <FormField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            hint="At least 8 characters"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <FormField
            label="Confirm new password"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            value={values.passwordConfirm}
            onChange={handleChange}
            error={errors.passwordConfirm}
          />

          <FormAlert message={errors.form} />

          <Button type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
            {status === 'submitting' ? 'Saving…' : 'Set new password'}
          </Button>
        </form>
      </>
    )
  }

  return (
    <>
      <Seo title="Reset password" description="Choose a new password for your O.U.A.T. account." path="/reset-password" noIndex />
      {/* Keep the reset token out of Referer headers sent to other sites. */}
      <Helmet>
        <meta name="referrer" content="no-referrer" />
      </Helmet>

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container className="max-w-md">
          <p className="eyebrow">Account</p>
          <EditorialTitle as="h1" size="lg" accent="Reset" rest="password" className="mt-6" />
          {content}
          <p className="mt-10 text-sm text-ink-soft">
            <Link to="/login" className="link-underline text-primary">
              Back to sign in
            </Link>
          </p>
        </Container>
      </section>
    </>
  )
}
