import './lib/loadEnv.js'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureCatalogProcedures } from './scripts/install-procedures.js'
import cors from 'cors'
import healthRouter from './routes/health.js'
import catalogRouter from './routes/catalog.js'
import formsRouter from './routes/forms.js'
import authRouter from './routes/auth.js'
import accountRouter from './routes/account.js'
import adminRouter from './routes/admin.js'
import paymentsRouter from './routes/payments.js'
import analyticsRouter from './routes/analytics.js'
import adminProductMediaRouter from './routes/adminProductMedia.js'
import { optionalAuth } from './middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '../dist')
const clientIndex = path.join(distDir, 'index.html')
const serveClient = fs.existsSync(clientIndex)
const app = express()
const port = Number(process.env.PORT || 3001)

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: corsOrigin.split(',').map((s) => s.trim()) }))
app.use(optionalAuth)
app.use(express.json({ limit: '256kb' }))
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

app.use('/api/health', healthRouter)
app.use('/api', catalogRouter)
app.use('/api', formsRouter)
app.use('/api', authRouter)
app.use('/api', accountRouter)
app.use('/api', paymentsRouter)
app.use('/api', analyticsRouter)
app.use('/api', adminRouter)
app.use('/api', adminProductMediaRouter)

if (serveClient) {
  app.use(express.static(distDir, { index: false }))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(clientIndex, (err) => (err ? next(err) : undefined))
  })
} else {
  app.get('/', (_req, res) => {
    res.json({ name: 'O.U.A.T. API', version: '1.0.0' })
  })
}

app.use((err, _req, res, _next) => {
  console.error('[api]', err.code || err.name, err.message)

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      ok: false,
      error:
        'Database connection failed. DB_HOST must be the MySQL hostname from hPanel → Remote MySQL (e.g. srv1234.hstgr.io), not localhost. Whitelist your IP there, set DB_HOST in .env, then run npm run db:migrate.',
    })
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ ok: false, error: 'Database access denied. Check DB_USER, DB_PASSWORD, and DB_NAME in .env.' })
  }
  if (err.code === 'ER_SP_DOES_NOT_EXIST') {
    return res.status(503).json({
      ok: false,
      error:
        'Catalogue stored procedures are missing. Run npm run db:procedures (or npm run db:migrate), restart the API, and confirm DB_HOST in .env matches the database where procedures were installed.',
    })
  }
  if (err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(503).json({ ok: false, error: 'Database not ready. Run npm run db:migrate on a connected database.' })
  }
  if (err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(503).json({ ok: false, error: 'Users table schema is out of date. Run npm run db:migrate again.' })
  }

  res.status(500).json({ ok: false, error: 'Internal server error' })
})

function listen() {
  const server = app.listen(port, () => {
    const mode = serveClient ? 'web+api' : 'api'
    console.info(
      `O.U.A.T. ${mode} listening on http://localhost:${port} (DB ${process.env.DB_HOST}/${process.env.DB_NAME})`,
    )
  })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[api] Port ${port} is already in use. Stop the other API process (or change PORT in .env), then restart.`,
      )
    } else {
      console.error('[api] Server error:', err.message)
    }
    process.exit(1)
  })
  return server
}

function start() {
  listen()

  // Do not block HTTP listen on remote DB / procedure install (dev watch restarts stay fast).
  ensureCatalogProcedures()
    .then((sp) => {
      if (sp.installed) {
        console.info(`[api] Installed ${sp.count} catalogue stored procedures on ${sp.database} (${sp.host}).`)
      }
    })
    .catch((err) => {
      console.error('[api] Could not verify/install stored procedures:', err.message)
      console.error('[api] Fix DB_* in .env, then run: npm run db:procedures')
    })
}

start()
