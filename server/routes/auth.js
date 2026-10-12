import { Router } from 'express'
import { query } from '../config/db.js'
import { generateApiKey, generateUserId, hashApiKey } from '../lib/ids.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { signAccessToken } from '../lib/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { claimGuestOrdersForUser } from '../lib/claimGuestOrders.js'

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

router.post('/auth/register', async (req, res, next) => {
  try {
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

    const row = await findUserByEmail(email)
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' })
    }
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
