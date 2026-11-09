import { Router } from 'express'
import { getPublicPassport } from '../lib/passport.js'
import { renderPassportPdf } from '../lib/passportPdf.js'

const router = Router()

/** Public bottle passport (no customer details). */
router.get('/passport/:id', async (req, res, next) => {
  try {
    const passport = await getPublicPassport(req.params.id)
    if (!passport) return res.status(404).json({ ok: false, error: 'Passport not found' })
    res.json({ ok: true, passport })
  } catch (err) {
    next(err)
  }
})

/** The same passport as a printable PDF. */
router.get('/passport/:id/pdf', async (req, res, next) => {
  try {
    const passport = await getPublicPassport(req.params.id)
    if (!passport) return res.status(404).json({ ok: false, error: 'Passport not found' })
    const pdf = await renderPassportPdf([passport])
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${req.query.download ? 'attachment' : 'inline'}; filename="OUAT-bottle-passport-${passport.id}.pdf"`,
      'Cache-Control': 'public, max-age=300',
    })
    res.send(pdf)
  } catch (err) {
    next(err)
  }
})

/** Public bottle passport SVG stamp (same as website). */
router.get('/passport-stamp/:village.svg', (req, res) => {
  const rawVillage = req.params.village || 'Goa'
  const village = rawVillage.replace(/[-_]/g, ' ').toUpperCase()
  const ring = `${village} · ${village} · ${village} · `
  const STAMP = '#b8582f'
  const SERIF = "Georgia, 'Times New Roman', Times, serif"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="140" height="140">
  <defs>
    <path id="stamp-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
  </defs>
  <circle cx="60" cy="60" r="56" fill="none" stroke="${STAMP}" stroke-width="2.5" />
  <circle cx="60" cy="60" r="34" fill="none" stroke="${STAMP}" stroke-width="1" />
  <text fill="${STAMP}" font-size="8.5" font-family="Helvetica, Arial, sans-serif">
    <textPath href="#stamp-ring" textLength="272" lengthAdjust="spacing">
      ${ring}
    </textPath>
  </text>
  <text x="60" y="65" text-anchor="middle" fill="${STAMP}" font-size="16" font-style="italic" font-family="${SERIF}">
    Rescued
  </text>
</svg>`
  res.set({
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400',
  })
  res.send(svg)
})

export default router
