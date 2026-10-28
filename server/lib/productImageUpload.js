import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_UPLOAD_ROOT = path.join(__dirname, '../../public/uploads')

/**
 * Where photos uploaded in Admin are saved. On the live server set UPLOAD_DIR to a folder OUTSIDE
 * the app (e.g. /home/<account>/ouat-uploads): each deploy replaces the app folder, so anything
 * saved inside it (the public/uploads default) is deleted on the next deploy.
 * The public URLs stay /uploads/..., whichever folder holds the files.
 */
export const UPLOAD_ROOT = path.resolve(String(process.env.UPLOAD_DIR || '').trim() || DEFAULT_UPLOAD_ROOT)
export const usingDefaultUploadRoot = UPLOAD_ROOT === path.resolve(DEFAULT_UPLOAD_ROOT)

try {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true })
} catch (err) {
  console.error(`[uploads] Cannot create upload folder ${UPLOAD_ROOT}:`, err.message)
}

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

/** Persist upload under {UPLOAD_ROOT}/products/{productId}/ and return its public URL path. */
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
  if (!filePath.startsWith(UPLOAD_ROOT + path.sep)) return
  try {
    fs.unlinkSync(filePath)
  } catch {
    /* already gone */
  }
}
