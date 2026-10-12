import jwt from 'jsonwebtoken'

function secret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET must be set in .env (min 32 characters)')
  }
  return s
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.user_id,
      email: user.email,
    },
    secret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' },
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, secret())
}
