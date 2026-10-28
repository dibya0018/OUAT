import crypto from 'node:crypto'
import { Router } from 'express'
import { query } from '../config/db.js'
import { generateApiKey, generateUserId, hashApiKey } from '../lib/ids.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { signAccessToken } from '../lib/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { claimGuestOrdersForUser } from '../lib/claimGuestOrders.js'
import { isMailConfigured, sendMail } from '../lib/mailer.js'
import { isLocal, siteUrl } from '../lib/appEnv.js'
import { renderPasswordResetEmail } from '../lib/passwordResetEmail.js'
import { clientIp, createRateLimiter } from '../lib/rateLimit.js'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateRegister(body) {
  const errors = {}
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const passwordConfirm = String(body.passwordConfirm ?? body.confirmPassword ?? '')

  if (!name) errors.name = 'Name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!passwordConfirm) errors.passwordConfirm = 'Please confirm your password.'
  else if (password !== passwordConfirm) errors.passwordConfirm = 'Passwords do not match.'

  return { errors, name, email, password }
}

async function findUserByEmail(email) {
  const value = email.trim().toLowerCase()
  const rows = await query(
    `SELECT user_id, full_name, email, password_hash, role, is_active, created_at
     FROM users WHERE email = :v LIMIT 1`,
    { v: value },
  )
  return rows[0] ?? null
}

function authResponse(row, token, apiKey) {
  return {
    ok: true,
    user: {
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email,
      role: row.role ?? 'customer',
    },
    token,
    tokenType: 'Bearer',
    apiKey,
  }
}

// Brute-force protection. Per IP: every attempt counts. Per email: only wrong passwords count,
// so one account can't be guessed at from many addresses, and a correct login clears it.
const loginByIp = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 })
const loginFailsByEmail = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })
const registerByIp = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 })

router.post('/auth/register', async (req, res, next) => {
  try {
    const ipLimit = registerByIp(clientIp(req))
    if (!ipLimit.allowed) return tooMany(res, ipLimit.retryAfterSec)

    const { errors, name, email, password } = validateRegister(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    const existing = await query('SELECT user_id FROM users WHERE email = :email LIMIT 1', { email })
    if (existing.length) {
      return res.status(409).json({
        ok: false,
        errors: { email: 'An account with this email already exists.' },
      })
    }

    const userId = generateUserId()
    const apiKey = generateApiKey()
    const passwordHash = await hashPassword(password)

    await query(
      `INSERT INTO users (user_id, full_name, email, password_hash, api_key_hash)
       VALUES (:userId, :fullName, :email, :passwordHash, :apiKeyHash)`,
      {
        userId,
        fullName: name,
        email,
        passwordHash,
        apiKeyHash: hashApiKey(apiKey),
      },
    )

    const row = { user_id: userId, full_name: name, email }
    await claimGuestOrdersForUser(userId, email)
    const token = signAccessToken(row)

    res.status(201).json({
      ...authResponse(row, token, apiKey),
      message: 'Save your API key now — it will not be shown again.',
    })
  } catch (err) {
    next(err)
  }
})

router.post('/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.login ?? req.body.email ?? '').trim().toLowerCase()
    const password = String(req.body.password ?? '').trim()

    const errors = {}
    if (!email) errors.login = 'Email is required.'
    else if (!EMAIL_RE.test(email)) errors.login = 'Enter a valid email.'
    if (!password) errors.password = 'Password is required.'
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    const ipLimit = loginByIp(clientIp(req))
    if (!ipLimit.allowed) return tooMany(res, ipLimit.retryAfterSec)
    const emailLimit = loginFailsByEmail.peek(email)
    if (!emailLimit.allowed) return tooMany(res, emailLimit.retryAfterSec)

    const row = await findUserByEmail(email)
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      loginFailsByEmail(email)
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' })
    }
    loginFailsByEmail.reset(email)
    if (row.is_active === 0) {
      return res.status(403).json({ ok: false, error: 'This account is deactivated. Contact support.' })
    }

    await claimGuestOrdersForUser(row.user_id, row.email)
    const token = signAccessToken(row)
    res.json({
      ok: true,
      ...authResponse(row, token, undefined),
    })
  } catch (err) {
    next(err)
  }
})

/* ------------------------------------------------------------------ */
/* Forgot / reset password                                             */
/* ------------------------------------------------------------------ */

const RESET_TTL_MINUTES = 60
const FORGOT_OK_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password. It expires in 60 minutes."

// Per IP: blocks scripted abuse (429). Per email: caps how many emails one inbox can receive,
// silently, so the response never hints whether the address is registered.
const forgotByIp = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })
const forgotByEmail = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3 })
const resetByIp = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 })

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

