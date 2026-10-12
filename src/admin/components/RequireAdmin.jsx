import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAdminUser } from '../../lib/adminAccess'

export default function RequireAdmin({ children }) {
  const { user, isAuthenticated, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="admin-root flex min-h-dvh items-center justify-center text-admin-muted">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdminUser(user)) {
    return (
      <div className="admin-root flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg text-admin-text">This area is for O.U.A.T. admins only.</p>
        <a href="/" className="admin-btn-gold">
          Back to store
        </a>
      </div>
    )
  }

  return children
}
