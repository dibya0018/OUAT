/**
 * Create or update an admin user in the database (password stored as bcrypt hash only).
 *
 * Usage (do not put the password in .env):
 *   node server/scripts/seed-admin.js admin@ouat.com 'your-password'
 *   npm run db:seed-admin -- admin@ouat.com 'your-password'
 */
import '../lib/loadEnv.js'
import mysql from 'mysql2/promise'
import { generateApiKey, generateUserId, hashApiKey } from '../lib/ids.js'
import { hashPassword } from '../lib/password.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const email = (process.argv[2] || '').trim().toLowerCase()
const password = process.argv[3] || ''
const fullName = (process.argv[4] || 'O.U.A.T. Admin').trim()

if (!email || !EMAIL_RE.test(email)) {
  console.error('Usage: node server/scripts/seed-admin.js <email> <password> [full name]')
  process.exit(1)
}
if (!password || password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

try {
  const passwordHash = await hashPassword(password)
  const [existing] = await connection.query(
    'SELECT user_id FROM users WHERE email = ? LIMIT 1',
    [email],
  )

  if (existing.length) {
    await connection.query(
      `UPDATE users SET full_name = ?, password_hash = ?, role = 'admin', is_active = 1 WHERE email = ?`,
      [fullName, passwordHash, email],
    )
    console.info(`Updated admin in DB: ${email} (role=admin)`)
  } else {
    const userId = generateUserId()
    const apiKey = generateApiKey()
    await connection.query(
      `INSERT INTO users (user_id, full_name, email, password_hash, api_key_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'admin', 1)`,
      [userId, fullName, email, passwordHash, hashApiKey(apiKey)],
    )
    console.info(`Created admin in DB: ${email}`)
    console.info(`User ID: ${userId}`)
    console.info(`API key (save once): ${apiKey}`)
  }

  console.info('\nSign in at /login with that email and password, then open /admin.')
  console.info('Promote other admins from Admin → Team (role = Full Admin).')
} finally {
  await connection.end()
}
