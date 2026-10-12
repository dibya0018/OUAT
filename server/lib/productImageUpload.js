import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_ROOT = path.join(__dirname, '../../public/uploads')

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null
  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim())
  if (!m) return null
  const mime = m[1]
  if (!ALLOWED_MIME.has(mime)) return null
  const buffer = Buffer.from(m[2], 'base64')
  if (buffer.length === 0 || buffer.length > MAX_BYTES) return null
  return { mime, buffer }
}

function extForMime(mime) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

/** Persist upload under public/uploads/products/{productId}/ and return public URL path. */
export function saveProductImageFile(productId, dataUrl) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) {
    const err = new Error('Invalid image. Use JPEG, PNG, WebP, or GIF under 5 MB.')
    err.status = 400
    throw err
  }
  const dir = path.join(UPLOAD_ROOT, 'products', productId)
  fs.mkdirSync(dir, { recursive: true })
  const name = `${Date.now()}-${randomBytes(4).toString('hex')}.${extForMime(parsed.mime)}`
  fs.writeFileSync(path.join(dir, name), parsed.buffer)
  return `/uploads/products/${productId}/${name}`
}

/** Remove a previously uploaded file (ignores data URLs and /images/ catalog paths). */
export function deleteUploadedImageSrc(src) {
  if (typeof src !== 'string' || !src.startsWith('/uploads/')) return
  const rel = src.replace(/^\/uploads\//, '')
  const filePath = path.join(UPLOAD_ROOT, rel)
  if (!filePath.startsWith(UPLOAD_ROOT)) return
  try {
    fs.unlinkSync(filePath)
  } catch {
    /* already gone */
  }
}
