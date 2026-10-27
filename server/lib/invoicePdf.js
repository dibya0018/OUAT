import PDFDocument from 'pdfkit'

/* PDFKit's built-in fonts have no ₹ glyph, so amounts are printed as "Rs." */
const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`

const GREEN = '#2c4430'
const MUTED = '#6b6b6b'
const LINE = '#d9d3c2'

/**
 * Render the invoice for an order as a PDF.
 * @param {ReturnType<import('./orderEmails.js').loadOrderForEmail> extends Promise<infer T> ? T : never} order
 * @returns {Promise<Buffer>}
 */
export function renderInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Invoice ${order.orderNumber}`, Author: 'O.U.A.T.' } })
    const chunks = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const left = 50
    const right = doc.page.width - 50
    const width = right - left

    // Header
    doc.font('Times-Roman').fontSize(26).fillColor(GREEN).text('O.U.A.T.', left, 50)
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text('Once Upon A Time · Goa · ouatworld.com', left, 82)
    if (process.env.SELLER_GSTIN) doc.text(`GSTIN ${process.env.SELLER_GSTIN}`, left, 95)
    doc.font('Helvetica-Bold').fontSize(16).fillColor(GREEN).text('Invoice', left, 50, { width, align: 'right' })
    doc.font('Helvetica').fontSize(9).fillColor('#2d2d2d')
    doc.text(`Invoice no. ${order.orderNumber}`, left, 72, { width, align: 'right' })
    doc.text(`Date ${order.dateLabel}`, left, 85, { width, align: 'right' })
    doc.text(`Payment ${order.paymentLabel}`, left, 98, { width, align: 'right' })

    doc.moveTo(left, 120).lineTo(right, 120).strokeColor(LINE).stroke()

    // Bill to / ship to
    let y = 135
    doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED).text('BILL TO / SHIP TO', left, y)
    y += 14
    doc.font('Helvetica').fontSize(10).fillColor('#2d2d2d')
    const addressLines = [order.customerName, ...order.addressLines, order.customerPhone, order.customerEmail].filter(Boolean)
    doc.text(addressLines.join('\n'), left, y, { width: width / 2 })
    y = Math.max(doc.y, y) + 20

    // Items table
    const cols = { item: left, qty: left + width * 0.58, price: left + width * 0.7, amount: left + width * 0.84 }
    doc.rect(left, y, width, 20).fill('#f4f0e4')
    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(9)
    doc.text('Item', cols.item + 6, y + 6)
    doc.text('Qty', cols.qty, y + 6, { width: 40, align: 'right' })
    doc.text('Price', cols.price, y + 6, { width: 60, align: 'right' })
    doc.text('Amount', cols.amount, y + 6, { width: right - cols.amount - 6, align: 'right' })
    y += 26

    doc.font('Helvetica').fontSize(10).fillColor('#2d2d2d')
    for (const it of order.items) {
      const h = doc.heightOfString(it.name, { width: cols.qty - cols.item - 16 })
      if (y + h > doc.page.height - 120) {
        doc.addPage()
        y = 50
      }
      doc.text(it.name, cols.item + 6, y, { width: cols.qty - cols.item - 16 })
      doc.text(String(it.qty), cols.qty, y, { width: 40, align: 'right' })
      doc.text(money(it.unitPrice), cols.price, y, { width: 60, align: 'right' })
      doc.text(money(it.lineTotal), cols.amount, y, { width: right - cols.amount - 6, align: 'right' })
      y += Math.max(h, 12) + 8
      doc.moveTo(left, y - 4).lineTo(right, y - 4).strokeColor(LINE).lineWidth(0.5).stroke()
    }

    // Totals
    y += 6
    const totalRow = (label, value, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 10).fillColor(bold ? GREEN : '#2d2d2d')
      doc.text(label, cols.price - 80, y, { width: 140, align: 'right' })
      doc.text(value, cols.amount, y, { width: right - cols.amount - 6, align: 'right' })
      y += bold ? 18 : 15
    }
    totalRow('Subtotal', money(order.subtotal))
    if (order.discount > 0) totalRow(`Coupon ${order.couponCode ?? ''}`.trim(), `- ${money(order.discount)}`)
    totalRow('Shipping', 'Free')
    totalRow(order.paymentMethod === 'cod' ? 'Total (pay on delivery)' : 'Total paid', money(order.total), true)

    if (order.razorpayPaymentId) {
      y += 4
      doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(`Razorpay payment ID ${order.razorpayPaymentId}`, left, y, { width, align: 'right' })
    }

    // Footer
    doc.font('Helvetica').fontSize(8).fillColor(MUTED)
    doc.text(
      'Thank you for choosing reclaimed glass. Every piece is hand-cut from a bottle rescued in Goa. Prices include all taxes.',
      left,
      doc.page.height - 90,
      { width, align: 'center' },
    )
    doc.end()
  })
}
