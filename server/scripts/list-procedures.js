import 'dotenv/config'
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

try {
  const [rows] = await connection.query(
    `SELECT ROUTINE_NAME FROM information_schema.ROUTINES
     WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
     ORDER BY ROUTINE_NAME`,
    [process.env.DB_NAME],
  )
  console.info('host:', process.env.DB_HOST, 'db:', process.env.DB_NAME)
  console.info('procedure count:', rows.length)
  for (const r of rows) console.info(' -', r.ROUTINE_NAME)
} finally {
  await connection.end()
}
