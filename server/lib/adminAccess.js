/** Admin access is determined only by users.role in the database. */

export function isAdminUser(user) {
  return user?.role === 'admin'
}
