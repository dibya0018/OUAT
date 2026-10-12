import { query } from '../config/db.js'

export async function logAdminActivity(message, actorUserId = null) {
  try {
    await query(
      'INSERT INTO admin_activity_log (actor_user_id, message) VALUES (:actor, :message)',
      { actor: actorUserId, message: String(message).slice(0, 512) },
    )
  } catch {
    /* table may not exist yet during migrate */
  }
}
