/** Creates / replaces catalogue stored procedures (MariaDB / MySQL). */

import mysql from 'mysql2/promise'
import '../lib/loadEnv.js'

const PROCEDURES = [
  {
    name: 'sp_collections_list',
    sql: `
CREATE PROCEDURE sp_collections_list()
BEGIN
  SELECT * FROM collections ORDER BY sort_order ASC, name ASC;
END`,
  },
  {
    name: 'sp_collection_by_slug',
    sql: `
CREATE PROCEDURE sp_collection_by_slug(IN p_slug VARCHAR(64))
BEGIN
  SELECT * FROM collections WHERE slug = p_slug LIMIT 1;
END`,
  },
  {
    name: 'sp_products_list',
    sql: `
CREATE PROCEDURE sp_products_list(
  IN p_collection VARCHAR(64),
  IN p_featured_only TINYINT,
  IN p_search VARCHAR(255),
  IN p_include_inactive TINYINT,
  IN p_id_list TEXT
)
BEGIN
  SELECT p.*
  FROM products p
  WHERE (p_include_inactive = 1 OR p.is_active = 1)
    AND (p_collection IS NULL OR p_collection = '' OR p.collection_slug = p_collection)
    AND (p_featured_only = 0 OR p.featured = 1)
    AND (
      p_search IS NULL OR p_search = ''
      OR p.name LIKE CONCAT('%', p_search, '%')
      OR p.short_story LIKE CONCAT('%', p_search, '%')
      OR p.description LIKE CONCAT('%', p_search, '%')
    )
    AND (p_id_list IS NULL OR p_id_list = '' OR FIND_IN_SET(p.id, p_id_list) > 0);
END`,
  },
  {
    name: 'sp_product_by_slug',
    sql: `
CREATE PROCEDURE sp_product_by_slug(IN p_slug VARCHAR(128))
BEGIN
  SELECT * FROM products WHERE slug = p_slug LIMIT 1;
END`,
  },
  {
    name: 'sp_product_by_id',
    sql: `
CREATE PROCEDURE sp_product_by_id(IN p_id VARCHAR(64))
BEGIN
  SELECT * FROM products WHERE id = p_id LIMIT 1;
END`,
  },
  {
    name: 'sp_product_images_by_product_ids',
    sql: `
CREATE PROCEDURE sp_product_images_by_product_ids(IN p_id_list TEXT)
BEGIN
  SELECT product_id, sort_order, image_src, alt_text, tone
  FROM product_images
  WHERE is_active = 1
    AND (p_id_list IS NULL OR p_id_list = '' OR FIND_IN_SET(product_id, p_id_list) > 0)
  ORDER BY product_id ASC, sort_order ASC, id ASC;
END`,
  },
  {
    name: 'sp_product_images_delete_for_product',
    sql: `
CREATE PROCEDURE sp_product_images_delete_for_product(IN p_product_id VARCHAR(64))
BEGIN
  DELETE FROM product_images WHERE product_id = p_product_id;
END`,
  },
  {
    name: 'sp_product_image_insert',
    sql: `
CREATE PROCEDURE sp_product_image_insert(
  IN p_product_id VARCHAR(64),
  IN p_sort_order INT,
  IN p_image_src LONGTEXT,
  IN p_alt_text VARCHAR(512),
  IN p_tone VARCHAR(16)
)
BEGIN
  INSERT INTO product_images (product_id, sort_order, image_src, alt_text, tone, is_active)
  VALUES (p_product_id, p_sort_order, p_image_src, p_alt_text, p_tone, 1);
END`,
  },
  {
    name: 'sp_collection_upsert',
    sql: `
CREATE PROCEDURE sp_collection_upsert(
  IN p_id VARCHAR(64),
  IN p_slug VARCHAR(64),
  IN p_name VARCHAR(128),
  IN p_tagline VARCHAR(255),
  IN p_description TEXT,
  IN p_hero_title_accent VARCHAR(255),
  IN p_hero_title_rest VARCHAR(255),
  IN p_audience_line TEXT,
  IN p_image_json JSON,
  IN p_sort_order INT
)
BEGIN
  INSERT INTO collections (
    id, slug, name, tagline, description,
    hero_title_accent, hero_title_rest, audience_line, image_json, sort_order
  ) VALUES (
    p_id, p_slug, p_name, p_tagline, p_description,
    p_hero_title_accent, p_hero_title_rest, p_audience_line, p_image_json, p_sort_order
  )
  ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    tagline = VALUES(tagline),
    description = VALUES(description),
    hero_title_accent = VALUES(hero_title_accent),
    hero_title_rest = VALUES(hero_title_rest),
    audience_line = VALUES(audience_line),
    image_json = VALUES(image_json),
    sort_order = VALUES(sort_order);
END`,
  },
  {
    name: 'sp_product_upsert',
    sql: `
CREATE PROCEDURE sp_product_upsert(
  IN p_id VARCHAR(64),
  IN p_slug VARCHAR(128),
  IN p_collection_slug VARCHAR(64),
  IN p_name VARCHAR(255),
  IN p_price INT,
  IN p_available_quantity INT,
  IN p_is_active TINYINT,
  IN p_is_new TINYINT,
  IN p_featured TINYINT,
  IN p_created_at DATE,
  IN p_origin VARCHAR(128),
  IN p_colour VARCHAR(128),
  IN p_short_story TEXT,
  IN p_description TEXT,
  IN p_details_json JSON
)
BEGIN
  INSERT INTO products (
    id, slug, collection_slug, name, price, available_quantity, is_active,
    is_new, featured, created_at, origin, colour, short_story, description, details_json
  ) VALUES (
    p_id, p_slug, p_collection_slug, p_name, p_price, p_available_quantity, p_is_active,
    p_is_new, p_featured, p_created_at, p_origin, p_colour, p_short_story, p_description, p_details_json
  )
  ON DUPLICATE KEY UPDATE
    slug = VALUES(slug),
    collection_slug = VALUES(collection_slug),
    name = VALUES(name),
    price = VALUES(price),
    available_quantity = VALUES(available_quantity),
    is_active = VALUES(is_active),
    is_new = VALUES(is_new),
    featured = VALUES(featured),
    created_at = VALUES(created_at),
    origin = VALUES(origin),
    colour = VALUES(colour),
    short_story = VALUES(short_story),
    description = VALUES(description),
    details_json = VALUES(details_json);
END`,
  },
  {
    name: 'sp_catalog_counts',
    sql: `
CREATE PROCEDURE sp_catalog_counts()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM products) AS product_count,
    (SELECT COUNT(*) FROM product_images) AS image_count;
END`,
  },
]

