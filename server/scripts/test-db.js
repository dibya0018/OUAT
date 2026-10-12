import 'dotenv/config'
import https from 'node:https'
import mysql from 'mysql2/promise'

const { DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_PASSWORD } = process.env

const PLACEHOLDER_HOSTS = new Set(['srv1234.hstgr.io', 'localhost', '127.0.0.1', '::1'])

function missingEnv() {
  const need = { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD }
  return Object.entries(need).filter(([, v]) => !v?.trim?.()).map(([k]) => k)
}

function httpsJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let body = ''
      res.on('data', (c) => {
        body += c
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

async function publicIps() {
  const out = { ipv4: null, ipv6: null }
  try {
    out.ipv4 = (await httpsJson('https://api.ipify.org?format=json')).ip
  } catch {
    /* */
  }
  try {
    out.ipv6 = (await httpsJson('https://api64.ipify.org?format=json')).ip
  } catch {
    /* */
  }
  return out
}

async function main() {
  const missing = missingEnv()
  if (missing.length) {
    console.error('Missing or empty in .env:', missing.join(', '))
    console.error('')
    console.error('In hPanel open: Websites → Manage → Remote MySQL')
    console.error('At the TOP of that page, copy the MySQL hostname (srvXXXX.hstgr.io) into DB_HOST.')
    return 1
  }

  const host = DB_HOST.trim()
  const looksHostinger = /^u\d+_/.test(DB_USER ?? '')

  if (looksHostinger && PLACEHOLDER_HOSTS.has(host)) {
    console.error('DB_HOST must be your real Hostinger MySQL hostname — not localhost and not srv1234.hstgr.io.')
    console.error('')
    console.error('You copied the example from .env comments. Open hPanel → Remote MySQL and copy')
    console.error('the hostname shown at the top of that page (different srv number for your account).')
    console.error('')
    console.error('Then in .env:  DB_HOST=srv????.hstgr.io')
    console.error('Run: npm run db:test')
    return 1
  }

  console.info(`Connecting to ${DB_USER}@${host}:${DB_PORT || 3306}/${DB_NAME} …`)

  let connection
  try {
    connection = await mysql.createConnection({
      host,
      port: Number(DB_PORT || 3306),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectTimeout: 20000,
    })
    const [rows] = await connection.query('SELECT 1 AS ok, DATABASE() AS db, VERSION() AS version')
    console.info('Database connection OK.')
    console.info('  database:', rows[0].db)
    console.info('  version:', rows[0].version)
    return 0
  } catch (err) {
    console.error('Database connection failed.')
    console.error('  code:', err.code ?? '—')
    console.error('  message:', err.message || '(no message)')

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      const hostOk = /^srv\d+\.hstgr\.io$/i.test(host)
      console.error('')
      if (hostOk) {
        console.error('DB_HOST looks correct. Hostinger reached MySQL but rejected the login.')
        console.error('')
        console.error('Fix (in order):')
        console.error('  1. hPanel → Databases → Manage → open database', DB_NAME)
        console.error('     Confirm MySQL USER is exactly:', DB_USER)
        console.error('  2. Change MySQL user password there → copy the new password into .env DB_PASSWORD')
        console.error('     (If password has # or spaces, wrap it in double quotes in .env.)')
        console.error('  3. phpMyAdmin uses localhost only — remote needs Remote MySQL (% or your IP)')
        console.error('     under Websites → Manage bipminds.com → Remote MySQL. Delete and re-create the % rule.')
        console.error('  4. ⋮ menu → Change password → set again → update .env')
        console.error('  5. npm run db:test')
        console.error('')
        console.error('Workaround: import server/db/schema.sql in phpMyAdmin; run API on Hostinger with DB_HOST=127.0.0.1')
      } else {
        console.error('Access denied: wrong DB_HOST, DB_USER, or DB_PASSWORD.')
        console.error('Use the MySQL hostname from hPanel → Remote MySQL (srvXXXX.hstgr.io).')
      }
    }
    if (err.code === 'ENOTFOUND') {
      console.error('')
      console.error('DB_HOST hostname not found — copy it again from hPanel → Remote MySQL.')
    }
    console.error('')
    console.error('Do not run db:migrate until db:test succeeds.')
    return 1
  } finally {
    if (connection) await connection.end().catch(() => {})
  }
}

const code = await main()
process.exitCode = code
