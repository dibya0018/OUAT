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

export default router