export const CATALOG_PROCEDURE_COUNT = PROCEDURES.length

function dbConnectionOptions() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  }
}

export async function countCatalogProcedures(connection) {
  const names = PROCEDURES.map((p) => p.name)
  const placeholders = names.map(() => '?').join(', ')
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS n FROM information_schema.ROUTINES
     WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'PROCEDURE'
       AND ROUTINE_NAME IN (${placeholders})`,
    names,
  )
  return Number(rows[0]?.n ?? 0)
}

export async function installProcedures(connection) {
  for (const proc of PROCEDURES) {
    await connection.query(`DROP PROCEDURE IF EXISTS ${proc.name}`)
    await connection.query(proc.sql)
  }
  console.info(`Installed ${PROCEDURES.length} stored procedures.`)
}

/** Install catalogue SPs when missing (same DB as API). */
export async function ensureCatalogProcedures() {
  const connection = await mysql.createConnection(dbConnectionOptions())
  try {
    const before = await countCatalogProcedures(connection)
    if (before >= PROCEDURES.length) {
      return { ok: true, installed: false, count: before, host: process.env.DB_HOST, database: process.env.DB_NAME }
    }
    await installProcedures(connection)
    const after = await countCatalogProcedures(connection)
    return { ok: true, installed: true, count: after, host: process.env.DB_HOST, database: process.env.DB_NAME }
  } finally {
    await connection.end()
  }
}
