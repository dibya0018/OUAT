import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMAGE_FILES } from '../../catalog/galleryMap.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '../../src/components/images')
const destDir = path.join(__dirname, '../../public/images')

fs.mkdirSync(destDir, { recursive: true })

let copied = 0
for (const file of Object.keys(IMAGE_FILES)) {
  const from = path.join(srcDir, file)
  const to = path.join(destDir, file)
  if (!fs.existsSync(from)) {
    console.warn('Skip (missing):', file)
    continue
  }
  fs.copyFileSync(from, to)
  copied += 1
}

console.info(`Synced ${copied} images to public/images/`)
