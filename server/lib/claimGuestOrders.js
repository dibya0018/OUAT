import pool from '../config/db.js'

/** Attach guest checkout orders (same email, no user_id) to the signed-in account. */
export async function claimGuestOrdersForUser(userId, email) {
  const normalized = String(email ?? '').trim().toLowerCase()
  if (!userId || !normalized) return 0
  const [result] = await pool.execute(
    `UPDATE orders SET user_id = :uid
     WHERE user_id IS NULL AND LOWER(customer_email) = :email`,
    { uid: userId, email: normalized },
  )
  return result.affectedRows ?? 0
}
