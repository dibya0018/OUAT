import { callProcedure } from '../config/db.js'

/** Load active images for many products; returns Map productId -> [{ src, alt, tone }] */
export async function imagesByProductIds(productIds) {
  const map = new Map()
  if (!productIds.length) return map

  const idList = productIds.join(',')
  const rows = await callProcedure('sp_product_images_by_product_ids', { p_id_list: idList })

  for (const row of rows) {
    if (!map.has(row.product_id)) map.set(row.product_id, [])
    map.get(row.product_id).push({
      src: row.image_src,
      alt: row.alt_text,
      tone: row.tone || 'sand',
    })
  }
  return map
}

export async function replaceProductImages(productId, images) {
  await callProcedure('sp_product_images_delete_for_product', { p_product_id: productId })
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    if (!img?.src) continue
    await callProcedure('sp_product_image_insert', {
      p_product_id: productId,
      p_sort_order: i,
      p_image_src: img.src,
      p_alt_text: img.alt ?? '',
      p_tone: img.tone ?? 'sand',
    })
  }
}

export async function appendProductImage(productId, image) {
  const map = await imagesByProductIds([productId])
  const current = map.get(productId) ?? []
  await replaceProductImages(productId, [...current, image])
}

/** Move image at sortOrder to cover (sort 0). Pass full list + new image when inserting cover in one step. */
export async function setCoverImage(productId, sortOrderOrImages) {
  if (Array.isArray(sortOrderOrImages)) {
    await replaceProductImages(productId, sortOrderOrImages)
    return
  }
  const sortOrder = sortOrderOrImages
  const map = await imagesByProductIds([productId])
  const current = map.get(productId) ?? []
  if (sortOrder < 0 || sortOrder >= current.length) return
  const img = current[sortOrder]
  const next = [img, ...current.filter((_, i) => i !== sortOrder)]
  await replaceProductImages(productId, next)
}

export async function deleteProductImageAt(productId, sortOrder) {
  const map = await imagesByProductIds([productId])
  const current = map.get(productId) ?? []
  if (sortOrder < 0 || sortOrder >= current.length) return null
  const removed = current[sortOrder]
  await replaceProductImages(
    productId,
    current.filter((_, i) => i !== sortOrder),
  )
  return removed
}
