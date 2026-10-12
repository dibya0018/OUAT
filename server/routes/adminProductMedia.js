import { Router } from 'express'
import express from 'express'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { logAdminActivity } from '../lib/adminLog.js'
import { callProcedure } from '../config/db.js'
import {
  appendProductImage,
  deleteProductImageAt,
  imagesByProductIds,
  setCoverImage,
} from '../lib/productImagesDb.js'
import { deleteUploadedImageSrc, saveProductImageFile } from '../lib/productImageUpload.js'

const uploadJson = express.json({ limit: '8mb' })
const router = Router()
const adminApi = Router()
adminApi.use(requireAdmin)

async function productExists(id) {
  const rows = await callProcedure('sp_product_by_id', { p_id: id })
  return rows.length > 0
}

adminApi.post('/products/:id/images', uploadJson, async (req, res, next) => {
  try {
    const id = req.params.id
    if (!(await productExists(id))) {
      return res.status(404).json({ ok: false, error: 'Not found' })
    }

    const { dataUrl, alt, tone, asCover } = req.body ?? {}
    if (!dataUrl) {
      return res.status(400).json({ ok: false, error: 'dataUrl required' })
    }

    const src = saveProductImageFile(id, dataUrl)
    const image = {
      src,
      alt: typeof alt === 'string' ? alt : '',
      tone: typeof tone === 'string' && tone ? tone : 'sand',
    }

    if (asCover) {
      const map = await imagesByProductIds([id])
      const current = map.get(id) ?? []
      await setCoverImage(id, [image, ...current])
    } else {
      await appendProductImage(id, image)
    }

    const map = await imagesByProductIds([id])
    await logAdminActivity(`Admin added image to product ${id}`, req.user.userId)
    res.json({ ok: true, images: map.get(id) ?? [] })
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ ok: false, error: err.message })
    next(err)
  }
})

adminApi.delete('/products/:id/images/:sortOrder', async (req, res, next) => {
  try {
    const id = req.params.id
    const sortOrder = Number(req.params.sortOrder)
    if (!(await productExists(id))) {
      return res.status(404).json({ ok: false, error: 'Not found' })
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return res.status(400).json({ ok: false, error: 'Invalid sort order' })
    }

    const removed = await deleteProductImageAt(id, sortOrder)
    if (!removed) return res.status(404).json({ ok: false, error: 'Image not found' })
    deleteUploadedImageSrc(removed.src)

    const map = await imagesByProductIds([id])
    await logAdminActivity(`Admin removed image from product ${id}`, req.user.userId)
    res.json({ ok: true, images: map.get(id) ?? [] })
  } catch (err) {
    next(err)
  }
})

adminApi.patch('/products/:id/images/cover', uploadJson, async (req, res, next) => {
  try {
    const id = req.params.id
    const sortOrder = Number(req.body?.sortOrder)
    if (!(await productExists(id))) {
      return res.status(404).json({ ok: false, error: 'Not found' })
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return res.status(400).json({ ok: false, error: 'sortOrder required' })
    }

    await setCoverImage(id, sortOrder)
    const map = await imagesByProductIds([id])
    await logAdminActivity(`Admin set cover image on product ${id}`, req.user.userId)
    res.json({ ok: true, images: map.get(id) ?? [] })
  } catch (err) {
    next(err)
  }
})

router.use('/admin', adminApi)

export default router
