import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminPageHeader from '../components/AdminPageHeader'
import {
  addProductReview,
  createProduct,
  deleteProductImage,
  fetchAdminProduct,
  patchProduct,
  patchReview,
  setProductCoverImage,
  uploadProductImage,
} from '../services/adminService'
import { apiGet } from '../../lib/api'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

const emptyPack = () => ({
  size: '',
  badge: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  isDefault: false,
})

function emptyProductForm(collectionSlug = 'glassware') {
  return {
    name: '',
    slug: '',
    collection: collectionSlug,
    shortStory: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: '0',
    active: false,
    featured: false,
    isNew: false,
    origin: '',
    colour: '',
    images: [],
    benefits: [],
    packOptions: [],
    videoUrl: '',
    details: {
      material: '',
      size: '',
      care: '',
      shipping: '',
    },
  }
}

export default function AdminProductEditorPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const isNew = productId === 'new'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveNote, setSaveNote] = useState(null) // { ok: boolean, text: string }
  const [collections, setCollections] = useState([])
  const [reviews, setReviews] = useState([])
  const [mediaTab, setMediaTab] = useState('photos')
  const [mediaBusy, setMediaBusy] = useState(false)
  const [mediaError, setMediaError] = useState('')
  const photoInputRef = useRef(null)
  const thumbInputRef = useRef(null)

  const [form, setForm] = useState(null)
  const [benefitDraft, setBenefitDraft] = useState('')
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    rating: '5',
    title: '',
    body: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (isNew) {
        const colRes = await apiGet('/collections')
        const cols = Array.isArray(colRes) ? colRes : (colRes.collections ?? [])
        setCollections(cols.map((c) => ({ slug: c.slug, name: c.name })))
        setReviews([])
        setForm(emptyProductForm(cols[0]?.slug ?? 'glassware'))
        return
      }
      const res = await fetchAdminProduct(productId)
      const p = res.product
      setCollections(res.collections ?? [])
      setReviews(res.reviews ?? [])
      setForm({
        name: p.name,
        slug: p.slug,
        collection: p.collection,
        shortStory: p.shortStory ?? '',
        description: p.description ?? '',
        price: String(p.price),
        compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
        stock: String(p.stock),
        active: p.active,
        featured: p.featured,
        isNew: Boolean(p.isNew),
        origin: p.origin ?? '',
        colour: p.colour ?? '',
        images: p.images ?? [],
        benefits: p.benefits ?? [],
        packOptions: p.packOptions?.length ? p.packOptions : [],
        videoUrl: p.videoUrl ?? '',
        details: {
          material: p.details?.material ?? '',
          size: p.details?.size ?? '',
          care: p.details?.care ?? '',
          shipping: p.details?.shipping ?? '',
        },
      })
    } catch {
      setForm(null)
    } finally {
      setLoading(false)
    }
  }, [productId, isNew])

  useEffect(() => {
    load()
  }, [load])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const buildPayload = () => ({
    name: form.name,
    slug: form.slug,
    collection: form.collection,
    shortStory: form.shortStory,
    description: form.description,
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
    stock: Number(form.stock),
    active: form.active,
    featured: form.featured,
    isNew: form.isNew,
    origin: form.origin,
    colour: form.colour,
    benefits: form.benefits,
    packOptions: form.packOptions
      .filter((o) => String(o.size ?? '').trim())
      .map((o) => ({
      size: String(o.size).trim(),
      badge: o.badge,
      price: o.price === '' ? 0 : Number(o.price),
      compareAtPrice: o.compareAtPrice === '' ? null : Number(o.compareAtPrice),
      stock: o.stock === '' ? 0 : Number(o.stock),
      isDefault: Boolean(o.isDefault),
    })),
    videoUrl: form.videoUrl,
    details: form.details,
    // Photos are saved by the upload / delete / cover endpoints, so they are not resent here.
  })

  const onSave = async () => {
    if (!form) return
    if (!form.name.trim()) {
      setSaveNote({ ok: false, text: 'Enter a product name.' })
      return
    }
    if (!(Number(form.price) > 0) && !form.packOptions.some((o) => o.size.trim() && Number(o.price) > 0)) {
      setSaveNote({ ok: false, text: 'Enter a price above 0.' })
      return
    }
    setSaving(true)
    setSaveNote(null)
    try {
      if (isNew) {
        const res = await createProduct(buildPayload())
        if (res.ok === false || !res.product?.id) {
          window.alert(res.error || 'Could not create product')
          return
        }
        navigate(`/admin/products/${res.product.id}`, { replace: true })
        return
      }
      await patchProduct(productId, buildPayload())
      await load()
      setSaveNote({ ok: true, text: 'Saved. The store now shows these details.' })
    } catch (err) {
      setSaveNote({ ok: false, text: err.message || 'Could not save product.' })
    } finally {
      setSaving(false)
    }
  }

  const addBenefit = () => {
    const t = benefitDraft.trim()
    if (!t) return
    setForm((f) => ({ ...f, benefits: [...f.benefits, t] }))
    setBenefitDraft('')
  }

  const addPackOption = () => {
    setForm((f) => ({ ...f, packOptions: [...f.packOptions, emptyPack()] }))
  }

  const addReview = async () => {
    if (!reviewForm.authorName.trim()) {
      window.alert('Enter the reviewer name.')
      return
    }
    await addProductReview(productId, {
      authorName: reviewForm.authorName,
      rating: Number(reviewForm.rating),
      title: reviewForm.title,
      body: reviewForm.body,
      status: 'approved',
    })
    setReviewForm({ authorName: '', rating: '5', title: '', body: '' })
    load()
  }

  const applyImages = (images) => {
    setForm((f) => (f ? { ...f, images } : f))
  }

  const uploadFiles = async (files, { asCover = false } = {}) => {
    if (!files?.length) return
    setMediaError('')
    setMediaBusy(true)
    try {
      let latest = form?.images ?? []
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setMediaError('Only image files are allowed.')
          continue
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setMediaError('Each image must be 5 MB or smaller.')
          continue
        }
        const dataUrl = await readFileAsDataUrl(file)
        const res = await uploadProductImage(productId, {
          dataUrl,
          alt: form?.name ? `${form.name} photo` : '',
          asCover: asCover && files.length === 1,
        })
        if (!res.ok) {
          setMediaError(res.error || 'Upload failed')
          break
        }
        latest = res.images ?? latest
        if (asCover) break
      }
      applyImages(latest)
    } catch {
      setMediaError('Upload failed. Try again.')
    } finally {
      setMediaBusy(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  const onPickPhotos = (e) => uploadFiles([...e.target.files])

  const onPickThumbnail = (e) => uploadFiles([...e.target.files], { asCover: true })

  const onDeletePhoto = async (sortOrder) => {
    if (!window.confirm('Remove this photo from the product?')) return
    setMediaError('')
    setMediaBusy(true)
    try {
      const res = await deleteProductImage(productId, sortOrder)
      if (res.ok) applyImages(res.images ?? [])
      else setMediaError(res.error || 'Could not delete photo')
    } catch {
      setMediaError('Could not delete photo')
    } finally {
      setMediaBusy(false)
    }
  }

  const onUseAsThumbnail = async (sortOrder) => {
    if (sortOrder === 0) return
    setMediaError('')
    setMediaBusy(true)
    try {
      const res = await setProductCoverImage(productId, sortOrder)
      applyImages(res.images ?? [])
    } catch {
      setMediaError('Could not set thumbnail')
    } finally {
      setMediaBusy(false)
    }
  }

  if (loading) {
    return <p className="text-admin-muted">Loading product…</p>
  }

  if (!form) {
    return (
      <p className="text-admin-muted">
        Product not found. <Link to="/admin/products" className="text-admin-gold">Back to products</Link>
      </p>
    )
  }

  const mediaLocked = isNew

  return (
    <>
      <AdminPageHeader title={isNew ? 'New product' : 'Product editor'} onRefresh={load} refreshing={loading}>
        <Link to="/admin/products" className="admin-btn-ghost">
          ← Products
        </Link>
      </AdminPageHeader>
      <p className="-mt-4 mb-6 text-sm text-admin-muted">
        {isNew ? 'Fill in details and save to create the product. You can add photos after saving.' : 'Photos, video, description & reviews'}
      </p>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Left: media + reviews */}
        <div className="flex flex-col gap-8">
          <section className="admin-panel p-5">
            <p className="admin-field-label mb-3">Media gallery</p>
            <div className="mb-4 flex gap-2">
              {['photos', 'thumbnail', 'video'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className="admin-filter-pill capitalize"
                  data-active={mediaTab === tab ? 'true' : 'false'}
                  onClick={() => setMediaTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {mediaError ? (
              <p className="mb-3 text-sm text-red-400" role="alert">
                {mediaError}
              </p>
            ) : null}

            {mediaLocked && (
              <p className="mb-4 text-sm text-admin-muted">Save the product first to upload photos and video.</p>
            )}

            {mediaTab === 'photos' && (
              <>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={onPickPhotos}
                />
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="admin-btn-gold text-sm"
                    disabled={mediaBusy || mediaLocked}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {mediaBusy ? 'Uploading…' : 'Add photos'}
                  </button>
                  <span className="text-xs text-admin-muted">JPEG, PNG, WebP, GIF · max 5 MB each</span>
                </div>
                {form.images.length === 0 ? (
                  <p className="text-sm text-admin-muted">No photos yet. Use Add photos to upload gallery images.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {form.images.map((img, i) => (
                      <div
                        key={`${img.src}-${i}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-admin-border bg-admin-panel-2"
                      >
                        {i === 0 ? (
                          <span className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-admin-gold">
                            Cover
                          </span>
                        ) : null}
                        {img.src ? (
                          <img src={img.src} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-admin-muted">No src</div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                          {i !== 0 ? (
                            <button
                              type="button"
                              className="rounded border border-admin-border px-2 py-1 text-[10px] text-admin-text"
                              disabled={mediaBusy}
                              onClick={() => onUseAsThumbnail(i)}
                            >
                              Set as cover
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="rounded border border-red-400/60 px-2 py-1 text-[10px] text-red-300"
                            disabled={mediaBusy}
                            onClick={() => onDeletePhoto(i)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {mediaTab === 'thumbnail' && (
              <div className="space-y-4">
                <p className="text-sm text-admin-muted">
                  The thumbnail is the <strong className="font-medium text-admin-text">cover photo</strong> (first in
                  the gallery). It appears on product cards and as the main store image.
                </p>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={onPickThumbnail}
                />
                <div className="mx-auto max-w-[200px]">
                  {form.images[0]?.src ? (
                    <img
                      src={form.images[0].src}
                      alt="Current thumbnail"
                      className="aspect-square w-full rounded-lg border border-admin-border object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-admin-border text-xs text-admin-muted">
                      No thumbnail
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="admin-btn-gold w-full"
                  disabled={mediaBusy || mediaLocked}
                  onClick={() => thumbInputRef.current?.click()}
                >
                  {mediaBusy ? 'Uploading…' : 'Upload new thumbnail'}
                </button>
                {form.images.length > 1 ? (
                  <div>
                    <p className="admin-field-label mb-2">Or pick from gallery</p>
                    <ul className="max-h-40 space-y-1 overflow-y-auto">
                      {form.images.map((img, i) => (
                        <li key={`thumb-pick-${i}`}>
                          <button
                            type="button"
                            disabled={mediaBusy || i === 0}
                            className="flex w-full items-center gap-2 rounded-lg border border-admin-border px-2 py-1.5 text-left text-sm disabled:opacity-50"
                            onClick={() => onUseAsThumbnail(i)}
                          >
                            <img src={img.src} alt="" className="h-8 w-8 rounded object-cover" />
                            <span>{i === 0 ? 'Current cover' : `Photo ${i + 1}`}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
            {mediaTab === 'video' && (
              <label className="block">
                <span className="admin-field-label">Video URL (optional)</span>
                <input
                  className="admin-input mt-1"
                  value={form.videoUrl}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder="https://…"
                />
              </label>
            )}
          </section>

          <section className="admin-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="admin-field-label">Reviews ({reviews.length})</p>
            </div>

            <div className="mb-6 space-y-3 rounded-lg border border-admin-border p-4">
              <p className="text-xs font-medium uppercase tracking-widest text-admin-muted">Add curated review</p>
              <input
                className="admin-input"
                placeholder="Reviewer name"
                value={reviewForm.authorName}
                onChange={(e) => setReviewForm((r) => ({ ...r, authorName: e.target.value }))}
              />
              <select
                className="admin-input"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((r) => ({ ...r, rating: e.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
              <input
                className="admin-input"
                placeholder="Title (optional)"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((r) => ({ ...r, title: e.target.value }))}
              />
              <textarea
                className="admin-input min-h-[5rem]"
                placeholder="Review comment"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((r) => ({ ...r, body: e.target.value }))}
              />
              <button type="button" className="admin-btn-gold w-full" disabled={isNew} onClick={addReview}>
                Add review
              </button>
            </div>

            <ul className="max-h-80 space-y-4 overflow-y-auto">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-admin-border pb-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-admin-gold">
                      {r.rating}/5 · {r.author_name}
                    </span>
                    <span
                      className={
                        r.status === 'approved' ? 'admin-pill admin-pill-live' : 'admin-pill admin-pill-hidden'
                      }
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-2 text-admin-muted">{r.body}</p>
                  {r.status === 'approved' ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-400"
                      onClick={() => patchReview(r.id, 'rejected').then(load)}
                    >
                      Hide from store
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mt-2 text-xs text-green-400"
                      onClick={() => patchReview(r.id, 'approved').then(load)}
                    >
                      Approve
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: product fields */}
        <div className="flex flex-col gap-6">
          <section className="admin-panel space-y-4 p-5">
            <label className="block">
              <span className="admin-field-label">Product name</span>
              <input className="admin-input mt-1" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            <label className="block">
              <span className="admin-field-label">Short description</span>
              <textarea
                className="admin-input mt-1 min-h-[4rem]"
                value={form.shortStory}
                onChange={(e) => set('shortStory', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="admin-field-label">Detailed description</span>
              <textarea
                className="admin-input mt-1 min-h-[10rem] font-mono text-xs"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="admin-field-label">Price (₹)</span>
                <input
                  type="number"
                  className="admin-input mt-1"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="admin-field-label">Compare at (₹)</span>
                <input
                  type="number"
                  className="admin-input mt-1"
                  value={form.compareAtPrice}
                  onChange={(e) => set('compareAtPrice', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="admin-field-label">Stock</span>
                <input
                  type="number"
                  className="admin-input mt-1"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="admin-field-label">Collection</span>
                <select
                  className="admin-input mt-1"
                  value={form.collection}
                  onChange={(e) => set('collection', e.target.value)}
                >
                  {collections.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="admin-panel space-y-4 p-5">
            <p className="admin-field-label">Product details (Material / Size / Care / Shipping on the store)</p>
            {[
              ['material', 'Material'],
              ['size', 'Size'],
              ['care', 'Care'],
              ['shipping', 'Shipping'],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="admin-field-label">{label}</span>
                <textarea
                  className="admin-input mt-1 min-h-[3.5rem]"
                  value={form.details[key]}
                  onChange={(e) => set('details', { ...form.details, [key]: e.target.value })}
                />
              </label>
            ))}
          </section>

          <section className="admin-panel p-5">
            <p className="admin-field-label mb-3">Key benefits</p>
            <div className="flex gap-2">
              <input
                className="admin-input flex-1"
                placeholder="Add benefit"
                value={benefitDraft}
                onChange={(e) => setBenefitDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <button type="button" className="admin-btn-ghost shrink-0" onClick={addBenefit}>
                Add
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {form.benefits.map((b, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span>{b}</span>
                  <button
                    type="button"
                    className="text-xs text-red-400"
                    onClick={() =>
                      setForm((f) => ({ ...f, benefits: f.benefits.filter((_, j) => j !== i) }))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="admin-field-label">Size / pack options</p>
              <button type="button" className="admin-btn-ghost text-xs" onClick={addPackOption}>
                Add option
              </button>
            </div>
            {form.packOptions.map((opt, i) => (
              <div key={i} className="mb-4 space-y-2 rounded-lg border border-admin-border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="admin-input"
                    placeholder="Size (e.g. Set of 4)"
                    value={opt.size}
                    onChange={(e) => {
                      const next = [...form.packOptions]
                      next[i] = { ...next[i], size: e.target.value }
                      set('packOptions', next)
                    }}
                  />
                  <input
                    className="admin-input"
                    placeholder="Badge"
                    value={opt.badge}
                    onChange={(e) => {
                      const next = [...form.packOptions]
                      next[i] = { ...next[i], badge: e.target.value }
                      set('packOptions', next)
                    }}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Price"
                    value={opt.price}
                    onChange={(e) => {
                      const next = [...form.packOptions]
                      next[i] = { ...next[i], price: e.target.value }
                      set('packOptions', next)
                    }}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Compare at"
                    value={opt.compareAtPrice}
                    onChange={(e) => {
                      const next = [...form.packOptions]
                      next[i] = { ...next[i], compareAtPrice: e.target.value }
                      set('packOptions', next)
                    }}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Stock"
                    value={opt.stock}
                    onChange={(e) => {
                      const next = [...form.packOptions]
                      next[i] = { ...next[i], stock: e.target.value }
                      set('packOptions', next)
                    }}
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-admin-muted">
                  <input
                    type="radio"
                    name="defaultPack"
                    checked={opt.isDefault}
                    onChange={() => {
                      const next = form.packOptions.map((o, j) => ({ ...o, isDefault: j === i }))
                      set('packOptions', next)
                    }}
                  />
                  Default option
                </label>
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() => set('packOptions', form.packOptions.filter((_, j) => j !== i))}
                >
                  Remove option
                </button>
              </div>
            ))}
          </section>

          <section className="admin-panel space-y-3 p-5">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
                className="h-4 w-4 accent-[var(--color-admin-gold)]"
              />
              <span className="text-sm text-admin-text">Published on store</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 accent-[var(--color-admin-gold)]"
              />
              <span className="text-sm text-admin-text">Featured (home page and top of listings)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => set('isNew', e.target.checked)}
                className="h-4 w-4 accent-[var(--color-admin-gold)]"
              />
              <span className="text-sm text-admin-text">Show “New” badge</span>
            </label>
            <button type="button" className="admin-btn-gold w-full py-3" disabled={saving} onClick={onSave}>
              {saving ? 'Saving…' : isNew ? 'Create product' : 'Save product'}
            </button>
            {saveNote && (
              <p className={saveNote.ok ? 'text-sm text-green-400' : 'text-sm text-red-400'} role="status">
                {saveNote.text}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
