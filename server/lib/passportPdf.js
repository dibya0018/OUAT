import PDFDocument from 'pdfkit'

/*
 * Bottle passport as a PDF: one A4 page per passport, same layout as the email and /passport page.
 * Uses PDFKit's built-in fonts (Times for the serif headlines, Helvetica, Courier for IDs and dates).
 */

const C = {
  bg: '#f4f0e4',
  line: '#e4ddc9',
  green: '#2c4430',
  sage: '#4d694e',
  ink: '#2d2d2d',
  muted: '#6b6b6b',
  stamp: '#b8582f',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

/** Round "Rescued" stamp with the village name running around the ring. */
function drawStamp(doc, cx, cy, village, date) {
  doc.save()
  doc.lineWidth(2).strokeColor(C.stamp).circle(cx, cy, 50).stroke()
  doc.lineWidth(0.8).circle(cx, cy, 35).stroke()

  // Repeat the village name until it fills the ring evenly.
  const unit = `${village} · `.toUpperCase()
  const ring = unit.repeat(Math.max(2, Math.round(46 / unit.length)))
  doc.font('Helvetica').fontSize(7).fillColor(C.stamp)
  const step = 360 / ring.length
  for (let i = 0; i < ring.length; i++) {
    const ch = ring[i]
    const w = doc.widthOfString(ch)
    doc.save()
    doc.translate(cx, cy).rotate(i * step)
    doc.text(ch, -w / 2, -46.5, { lineBreak: false })
    doc.restore()
  }

  doc.font('Times-Italic').fontSize(14).fillColor(C.stamp)
  doc.text('Rescued', cx - 35, cy - 10, { width: 70, align: 'center', lineBreak: false })
  doc.font('Helvetica').fontSize(6.5)
  doc.text(date, cx - 35, cy + 6, { width: 70, align: 'center', lineBreak: false })
  doc.restore()
}

function label(doc, text, x, y, width) {
  doc.font('Helvetica').fontSize(8).fillColor(C.muted).text(text, x, y, { width })
}

function drawPassportPage(doc, p) {
  const W = doc.page.width
  const left = 50
  const right = W - 50

  // Page header
  doc.font('Times-Roman').fontSize(20).fillColor(C.green).text('O.U.A.T.', left, 40, { lineBreak: false })
  doc.font('Helvetica').fontSize(9).fillColor(C.sage).text('Once Upon A Time · Goa', left, 47, { width: right - left, align: 'right' })

  // Card
  const top = 78
  const bottom = doc.page.height - 60
  doc.roundedRect(left, top, right - left, bottom - top, 10).lineWidth(1).strokeColor(C.line).stroke()

  const x = left + 26
  const width = right - left - 52
  let y = top + 26

  // Title block + stamp
  label(doc, 'Bottle passport', x, y)
  doc.font('Courier').fontSize(12).fillColor(C.sage).text(p.id, x, y + 13)
  doc.font('Times-Roman').fontSize(28).fillColor(C.green).text(p.headline, x, y + 36, { width: width - 130, lineGap: 2 })
  drawStamp(doc, x + width - 52, y + 52, p.village, formatDate(p.rescuedOn))
  y = Math.max(doc.y, y + 110) + 18

  // Once upon a time → Now
  const colW = (width - 40) / 2
  label(doc, 'Once upon a time', x, y)
  doc.font('Times-Roman').fontSize(15).fillColor(C.green).text(p.was, x, y + 12, { width: colW })
  const ax = x + colW + 8
  const ay = y + 20
  doc.save().lineWidth(1).strokeColor(C.stamp).moveTo(ax, ay).lineTo(ax + 22, ay).stroke()
  doc.moveTo(ax + 22, ay).lineTo(ax + 17, ay - 3.5).lineTo(ax + 17, ay + 3.5).closePath().fill(C.stamp).restore()
  label(doc, 'Now', x + colW + 40, y)
  doc
    .font('Times-Roman')
    .fontSize(15)
    .fillColor(C.green)
    .text(p.quantity > 1 ? `${p.now} × ${p.quantity}` : p.now, x + colW + 40, y + 12, { width: colW })
  y += 50

  // Thank-you paragraph, with the bottle and village in italic green
  doc.font('Times-Roman').fontSize(12.5).fillColor(C.ink)
  const para = { width, lineGap: 3.5, continued: true }
  doc.text('Thank you for your order. This ', x, y, para)
  doc.font('Times-Italic').fillColor(C.sage).text(p.was.toLowerCase(), para)
  doc.font('Times-Roman').fillColor(C.ink).text(' was rescued in ', para)
  doc.font('Times-Italic').fillColor(C.sage).text(p.village, para)
  doc
    .font('Times-Roman')
    .fillColor(C.ink)
    .text(
      ` and given a second life as your ${p.now.toLowerCase()}. By choosing reclaimed glass you kept one more bottle out of landfill and off Goa's roadsides and beaches. Every bottle has a past. Thank you for giving this one a future.`,
      { width, lineGap: 3.5, continued: false },
    )
  y = doc.y + 18

  // Rescued in / Rescue date
  const half = (width - 20) / 2
  doc.lineWidth(0.8).strokeColor(C.line)
  doc.moveTo(x, y).lineTo(x + half, y).stroke()
  doc.moveTo(x + half + 20, y).lineTo(x + width, y).stroke()
  label(doc, 'Rescued in', x, y + 8)
  label(doc, 'Rescue date', x + half + 20, y + 8)
  doc.font('Helvetica').fontSize(11).fillColor(C.ink)
  doc.text(p.village, x, y + 21)
  doc.text(formatDate(p.rescuedOn), x + half + 20, y + 21)
  y += 52

  // Two columns: journey (left) | made by, landfill, villages (right)
  const colGap = 26
  const lw = (width - colGap) * 0.52
  const rx = x + lw + colGap
  const rw = width - lw - colGap

  doc.font('Times-Roman').fontSize(17).fillColor(C.green).text('Its journey', x, y)
  let ly = y + 30
  for (const s of p.journey) {
    doc.lineWidth(1.2).strokeColor(C.green).circle(x + 4, ly + 5, 4).stroke()
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.green).text(s.title, x + 16, ly, { width: lw - 16 })
    doc.font('Helvetica').fontSize(9.5).fillColor(C.ink).text(s.text, x + 16, doc.y + 2, { width: lw - 16, lineGap: 1 })
    doc.font('Courier').fontSize(9).fillColor(C.muted).text(formatDate(s.date), x + 16, doc.y + 3)
    ly = doc.y + 14
  }

  doc.font('Times-Roman').fontSize(17).fillColor(C.green).text('Made by', rx, y)
  let ry = y + 30
  doc.circle(rx + 16, ry + 16, 16).fill(C.bg)
  doc.font('Times-Roman').fontSize(15).fillColor(C.green).text(p.artisan.name.charAt(0), rx, ry + 8, { width: 32, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.green).text(p.artisan.name, rx + 42, ry + 2, { width: rw - 42 })
  doc.font('Helvetica').fontSize(9.5).fillColor(C.ink).text(`${p.artisan.role}, ${p.artisan.studio}`, rx + 42, doc.y + 2, { width: rw - 42 })
  ry = Math.max(doc.y, ry + 32) + 16

  const kept = p.keptOut === 1 ? '1 bottle kept out of landfill' : `${p.keptOut} bottles kept out of landfill`
  const more = `Plus ${Math.max(0, p.villageTotal - p.keptOut)} more rescued in ${p.village} so far.`
  doc.font('Times-Roman').fontSize(15)
  const keptH = doc.heightOfString(kept, { width: rw - 28 })
  doc.font('Helvetica').fontSize(9.5)
  const moreH = doc.heightOfString(more, { width: rw - 28 })
  const boxH = keptH + moreH + 30
  doc.roundedRect(rx, ry, rw, boxH, 6).fill(C.bg)
  doc.font('Times-Roman').fontSize(15).fillColor(C.green).text(kept, rx + 14, ry + 12, { width: rw - 28 })
  doc.font('Helvetica').fontSize(9.5).fillColor(C.ink).text(more, rx + 14, doc.y + 4, { width: rw - 28 })
  ry += boxH + 20

  doc.font('Times-Roman').fontSize(15).fillColor(C.green).text('Where our bottles come from', rx, ry, { width: rw })
  ry = doc.y + 8
  for (const v of p.villages) {
    const mine = v.name === p.village
    doc.lineWidth(0.6).strokeColor(C.line).moveTo(rx, ry).lineTo(rx + rw, ry).stroke()
    doc.font(mine ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(mine ? C.green : C.ink).text(v.name, rx, ry + 6)
    doc.font('Helvetica').fontSize(9).fillColor(C.muted).text(`${v.bottles} bottles`, rx, ry + 7, { width: rw, align: 'right' })
    ry += 22
  }

  // Link (clickable) and footnote, at the bottom of the card
  const fy = bottom - 46
  doc.lineWidth(0.8).strokeColor(C.line).moveTo(x, fy - 10).lineTo(x + width, fy - 10).stroke()
  label(doc, 'Passport link', x, fy)
  doc.font('Courier').fontSize(9.5).fillColor(C.sage).text(p.url, x, fy + 12, { width, link: p.url, underline: true })

  if (p.isSample) {
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(C.muted)
      .text(
        'Village, maker and dates are illustrative while we finish recording each batch. Every piece is made from a bottle rescued in Goa.',
        left,
        doc.page.height - 45,
        { width: right - left, align: 'center', lineBreak: true },
      )
  }
}

/**
 * Render one or more passports into a single PDF (one page each).
 * @param {ReturnType<import('./passport.js').buildPassport>[]} passports
 * @returns {Promise<Buffer>}
 */
export function renderPassportPdf(passports) {
  return new Promise((resolve, reject) => {
    const title = passports.length === 1 ? `Bottle passport ${passports[0].id}` : 'Bottle passports'
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false, info: { Title: title, Author: 'O.U.A.T.' } })
    const chunks = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    for (const p of passports) {
      doc.addPage({ size: 'A4', margin: 0 })
      drawPassportPage(doc, p)
    }
    doc.end()
  })
}
