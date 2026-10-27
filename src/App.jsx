import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import { getCollectionPath } from './lib/collections'

/*
 * Route-level code splitting: every page except Home is lazy-loaded so the
 * initial bundle stays small. Layout renders a <Suspense> boundary.
 */
const ShopPage = lazy(() => import('./pages/ShopPage'))
const CollectionPage = lazy(() => import('./pages/CollectionPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const StoryPage = lazy(() => import('./pages/StoryPage'))
const ImpactPage = lazy(() => import('./pages/ImpactPage'))
const B2BPage = lazy(() => import('./pages/B2BPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const PolicyPage = lazy(() => import('./pages/policies/PolicyPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const PassportPage = lazy(() => import('./pages/PassportPage'))
const AdminRoutes = lazy(() => import('./admin/AdminRoutes'))

/** Old `/shop/:slug` URLs → dedicated category pages. */
function CollectionRedirect() {
  const { collectionSlug } = useParams()
  return <Navigate to={getCollectionPath(collectionSlug)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense
            fallback={
              <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-zinc-400">
                Loading admin…
              </div>
            }
          >
            <AdminRoutes />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:collectionSlug" element={<CollectionRedirect />} />
        <Route path="glassware" element={<CollectionPage />} />
        <Route path="candles" element={<CollectionPage />} />
        <Route path="kitchen-storage" element={<CollectionPage />} />
        <Route path="jewellery" element={<CollectionPage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="story" element={<StoryPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="gifting-b2b" element={<B2BPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="policies/:policySlug" element={<PolicyPage />} />
        <Route path="passport/:passportId" element={<PassportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
