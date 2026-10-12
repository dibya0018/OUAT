import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { installProcedures } from './install-procedures.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '../db/schema.sql')
const authPath = path.join(__dirname, '../db/auth.sql')
const productImagesPath = path.join(__dirname, '../db/product-images.sql')
const adminPath = path.join(__dirname, '../db/admin.sql')

const IGNORED_ALTER_CODES = new Set([
  'ER_DUP_FIELDNAME',
  'ER_BAD_FIELD_ERROR',
  'ER_CANT_DROP_FIELD',
  'ER_DROP_INDEX_FK',
  'ER_CANT_DROP_FIELD_OR_KEY',
  'ER_TABLE_EXISTS_ERROR',
  'ER_DUP_KEYNAME',
])

async function tryAlter(connection, sql) {
  try {
    await connection.query(sql)
  } catch (err) {
    if (!IGNORED_ALTER_CODES.has(err.code)) throw err
  }
}

async function migrateUsersTable(connection) {
  await tryAlter(
    connection,
    `ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT '' AFTER user_id`,
  )
  await tryAlter(connection, `ALTER TABLE users DROP COLUMN username`)
  await tryAlter(
    connection,
    `ALTER TABLE users ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'customer' AFTER api_key_hash`,
  )
  await tryAlter(
    connection,
    `ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role`,
  )
}

async function migrateProductsTable(connection) {
  await tryAlter(
    connection,
    `ALTER TABLE products ADD COLUMN available_quantity INT NOT NULL DEFAULT 0 AFTER price`,
  )
  await tryAlter(
    connection,
    `ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER available_quantity`,
  )
  await tryAlter(connection, `ALTER TABLE products ADD INDEX idx_products_active (is_active)`)

  const [cols] = await connection.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'images_json'`,
  )
  if (cols.length) {
    const [legacy] = await connection.query('SELECT id, images_json FROM products')
    for (const row of legacy) {
      let images = row.images_json
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images)
        } catch {
          images = []
        }
      }
      if (!Array.isArray(images)) continue
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (!img?.src) continue
        await connection.query(
          `INSERT INTO product_images (product_id, sort_order, image_src, alt_text, tone, is_active)
           SELECT ?, ?, ?, ?, ?, 1 FROM DUAL
           WHERE NOT EXISTS (
             SELECT 1 FROM product_images pi
             WHERE pi.product_id = ? AND pi.sort_order = ? AND pi.image_src = ?
           )`,
          [
            row.id,
            i,
            img.src,
            img.alt ?? '',
            img.tone ?? 'sand',
            row.id,
            i,
            img.src,
          ],
        )
      }
    }
    await tryAlter(connection, `ALTER TABLE products DROP COLUMN images_json`)
  }
}

async function main() {
  const sql =
    fs.readFileSync(schemaPath, 'utf8') +
    '\n' +
    fs.readFileSync(authPath, 'utf8') +
    '\n' +
    fs.readFileSync(productImagesPath, 'utf8') +
    '\n' +
    fs.readFileSync(adminPath, 'utf8')
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  })
  try {
    await connection.query(sql)
    await migrateUsersTable(connection)
    await migrateProductsTable(connection)
    await installProcedures(connection)
    console.info('Schema applied successfully.')
  } finally {
    await connection.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
