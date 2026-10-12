import mysql from 'mysql2/promise'
import '../lib/loadEnv.js'
import { installProcedures } from './install-procedures.js'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
})

try {
  await installProcedures(connection)
  console.info('Database:', process.env.DB_HOST, process.env.DB_NAME)
} finally {
  await connection.end()
}
