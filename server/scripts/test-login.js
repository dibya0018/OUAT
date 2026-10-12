import '../lib/loadEnv.js'
import { verifyPassword } from '../lib/password.js'
import { signAccessToken } from '../lib/jwt.js'
import mysql from 'mysql2/promise'

const email = (process.argv[2] || 'admin@ouat.com').toLowerCase()
const password = process.argv[3] || ''

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

try {
  const [rows] = await connection.query(
    `SELECT user_id, full_name, email, password_hash, role, is_active, created_at
     FROM users WHERE email = ? LIMIT 1`,
    [email],
  )
  const row = rows[0]
  if (!row) {
    console.error('No user for', email)
    process.exit(1)
  }
  const ok = await verifyPassword(password, row.password_hash)
  console.log('password ok:', ok)
  if (ok) {
    const token = signAccessToken(row)
    console.log('token length:', token.length)
  }
} finally {
  await connection.end()
}
