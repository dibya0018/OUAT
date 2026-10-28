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
import courierWebhookRouter from './routes/courierWebhook.js'
import passportRouter from './routes/passport.js'
import instagramRouter from './routes/instagram.js'
import { optionalAuth } from './middleware/auth.js'
import { retryInterruptedOrderEmails } from './lib/orderEmails.js'
import { securityHeaders, trustProxySetting } from './lib/securityHeaders.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '../dist')
const clientIndex = path.join(distDir, 'index.html')
const serveClient = fs.existsSync(clientIndex)
const app = express()
app.disable('x-powered-by')
app.set('trust proxy', trustProxySetting())
app.use(securityHeaders)
const port = Number(process.env.PORT || 3001)

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: corsOrigin.split(',').map((s) => s.trim()) }))
// Before optionalAuth: the courier's Bearer token is not a login JWT.
app.use('/api', courierWebhookRouter)
app.use(optionalAuth)
// Product image routes carry base64 uploads and parse their own (larger) body.
const jsonBody = express.json({ limit: '256kb' })
const IMAGE_UPLOAD_PATH = /^\/api\/admin\/products\/[^/]+\/images(\/|$)/
app.use((req, res, next) => (IMAGE_UPLOAD_PATH.test(req.path) ? next() : jsonBody(req, res, next)))
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))
// Photos uploaded on the deployed site are saved on that server's disk, but the DB is shared,
// so a local copy may not have them. With MEDIA_BASE_URL set (local .env only), send those
// requests to the deployed server instead of returning 404.
const mediaBaseUrl = String(process.env.MEDIA_BASE_URL || '').trim().replace(/\/+$/, '')
if (mediaBaseUrl) {
  const mediaHost = new URL(mediaBaseUrl).host
  app.use('/uploads', (req, res, next) => {
    if (req.headers.host === mediaHost) return next() // never redirect the deployed site to itself
    res.redirect(302, `${mediaBaseUrl}/uploads${req.url}`)
  })
}

app.use('/api/health', healthRouter)
app.use('/api', catalogRouter)
app.use('/api', formsRouter)
app.use('/api', authRouter)
app.use('/api', accountRouter)
app.use('/api', paymentsRouter)
app.use('/api', passportRouter)
app.use('/api', instagramRouter)
app.use('/api', analyticsRouter)
app.use('/api', adminRouter)
app.use('/api', adminProductMediaRouter)

/** @type {'api' | 'dist' | 'vite-dev'} */
let clientMode = 'api'
/** @type {import('vite').ViteDevServer | undefined} */
let viteDevServer

/**
 * Product photos are stored in the database as /images/….png or .jpg. Each has a much smaller
 * .webp copy next to it; send that instead when the browser says it accepts WebP (all modern ones do).
 */
function preferWebp(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  if (!/^\/images\/.+\.(png|jpe?g)$/i.test(req.path)) return next()
  res.vary('Accept')
  if (!/image\/webp/.test(req.headers.accept || '')) return next()
  const webpPath = req.path.replace(/\.(png|jpe?g)$/i, '.webp')
  const file = path.join(distDir, decodeURIComponent(webpPath))
  if (!file.startsWith(distDir)) return next()
  fs.access(file, fs.constants.R_OK, (err) => {
    if (!err) req.url = webpPath + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')
    next()
  })
}

function attachDistClient() {
  app.use(preferWebp)
  app.use(express.static(distDir, { index: false }))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(clientIndex, (err) => (err ? next(err) : undefined))
  })
  clientMode = 'dist'
}

function attachApiOnlyRoot() {
  app.get('/', (_req, res) => {
    res.json({
      name: 'O.U.A.T. API',
      version: '1.0.0',
      ui: 'Run npm run dev (http://localhost:5173) or npm run dev:api (UI on this port).',
    })
  })
  clientMode = 'api'
}

async function attachClientServing() {
  const isProduction = process.env.NODE_ENV === 'production'
  const embedVite = !isProduction && process.env.VITE_MIDDLEWARE !== '0'

  if (isProduction && serveClient) {
    attachDistClient()
    return
  }

  if (embedVite) {
    try {
      const { createServer } = await import('vite')
      viteDevServer = await createServer({
        configFile: path.join(__dirname, '../vite.config.js'),
        server: { middlewareMode: true },
        appType: 'spa',
      })
      app.use(viteDevServer.middlewares)
      clientMode = 'vite-dev'
      return
    } catch (err) {
      console.warn('[api] Vite dev middleware unavailable:', err.message)
      if (serveClient) {
        attachDistClient()
        console.info('[api] Serving pre-built dist/ instead. Run npm run build to refresh the UI.')
        return
      }
      console.warn('[api] Run npm install (see Rolldown optional deps) or npm run build, then restart.')
    }
  }

  if (serveClient) {
    attachDistClient()
    return
  }

  attachApiOnlyRoot()
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

/** @type {import('node:http').Server | undefined} */
let httpServer

function listen() {
  const server = app.listen(port, () => {
    const labels = { api: 'api', dist: 'web+api (dist)', 'vite-dev': 'vite+api' }
    console.info(
      `O.U.A.T. ${labels[clientMode]} on http://localhost:${port} (DB ${process.env.DB_HOST}/${process.env.DB_NAME})`,
    )
    if (clientMode === 'vite-dev') {
      console.info(`[api] Local UI: http://localhost:${port}`)
    } else if (clientMode === 'api') {
      console.info('[api] Local UI: npm run dev → http://localhost:5173')
    }
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

async function start() {
  await attachClientServing()
  httpServer = listen()

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

  // Finish order emails a previous run was cut off in the middle of (e.g. a restart mid-send).
  setTimeout(() => {
    retryInterruptedOrderEmails().catch((err) => console.error('[mail] retry of interrupted emails failed:', err.message))
  }, 15000).unref()
}

function shutdown() {
  const finish = () => {
    if (!httpServer) {
      process.exit(0)
      return
    }
    httpServer.close(() => {
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 5000).unref()
  }

  if (viteDevServer) {
    viteDevServer.close().then(finish).catch(finish)
    return
  }
  finish()
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)

start()
