/** Admin UI gate — must match server (users.role = admin from /auth/me or login). */

export function isAdminUser(user) {
  return user?.role === 'admin'
}
