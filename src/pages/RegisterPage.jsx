import { Link, useLocation, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import FormAlert from '../components/ui/FormAlert'
import PostCheckoutAuthNotice from '../components/auth/PostCheckoutAuthNotice'
import { useForm } from '../hooks/useForm'
import { useAuth } from '../hooks/useAuth'

const INITIAL = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
}

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/account#orders'
  const postCheckout = Boolean(location.state?.postCheckout)
  const checkoutEmail = location.state?.email ?? ''

  const authState = { from, postCheckout, email: checkoutEmail }

  const goNext = () => navigate(from, { replace: true })

  const { values, errors, status, handleChange, handleSubmit } = useForm(
    { ...INITIAL, email: checkoutEmail },
    async (v) => register(v),
    goNext,
  )

  if (isAuthenticated) {
    goNext()
    return null
  }

  return (
    <>
      <Seo title="Create account" description="Register for an O.U.A.T. account." path="/register" />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container className="max-w-md">
          <p className="eyebrow">Account</p>
          <EditorialTitle as="h1" size="lg" accent="Create" rest="account" className="mt-6" />
          {postCheckout && <PostCheckoutAuthNotice variant="register" />}
          {!postCheckout && (
            <p className="mt-4 text-sm text-ink-soft">
              Register to save your details and track orders in one place.
            </p>
          )}

          <form className="mt-10 flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Full name"
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
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
            <FormField
              label="Password"
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
              label="Confirm password"
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
              {status === 'submitting' ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-10 text-sm text-ink-soft">
            Already have an account?{' '}
            <Link to="/login" state={authState} className="link-underline text-primary">
              Sign in
            </Link>
          </p>
        </Container>
      </section>
    </>
  )
}