let resetTableReady = null
function ensureResetTable() {
  resetTableReady ??= query(
    `CREATE TABLE IF NOT EXISTS password_resets (
       id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
       user_id CHAR(16) NOT NULL,
       token_hash CHAR(64) NOT NULL,
       expires_at DATETIME NOT NULL,
       used_at DATETIME NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE KEY uq_password_resets_token (token_hash),
       INDEX idx_password_resets_user (user_id)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ).catch((err) => {
    resetTableReady = null
    throw err
  })
  return resetTableReady
}

function tooMany(res, retryAfterSec) {
  res.set('Retry-After', String(retryAfterSec))
  return res
    .status(429)
    .json({ ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' })
}

router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase()
    if (!email) return res.status(400).json({ ok: false, errors: { email: 'Email is required.' } })
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, errors: { email: 'Enter a valid email.' } })
    }

    const ipLimit = forgotByIp(clientIp(req))
    if (!ipLimit.allowed) return tooMany(res, ipLimit.retryAfterSec)

    // From here on the reply is always the same, whatever happens with the account.
    const reply = () => res.json({ ok: true, message: FORGOT_OK_MESSAGE })

    if (!forgotByEmail(email).allowed) return reply()

    await ensureResetTable()
    const row = await findUserByEmail(email)
    if (!row || row.is_active === 0) return reply()

    const token = crypto.randomBytes(32).toString('hex')
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES (:userId, :tokenHash, UTC_TIMESTAMP() + INTERVAL ${RESET_TTL_MINUTES} MINUTE)`,
      { userId: row.user_id, tokenHash: sha256(token) },
    )

    const resetUrl = `${siteUrl()}/reset-password?token=${token}`
    if (isLocal()) console.info('[auth] local reset link:', resetUrl)

    // Send in the background: the reply must not wait on SMTP (timing would hint the email exists)
    // and must never fail because mail did.
    if (isMailConfigured()) {
      const mail = renderPasswordResetEmail({
        name: row.full_name,
        resetUrl,
        expiresMinutes: RESET_TTL_MINUTES,
      })
      sendMail({ to: row.email, ...mail }).catch((err) =>
        console.error('[auth] reset email failed for', row.user_id, err.message),
      )
    } else {
      console.warn('[auth] reset requested but SMTP is not configured; no email sent')
    }

    return reply()
  } catch (err) {
    next(err)
  }
})

router.post('/auth/reset-password', async (req, res, next) => {
  try {
    const ipLimit = resetByIp(clientIp(req))
    if (!ipLimit.allowed) return tooMany(res, ipLimit.retryAfterSec)

    const token = String(req.body.token ?? '').trim()
    const password = String(req.body.password ?? '')
    const passwordConfirm = String(req.body.passwordConfirm ?? password)

    const errors = {}
    if (!password) errors.password = 'Password is required.'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (password && password !== passwordConfirm) errors.passwordConfirm = 'Passwords do not match.'
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

    const invalid = () =>
      res.status(400).json({
        ok: false,
        code: 'TOKEN_INVALID',
        error: 'This reset link is invalid or has expired. Please request a new one.',
      })
    if (!/^[a-f0-9]{64}$/.test(token)) return invalid()

    await ensureResetTable()
    const tokenHash = sha256(token)

    // Claim the token atomically so it can only ever be used once.
    const claim = await query(
      `UPDATE password_resets SET used_at = UTC_TIMESTAMP()
       WHERE token_hash = :tokenHash AND used_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
      { tokenHash },
    )
    if (!claim.affectedRows) return invalid()

    const [reset] = await query(
      `SELECT pr.user_id, u.is_active FROM password_resets pr
       JOIN users u ON u.user_id = pr.user_id
       WHERE pr.token_hash = :tokenHash LIMIT 1`,
      { tokenHash },
    )
    if (!reset || reset.is_active === 0) return invalid()

    await query('UPDATE users SET password_hash = :hash WHERE user_id = :id', {
      hash: await hashPassword(password),
      id: reset.user_id,
    })
    // Any other outstanding links for this user stop working.
    await query(
      `UPDATE password_resets SET used_at = UTC_TIMESTAMP()
       WHERE user_id = :id AND used_at IS NULL`,
      { id: reset.user_id },
    )

    res.json({ ok: true, message: 'Your password has been reset. You can now sign in.' })
  } catch (err) {
    next(err)
  }
})

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user, authMethod: req.authMethod })
})

router.post('/auth/regenerate-api-key', requireAuth, async (req, res, next) => {
  try {
    if (req.authMethod !== 'jwt') {
      return res.status(403).json({ ok: false, error: 'Sign in with password to rotate your API key.' })
    }
    const apiKey = generateApiKey()
    await query('UPDATE users SET api_key_hash = :hash WHERE user_id = :id', {
      hash: hashApiKey(apiKey),
      id: req.user.userId,
    })
    res.json({ ok: true, apiKey, message: 'Save this API key — it will not be shown again.' })
  } catch (err) {
    next(err)
  }
})

export default router
