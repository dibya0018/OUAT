import '../lib/loadEnv.js'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
})

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

/** Call a stored procedure; returns the first result set as an array of rows. */
export async function callProcedure(name, params = {}) {
  const keys = Object.keys(params)
  const placeholders = keys.map((k) => `:${k}`).join(', ')
  const sql = placeholders ? `CALL ${name}(${placeholders})` : `CALL ${name}()`
  const [results] = await pool.execute(sql, params)
  if (Array.isArray(results)) {
    const first = results[0]
    if (Array.isArray(first)) return first
  }
  return results
}

export async function pingDb() {
  const rows = await query('SELECT 1 AS ok')
  return rows[0]?.ok === 1
}

export default pool
