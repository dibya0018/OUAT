import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import { apiBase, apiGet } from '../lib/api'

const SERIF = { fontFamily: "Georgia, 'Times New Roman', Times, serif" }
const STAMP = '#b8582f'
const GREEN = '#2c4430'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Stamp({ village, date }) {
  const ring = `${village} · ${village} · ${village} · `.toUpperCase()
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0 -rotate-6 sm:h-28 sm:w-28" role="img" aria-label={`Rescued in ${village}, ${date}`}>
      <defs>
        <path id="stamp-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke={STAMP} strokeWidth="2.5" />
      <circle cx="60" cy="60" r="34" fill="none" stroke={STAMP} strokeWidth="1" />
      <text fill={STAMP} fontSize="8.5" fontFamily="Helvetica, Arial, sans-serif">
        {/* Stretch the repeated village name to wrap the whole ring (circumference ≈ 276). */}
        <textPath href="#stamp-ring" textLength="272" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      <text x="60" y="60" textAnchor="middle" fill={STAMP} fontSize="15" fontStyle="italic" style={SERIF}>
        Rescued
      </text>
      <text x="60" y="74" textAnchor="middle" fill={STAMP} fontSize="7.5" fontFamily="Helvetica, Arial, sans-serif">
        {date}
      </text>
    </svg>
  )
}

function Label({ children }) {
  return <p className="text-xs tracking-wide text-ink-soft">{children}</p>
}

function Heading({ children }) {
  return (
    <h2 className="mt-10 mb-4 text-2xl" style={{ ...SERIF, color: GREEN }}>
      {children}
    </h2>
  )
}

export default function PassportPage() {
  const { passportId } = useParams()
  const [state, setState] = useState({ status: 'loading' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let live = true
    apiGet(`/passport/${encodeURIComponent(passportId)}`)
      .then((data) => live && setState({ status: 'ok', passport: data.passport }))
      .catch(() => live && setState({ status: 'missing' }))
    return () => {
      live = false
    }
  }, [passportId])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this passport link', window.location.href)
    }
  }

  if (state.status === 'loading') {
    return <section className="flex min-h-[60vh] items-center justify-center text-ink-soft">Opening passport…</section>
  }

  if (state.status === 'missing') {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <Seo title="Passport not found" path={`/passport/${passportId}`} noIndex />
        <p className="eyebrow">Bottle passport</p>
        <h1 className="mt-6 text-3xl" style={{ ...SERIF, color: GREEN }}>
          We couldn’t find passport {passportId}.
        </h1>
        <p className="mt-4 text-ink-soft">Check the link in your passport email, or get in touch and we’ll find it for you.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button to="/shop">Shop the collection</Button>
          <Button to="/contact" variant="outline">
            Contact us
          </Button>
        </div>
      </section>
    )
  }

  const p = state.passport

  return (
    <section className="bg-sand px-4 py-10 sm:py-16">
      <Seo title={`Bottle passport ${p.id}`} description={p.headline} path={`/passport/${p.id}`} noIndex />
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-2xl" style={{ ...SERIF, color: GREEN }}>
            O.U.A.T.
          </span>
          <span className="text-xs text-primary">Once Upon A Time · Goa</span>
        </div>

        <article className="rounded-xl border border-line bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Label>Bottle passport</Label>
              <p className="mt-1 font-mono text-primary">{p.id}</p>
              <h1 className="mt-4 text-3xl leading-tight sm:text-4xl" style={{ ...SERIF, color: GREEN }}>
                {p.headline}
              </h1>
            </div>
            <Stamp village={p.village} date={formatDate(p.rescuedOn)} />
          </div>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <Label>Once upon a time</Label>
              <p className="mt-1 text-lg" style={{ ...SERIF, color: GREEN }}>
                {p.was}
              </p>
            </div>
            <span className="pb-1 text-lg" style={{ color: STAMP }} aria-hidden="true">
              →
            </span>
            <div>
              <Label>Now</Label>
              <p className="mt-1 text-lg" style={{ ...SERIF, color: GREEN }}>
                {p.now}
                {p.quantity > 1 && <span className="ml-1 text-sm text-ink-soft">× {p.quantity}</span>}
              </p>
            </div>
          </div>

          <p className="mt-8 text-lg leading-relaxed text-ink" style={SERIF}>
            Thank you for your order. This <em className="text-primary">{p.was.toLowerCase()}</em> was rescued in{' '}
            <em className="text-primary">{p.village}</em> and given a second life as your {p.now.toLowerCase()}. By choosing
            reclaimed glass you kept one more bottle out of landfill and off Goa’s roadsides and beaches. Every bottle has a
            past. Thank you for giving this one a future.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="border-t border-line pt-3">
              <Label>Rescued in</Label>
              <p className="mt-1">{p.village}</p>
            </div>
            <div className="border-t border-line pt-3">
              <Label>Rescue date</Label>
              <p className="mt-1">{formatDate(p.rescuedOn)}</p>
            </div>
          </div>

          <Heading>Where our bottles come from</Heading>
          <ul>
            {p.villages.map((v) => (
              <li
                key={v.name}
                className="flex justify-between border-t border-line py-2.5"
                style={v.name === p.village ? { color: GREEN, fontWeight: 600 } : undefined}
              >
                <span>{v.name}</span>
                <span className="text-sm font-normal text-ink-soft">{v.bottles} bottles</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-md border border-primary px-4 py-2 text-sm text-primary transition-colors hover:bg-primary hover:text-cream"
            >
              {copied ? 'Link copied' : 'Copy passport link'}
            </button>
            <a
              href={`${apiBase()}/passport/${encodeURIComponent(p.id)}/pdf?download=1`}
              className="rounded-md border border-primary px-4 py-2 text-sm text-primary transition-colors hover:bg-primary hover:text-cream"
            >
              Download PDF
            </a>
          </div>

          <p className="mt-10 border-t border-line pt-6 text-center text-lg italic" style={{ ...SERIF, color: GREEN }}>
            Small choices. Lighter footprints. A kinder planet.
          </p>
        </article>

        {p.isSample && (
          <p className="mt-6 text-center text-xs text-ink-soft">
            Village and dates are illustrative while we finish recording each batch. Every piece is made from a bottle
            rescued in Goa.
          </p>
        )}
      </div>
    </section>
  )
}
