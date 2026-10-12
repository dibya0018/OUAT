import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectionHeroFiles,
  galleryFilesForProduct,
  IMAGE_FILES,
} from '../../catalog/galleryMap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGE_DIR = path.join(__dirname, '../../src/components/images')

/** Read a project image as a data URL (base64) for DB storage. */
export function fileToDataUrl(filename) {
  const filePath = path.join(IMAGE_DIR, filename)
  if (!fs.existsSync(filePath)) return null
  const buf = fs.readFileSync(filePath)
  const ext = path.extname(filename).slice(1).toLowerCase()
  const mime =
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
  return `data:${mime};base64,${buf.toString('base64')}`
}

const TONES = ['sand', 'olive', 'deep', 'sand', 'olive', 'deep']

/** Build image objects for MySQL images_json (base64 src). */
export function productImagesBase64(product) {
  const files = galleryFilesForProduct(product.slug, product.collection)
  return files
    .map((file, i) => {
      const src = fileToDataUrl(file)
      if (!src) return null
      const hint = IMAGE_FILES[file] ?? product.name
      return {
        src,
        alt: `${product.name} — ${hint}`,
        tone: TONES[i % TONES.length],
      }
    })
    .filter(Boolean)
}

export function collectionImageBase64(slug, name) {
  const [file] = collectionHeroFiles(slug)
  const src = file ? fileToDataUrl(file) : null
  return {
    src,
    alt: IMAGE_FILES[file] ?? `${name} collection`,
    tone: 'sand',
  }
}
