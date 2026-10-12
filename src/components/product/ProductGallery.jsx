import { useState } from 'react'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import { cx } from '../../lib/format'

/**
 * Product gallery: one large 4:5 image with thumbnails beneath.
 * On small screens the thumbnails become a horizontal strip.
 */
export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="zoom-media">
        <ImagePlaceholder
          key={active}
          ratio="product"
          src={current?.src}
          alt={current?.alt ?? name}
          tone={current?.tone}
          label={name}
          priority
        />
      </div>

      {images.length > 1 && (
        <ul
          className="flex gap-3 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]"
          aria-label="Product images"
        >
          {images.map((img, i) => (
            <li key={img.alt + i} className="w-20 shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}: ${img.alt}`}
                aria-current={i === active ? 'true' : undefined}
                className={cx(
                  'block w-full border transition-colors duration-200',
                  i === active ? 'border-primary' : 'border-transparent hover:border-line',
                )}
              >
                <ImagePlaceholder ratio="product" src={img.src} alt="" tone={img.tone} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
