import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Container from '../ui/Container'
import Icon from '../ui/Icon'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import PriceTag from '../product/PriceTag'
import { getProducts } from '../../services/productService'

const MAX_RESULTS = 6

/** Header search: a magnifier that opens a panel with live product results. */
export default function HeaderSearch({ onOpen }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState('') // the query `results` belongs to
  const inputRef = useRef(null)
  const buttonRef = useRef(null)

  const term = query.trim()
  const loading = term.length >= 2 && searched !== term

  const close = () => {
    setOpen(false)
    setQuery('')
    setResults([])
    setSearched('')
  }

  // Close when the visitor follows a result (or navigates any other way).
  const [seenPath, setSeenPath] = useState(pathname)
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    if (open) close()
  }

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const trigger = buttonRef.current
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      trigger?.focus()
    }
  }, [open])

  // Search a moment after the visitor stops typing.
  useEffect(() => {
    if (term.length < 2) return
    let cancelled = false
    const timer = setTimeout(() => {
      getProducts({ q: term, limit: MAX_RESULTS })
        .then((list) => {
          if (cancelled) return
          setResults(list ?? [])
          setSearched(term)
        })
        .catch(() => {
          if (cancelled) return
          setResults([])
          setSearched(term)
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [term])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          onOpen?.()
          setOpen(true)
        }}
        className="inline-flex h-10 w-10 items-center justify-center"
        aria-label="Search products"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon name="search" size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 text-ink" role="dialog" aria-modal="true" aria-label="Search products">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close search"
            className="absolute inset-0 bg-ink/30"
            onClick={close}
          />
          <div className="relative max-h-dvh overflow-y-auto border-b border-line bg-white pt-[env(safe-area-inset-top,0px)]">
            <Container>
              <form
                role="search"
                className="flex h-14 items-center gap-3 md:h-20"
                onSubmit={(e) => e.preventDefault()}
              >
                <Icon name="search" size={22} className="shrink-0 text-primary" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search candles, sippers, jars…"
                  aria-label="Search products"
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent font-sans text-base placeholder:text-ink/40 focus:outline-none md:text-lg [&::-webkit-search-cancel-button]:hidden"
                />
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-primary"
                  aria-label="Close search"
                >
                  <Icon name="close" size={22} />
                </button>
              </form>

              <div aria-live="polite">
                {term.length >= 2 && (
                  <div className="border-t border-line py-6">
                    {loading ? (
                      <p className="text-sm text-ink-soft">Searching…</p>
                    ) : results.length === 0 ? (
                      <p className="text-sm text-ink-soft">
                        Nothing found for “{term}”.{' '}
                        <Link to="/shop" className="link-underline text-primary">
                          Browse all pieces
                        </Link>
                      </p>
                    ) : (
                      <ul className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map((product) => (
                          <li key={product.id}>
                            <Link to={`/product/${product.slug}`} className="group flex items-center gap-4">
                              <span className="w-16 shrink-0">
                                <ImagePlaceholder
                                  src={product.images?.[0]?.src}
                                  alt=""
                                  tone={product.images?.[0]?.tone}
                                  ratio="square"
                                />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-display text-base text-ink group-hover:text-primary">
                                  {product.name}
                                </span>
                                <span className="mt-0.5 block text-sm tabular-nums text-ink-soft">
                                  <PriceTag product={product} />
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </Container>
          </div>
        </div>
      )}
    </>
  )
}
