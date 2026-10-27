import { Link, useNavigate, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import FormAlert from '../components/ui/FormAlert'
import PostCheckoutAuthNotice from '../components/auth/PostCheckoutAuthNotice'
import { useForm } from '../hooks/useForm'
import { useAuth } from '../hooks/useAuth'

const INITIAL = { login: '', password: '' }

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/account#orders'
  const ordersRedirect = String(from).includes('/account')
  const postCheckout = Boolean(location.state?.postCheckout)
  const checkoutEmail = location.state?.email ?? ''

  const authState = { from, postCheckout, email: checkoutEmail }

  const submitLogin = async (values) => login(values)

  const goNext = () => navigate(from, { replace: true })

  const { values, errors, status, handleChange, handleSubmit } = useForm(
    { ...INITIAL, login: checkoutEmail },
    submitLogin,
    goNext,
  )

  if (isAuthenticated) {
    goNext()
    return null
  }

  return (
    <>
      <Seo title="Sign in" description="Sign in to your O.U.A.T. account." path="/login" />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container className="max-w-md">
          <p className="eyebrow">Account</p>
          <EditorialTitle as="h1" size="lg" accent="Sign" rest="in" className="mt-6" />
          {postCheckout && <PostCheckoutAuthNotice variant="login" />}
          <p className="mt-4 text-sm text-ink-soft">
            {postCheckout || ordersRedirect
              ? 'Use the same email you used at checkout to view order status and tracking.'
              : 'Use your email and password.'}
          </p>

          <form className="mt-10 flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email"
              name="login"
              type="email"
              autoComplete="email"
              required
              value={values.login}
              onChange={handleChange}
              error={errors.login}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange}
              error={errors.password}
            />
            <Link
              to="/forgot-password"
              state={{ email: values.login }}
              className="link-underline -mt-5 self-end text-sm text-primary"
            >
              Forgot password?
            </Link>

            <FormAlert message={errors.form} />

            <Button type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
              {status === 'submitting' ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-10 text-sm text-ink-soft">
            New here?{' '}
            <Link to="/register" state={authState} className="link-underline text-primary">
              Create an account
            </Link>
          </p>
        </Container>
      </section>
    </>
  )
}
