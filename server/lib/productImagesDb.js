import { callProcedure, query } from '../config/db.js'

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

/**
 * Remove the photo at position `sortOrder` (0 = cover) and close the gap.
 * Deletes that one row and renumbers the rest, instead of deleting every photo and re-inserting
 * the others, so a failure part-way can never wipe a product's whole gallery.
 */
export async function deleteProductImageAt(productId, sortOrder) {
  const rows = await query(
    `SELECT id, image_src, alt_text, tone FROM product_images
     WHERE product_id = :pid AND is_active = 1
     ORDER BY sort_order ASC, id ASC`,
    { pid: productId },
  )
  if (sortOrder < 0 || sortOrder >= rows.length) return null
  const target = rows[sortOrder]
  await query('DELETE FROM product_images WHERE id = :id AND product_id = :pid', { id: target.id, pid: productId })
  const rest = rows.filter((r) => r.id !== target.id)
  for (let i = 0; i < rest.length; i++) {
    await query('UPDATE product_images SET sort_order = :i WHERE id = :id', { i, id: rest[i].id })
  }
  return { src: target.image_src, alt: target.alt_text, tone: target.tone || 'sand' }
}
