import crypto from 'node:crypto'

const USER_ID_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/** 16-character public user id (no ambiguous 0/O, 1/l). */
export function generateUserId() {
  const bytes = crypto.randomBytes(16)
  let id = ''
  for (let i = 0; i < 16; i++) {
    id += USER_ID_ALPHABET[bytes[i] % USER_ID_ALPHABET.length]
  }
  return id
}

/** Client API key: ouat_ + 32 url-safe chars */
export function generateApiKey() {
  return `ouat_${crypto.randomBytes(24).toString('base64url')}`
}

export function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey, 'utf8').digest('hex')
}
