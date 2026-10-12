import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import RequireAdmin from './components/RequireAdmin'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminVisitorsPage = lazy(() => import('./pages/AdminVisitorsPage'))
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'))
const AdminProductEditorPage = lazy(() => import('./pages/AdminProductEditorPage'))
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'))
const AdminCouponsPage = lazy(() => import('./pages/AdminCouponsPage'))
const AdminReviewsPage = lazy(() => import('./pages/AdminReviewsPage'))
const AdminTeamPage = lazy(() => import('./pages/AdminTeamPage'))
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'))

export default function AdminRoutes() {
  return (
    <RequireAdmin>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="visitors" element={<AdminVisitorsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/:productId" element={<AdminProductEditorPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="team" element={<AdminTeamPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </RequireAdmin>
  )
}
