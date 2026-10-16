import { galleryFilesForProduct, collectionHeroFiles, IMAGE_FILES } from '../../catalog/galleryMap.js'

const TONES = ['sand', 'olive', 'deep', 'sand', 'olive', 'deep']

/** Public URLs for mock / dev (files synced to public/images). */
export function productImagesPublic(product) {
  const files = galleryFilesForProduct(product.slug, product.collection)
  return files.map((file, i) => ({
    src: `/images/${file}`,
    alt: `${product.name}, ${IMAGE_FILES[file] ?? 'product photo'}`,
    tone: TONES[i % TONES.length],
  }))
}

export function collectionImagePublic(slug, name) {
  const [file] = collectionHeroFiles(slug)
  return {
    src: file ? `/images/${file}` : null,
    alt: IMAGE_FILES[file] ?? `${name} collection`,
    tone: 'sand',
  }
}
