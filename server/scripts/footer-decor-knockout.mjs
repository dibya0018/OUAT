/**
 * Remove near-black backgrounds from footer decor PNGs.
 * Run: node server/scripts/footer-decor-knockout.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const imagesDir = join(root, 'public/images')

const files = [
  'footer-decor-left.png',
  'footer-decor-left@2x.png',
  'footer-decor-right.png',
  'footer-decor-right@2x.png',
]

const THRESHOLD = 48

for (const name of files) {
  const input = join(imagesDir, name)
  if (!existsSync(input)) {
    console.warn('Skip missing', name)
    continue
  }

  const png = PNG.sync.read(readFileSync(input))
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2
      const r = png.data[idx]
      const g = png.data[idx + 1]
      const b = png.data[idx + 2]
      if (r <= THRESHOLD && g <= THRESHOLD && b <= THRESHOLD) {
        png.data[idx + 3] = 0
      }
    }
  }

  writeFileSync(input, PNG.sync.write(png))
  console.log('Knocked out background:', name, `${png.width}x${png.height}`)
}
