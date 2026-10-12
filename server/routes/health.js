import { Router } from 'express'
import pool, { pingDb } from '../config/db.js'
import { CATALOG_PROCEDURE_COUNT, countCatalogProcedures } from '../scripts/install-procedures.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const db = await pingDb()
    let catalogProcedures = 0
    if (db) {
      catalogProcedures = await countCatalogProcedures(pool)
    }
    res.json({
      ok: true,
      db,
      catalogProcedures,
      catalogProceduresReady: catalogProcedures >= CATALOG_PROCEDURE_COUNT,
    })
  } catch (err) {
    res.status(503).json({ ok: false, db: false, error: err.message })
  }
})

export default router
