import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Container from '../components/ui/Container'
import EditorialTitle from '../components/ui/EditorialTitle'
import Button from '../components/ui/Button'
import RequireAuth from '../components/auth/RequireAuth'
import OrderTrackingTimeline from '../components/account/OrderTrackingTimeline'
import { useAuth } from '../hooks/useAuth'
import { useCustomerOrders } from '../hooks/useCustomerOrders'
import { isAdminUser } from '../lib/adminAccess'
function AccountContent() {
  const { user, logout } = useAuth()
  const { orders, loading, error, reload } = useCustomerOrders()
  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  return (
    <>
      <Seo title="Your account" description="Your O.U.A.T. account and orders." path="/account" />

      <section className="section-white pb-20 pt-8 md:pb-32 md:pt-12">
        <Container className="max-w-2xl">
          <p className="eyebrow">Account</p>
          <EditorialTitle as="h1" size="lg" accent="Hello," rest={firstName} className="mt-6" />
          <p className="mt-6 text-sm text-ink-soft">
            View your orders and tracking below, or continue browsing the shop.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {isAdminUser(user) && (
              <Link to="/admin">
                <Button type="button" variant="outline">
                  Admin dashboard
                </Button>
              </Link>
            )}
            <Link to="/shop">
              <Button type="button">Continue shopping</Button>
            </Link>
            <Button type="button" variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>

          <div id="orders" className="mt-16 border-t border-line pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Your orders</p>
                <h2 className="mt-2 font-display text-2xl md:text-3xl">Tracking &amp; details</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={reload} disabled={loading}>
                Refresh
              </Button>
            </div>

            {loading && orders.length === 0 && (
              <p className="mt-8 text-sm text-ink-soft" aria-busy="true">
                Loading orders…
              </p>
            )}
            {error && (
              <p className="mt-8 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            {!loading && !error && orders.length === 0 && (
              <div className="mt-8 space-y-3 text-sm text-ink-soft">
                <p>No orders linked to this account yet.</p>
                <p>
                  If you just checked out, wait a moment and tap Refresh. Orders appear when you sign in with the{' '}
                  <strong className="font-normal text-ink">same email</strong> you used at checkout
                  {user?.email ? (
                    <>
                      {' '}
                      (<span className="text-ink">{user.email}</span>).
                    </>
                  ) : (
                    '.'
                  )}
                </p>
                <Link to="/shop" className="link-underline inline-block text-primary">
                  Shop the collection
                </Link>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-6">
              {orders.map((order) => (
                <OrderTrackingTimeline key={order.id} order={order} />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  )
}
