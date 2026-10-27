import { query } from '../config/db.js'
import { isMailConfigured, sendMail } from './mailer.js'
import { renderInvoicePdf } from './invoicePdf.js'
import { renderPassportPdf } from './passportPdf.js'
import { passportsForOrder, siteUrl } from './passport.js'

/*
 * Order emails: a confirmation with the invoice (PDF attached) and a bottle passport email.
 * Each is sent once per order; the state lives in orders.shipping_json:
 *   orderEmail / passportEmail: 'sending' | 'sent' | 'failed', plus *At and *Error.
 * Sending never throws into the checkout: failures are logged and recorded.
 */

const C = {
  bg: '#f4f0e4',
  card: '#ffffff',
  line: '#e4ddc9',
  green: '#2c4430',
  sage: '#4d694e',
  ink: '#2d2d2d',
  muted: '#6b6b6b',
  stamp: '#b8582f',
}
const SERIF = "Georgia, 'Times New Roman', Times, serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'Courier New', Courier, monospace"

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

function parseJson(value, fallback) {
  if (value == null) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

/** Everything the emails and the invoice need about one order. */
export async function loadOrderForEmail(orderId) {
  const [o] = await query(
    `SELECT id, order_number, customer_email, customer_name, customer_phone, total, status,
            payment_method, razorpay_payment_id, shipping_json, created_at
     FROM orders WHERE id = :id LIMIT 1`,
    { id: orderId },
  )
  if (!o) return null
  const rows = await query(
    'SELECT id, product_name, quantity, unit_price FROM order_items WHERE order_id = :id ORDER BY id',
    { id: orderId },
  )
  const shipping = parseJson(o.shipping_json, {}) ?? {}
  const items = rows.map((r) => ({
    id: r.id,
    name: r.product_name,
    qty: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    lineTotal: Number(r.quantity) * Number(r.unit_price),
  }))
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  const total = Number(o.total)
  const isCod = o.payment_method === 'cod'
  return {
    id: o.id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone ?? '',
    status: o.status,
    paymentMethod: o.payment_method,
    paymentLabel: isCod ? 'Cash on delivery' : 'Paid online (Razorpay)',
    razorpayPaymentId: o.razorpay_payment_id ?? null,
    isConfirmed: isCod || Boolean(o.razorpay_payment_id),
    createdAt: o.created_at,
    dateLabel: formatDate(o.created_at),
    items,
    subtotal,
    discount: Math.max(0, subtotal - total),
    couponCode: shipping.couponCode ?? null,
    total,
    giftNote: shipping.giftNote ?? '',
    giftItems: Array.isArray(shipping.giftItems) ? shipping.giftItems : [],
    addressLines: [
      shipping.line1,
      shipping.line2,
      [shipping.city, shipping.state].filter(Boolean).join(', '),
      shipping.pincode,
    ].filter((l) => l && String(l).trim()),
    shipping,
  }
}

/* ------------------------------------------------------------------ */
/* Shared email shell                                                  */
/* ------------------------------------------------------------------ */

function shell({ title, preheader, body }) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(title)}</title>
<style>
  body { margin:0; padding:0; }
  table { border-collapse:collapse; }
  img { border:0; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .stack { display:block !important; width:100% !important; }
    .stamp-cell { padding-top:16px !important; text-align:left !important; }
    .h1 { font-size:30px !important; line-height:36px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td class="pad" style="padding:8px 28px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${SERIF};font-size:24px;color:${C.green};">O.U.A.T.</td>
      <td align="right" style="font-family:${SANS};font-size:12px;color:${C.sage};">Once Upon A Time &middot; Goa</td>
    </tr></table>
  </td></tr>
  ${body}
  <tr><td class="pad" style="padding:20px 28px;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};text-align:center;">
    Questions about your order? Just reply to this email.<br>
    <a href="${siteUrl()}" style="color:${C.sage};">ouatworld.com</a> &middot; Reclaimed glass, cut by hand in Goa
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function card(inner) {
  return `<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:28px;">${inner}</td></tr></table>
</td></tr>`
}

const spacer = (h) => `<tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr>`
const label = (t) => `<div style="font-family:${SANS};font-size:11px;letter-spacing:0.4px;color:${C.muted};">${esc(t)}</div>`

function button(href, text) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
  <td style="border:1px solid ${C.sage};border-radius:6px;">
    <a href="${esc(href)}" style="display:inline-block;padding:10px 18px;font-family:${SANS};font-size:13px;color:${C.green};text-decoration:none;">${esc(text)}</a>
  </td></tr></table>`
}

/* ------------------------------------------------------------------ */
/* Order confirmation + invoice                                        */
/* ------------------------------------------------------------------ */

export function renderConfirmationEmail(order) {
  const first = String(order.customerName || '').trim().split(/\s+/)[0] || 'there'
  const itemRows = order.items
    .map(
      (i) => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;line-height:20px;color:${C.ink};">${esc(i.name)}${
        order.giftItems.includes(i.name) ? ` <span style="color:${C.stamp};font-size:12px;">(gift)</span>` : ''
      }<br><span style="font-size:12px;color:${C.muted};">${i.qty} &times; ${inr(i.unitPrice)}</span></td>
      <td align="right" valign="top" style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;">${inr(i.lineTotal)}</td>
    </tr>`,
    )
    .join('')

  const totalRow = (l, v, strong = false) => `<tr>
    <td style="padding:4px 0;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${strong ? C.green : C.ink};${strong ? 'font-weight:bold;' : ''}">${l}</td>
    <td align="right" style="padding:4px 0;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${strong ? C.green : C.ink};${strong ? 'font-weight:bold;' : ''}white-space:nowrap;">${v}</td>
  </tr>`

  const isCod = order.paymentMethod === 'cod'
  const payLine = isCod
    ? `Cash on delivery. Please keep ${inr(order.total)} ready when your parcel arrives.`
    : `Paid online via Razorpay${order.razorpayPaymentId ? ` (payment ID ${esc(order.razorpayPaymentId)})` : ''}.`

  const body = card(`
    ${label('Order confirmed')}
    <div style="font-family:${MONO};font-size:14px;color:${C.sage};padding-top:4px;">${esc(order.orderNumber)}</div>
    <h1 class="h1" style="margin:14px 0 0;font-family:${SERIF};font-weight:normal;font-size:34px;line-height:40px;color:${C.green};">Thank you, ${esc(first)}.</h1>
    <p style="margin:14px 0 0;font-family:${SERIF};font-size:17px;line-height:26px;color:${C.ink};">Your order is confirmed. Every piece in it was once a bottle in Goa, and we're now packing it by hand. We'll email you again when it ships.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;border-top:1px solid ${C.line};"><tr>
      <td class="stack" width="50%" valign="top" style="padding-top:12px;">${label('Order date')}<div style="font-family:${SANS};font-size:14px;color:${C.ink};padding-top:3px;">${esc(order.dateLabel)}</div></td>
      <td class="stack" width="50%" valign="top" style="padding-top:12px;">${label('Payment')}<div style="font-family:${SANS};font-size:14px;color:${C.ink};padding-top:3px;">${esc(order.paymentLabel)}</div></td>
    </tr></table>

    <h2 style="margin:28px 0 6px;font-family:${SERIF};font-weight:normal;font-size:22px;color:${C.green};">Your invoice</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${itemRows}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
      ${totalRow('Subtotal', inr(order.subtotal))}
      ${order.discount > 0 ? totalRow(`Coupon${order.couponCode ? ` <span style="font-family:${MONO};">${esc(order.couponCode)}</span>` : ''}`, `&minus;${inr(order.discount)}`) : ''}
      ${totalRow('Shipping', 'Free')}
      ${totalRow(isCod ? 'Total to pay on delivery' : 'Total paid', inr(order.total), true)}
    </table>
    <p style="margin:10px 0 0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};">${payLine} Prices include all taxes. A PDF copy of this invoice is attached.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid ${C.line};"><tr>
      <td class="stack" width="50%" valign="top" style="padding-top:12px;padding-right:12px;">
        ${label('Shipping to')}
        <div style="font-family:${SANS};font-size:14px;line-height:21px;color:${C.ink};padding-top:3px;">${[order.customerName, ...order.addressLines, order.customerPhone].filter(Boolean).map(esc).join('<br>')}</div>
      </td>
      <td class="stack" width="50%" valign="top" style="padding-top:12px;">
        ${order.giftNote ? `${label('Gift note')}<div style="font-family:${SERIF};font-style:italic;font-size:15px;line-height:22px;color:${C.ink};padding-top:3px;">&ldquo;${esc(order.giftNote)}&rdquo;</div>` : ''}
      </td>
    </tr></table>

    <p style="margin:24px 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${C.ink};">Look out for a second email: a <strong style="color:${C.green};">bottle passport</strong> for each piece, telling you where its glass came from.</p>
  `)

  const html = shell({
    title: `Order ${order.orderNumber} confirmed`,
    preheader: `Order ${order.orderNumber} is confirmed. Total ${inr(order.total)}. Invoice attached.`,
    body,
  })

  const text = [
    `Thank you, ${first}. Your O.U.A.T. order is confirmed.`,
    '',
    `Order: ${order.orderNumber}`,
    `Date: ${order.dateLabel}`,
    `Payment: ${order.paymentLabel}`,
    '',
    ...order.items.map((i) => `${i.name}  ${i.qty} x ${inr(i.unitPrice)} = ${inr(i.lineTotal)}`),
    '',
    `Subtotal: ${inr(order.subtotal)}`,
    ...(order.discount > 0 ? [`Coupon ${order.couponCode ?? ''}: -${inr(order.discount)}`] : []),
    'Shipping: Free',
    `${isCod ? 'Total to pay on delivery' : 'Total paid'}: ${inr(order.total)}`,
    '',
    'Shipping to:',
    ...[order.customerName, ...order.addressLines, order.customerPhone].filter(Boolean),
    ...(order.giftNote ? ['', `Gift note: "${order.giftNote}"`] : []),
    '',
    'The invoice is attached as a PDF. A bottle passport for each piece follows in a separate email.',
    siteUrl(),
  ].join('\n')

  return { subject: `Your O.U.A.T. order ${order.orderNumber} is confirmed`, html, text }
}

/* ------------------------------------------------------------------ */
/* Bottle passport                                                     */
/* ------------------------------------------------------------------ */

function stamp(p) {
  // Divs (not table cells) so border-radius works; Outlook desktop shows a square stamp, which is fine.
  return `<div style="width:100px;height:100px;border:2px solid ${C.stamp};border-radius:52px;margin-left:auto;">
    <div style="margin:7px;width:82px;height:82px;border:1px dashed ${C.stamp};border-radius:42px;text-align:center;font-family:${SANS};color:${C.stamp};">
      <div style="padding-top:20px;font-size:9px;line-height:12px;letter-spacing:1.5px;text-transform:uppercase;">${esc(p.village)}</div>
      <div style="font-family:${SERIF};font-style:italic;font-size:16px;line-height:20px;">Rescued</div>
      <div style="font-size:9px;line-height:12px;">${esc(formatDate(p.rescuedOn))}</div>
    </div>
  </div>`
}

function passportCard(p) {
  const nowLower = p.now.toLowerCase()
  const journey = p.journey
    .map(
      (s, i) => `<tr>
      <td width="22" valign="top" style="padding-top:5px;">
        <div style="width:9px;height:9px;border:1.5px solid ${C.green};border-radius:6px;font-size:0;line-height:0;">&nbsp;</div>
      </td>
      <td valign="top" style="padding-bottom:${i === p.journey.length - 1 ? 0 : 14}px;">
        <div style="font-family:${SANS};font-size:14px;font-weight:bold;color:${C.green};">${esc(s.title)}</div>
        <div style="font-family:${SANS};font-size:13px;line-height:19px;color:${C.ink};padding-top:2px;">${esc(s.text)}</div>
        <div style="font-family:${MONO};font-size:12px;color:${C.muted};padding-top:3px;">${esc(formatDate(s.date))}</div>
      </td>
    </tr>`,
    )
    .join('')

  const villages = p.villages
    .map((v) => {
      const mine = v.name === p.village
      return `<tr>
      <td style="padding:9px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${mine ? C.green : C.ink};${mine ? 'font-weight:bold;' : ''}">${esc(v.name)}</td>
      <td align="right" style="padding:9px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:13px;color:${C.muted};">${v.bottles} bottles</td>
    </tr>`
    })
    .join('')

  const kept = p.keptOut === 1 ? '1 bottle kept out of landfill' : `${p.keptOut} bottles kept out of landfill`
  const more = Math.max(0, p.villageTotal - p.keptOut)

  return card(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="stack" valign="top">
        ${label('Bottle passport')}
        <div style="font-family:${MONO};font-size:15px;color:${C.sage};padding-top:4px;">${esc(p.id)}</div>
        <h1 class="h1" style="margin:14px 0 0;font-family:${SERIF};font-weight:normal;font-size:34px;line-height:40px;color:${C.green};">${esc(p.headline)}</h1>
      </td>
      <td class="stack stamp-cell" width="112" valign="top" align="right" style="padding-left:8px;">${stamp(p)}</td>
    </tr></table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
      <td valign="top" width="45%">${label('Once upon a time')}<div style="font-family:${SERIF};font-size:18px;color:${C.green};padding-top:3px;">${esc(p.was)}</div></td>
      <td valign="middle" width="10%" align="center" style="font-family:${SANS};font-size:18px;color:${C.stamp};">&rarr;</td>
      <td valign="top" width="45%">${label('Now')}<div style="font-family:${SERIF};font-size:18px;color:${C.green};padding-top:3px;">${esc(p.now)}${p.quantity > 1 ? ` <span style="font-family:${SANS};font-size:13px;color:${C.muted};">&times; ${p.quantity}</span>` : ''}</div></td>
    </tr></table>

    <p style="margin:24px 0 0;font-family:${SERIF};font-size:17px;line-height:27px;color:${C.ink};">Thank you for your order. This <em style="color:${C.sage};">${esc(p.was.toLowerCase())}</em> was rescued in <em style="color:${C.sage};">${esc(p.village)}</em> and given a second life as your ${esc(nowLower)}. By choosing reclaimed glass you kept one more bottle out of landfill and off Goa's roadsides and beaches. Every bottle has a past. Thank you for giving this one a future.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr>
      <td width="48%" valign="top" style="border-top:1px solid ${C.line};padding-top:10px;">${label('Rescued in')}<div style="font-family:${SANS};font-size:14px;color:${C.ink};padding-top:3px;">${esc(p.village)}</div></td>
      <td width="4%">&nbsp;</td>
      <td width="48%" valign="top" style="border-top:1px solid ${C.line};padding-top:10px;">${label('Rescue date')}<div style="font-family:${SANS};font-size:14px;color:${C.ink};padding-top:3px;">${esc(formatDate(p.rescuedOn))}</div></td>
    </tr></table>

    <h2 style="margin:28px 0 12px;font-family:${SERIF};font-weight:normal;font-size:22px;color:${C.green};">Its journey</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${journey}</table>

    <h2 style="margin:28px 0 12px;font-family:${SERIF};font-weight:normal;font-size:22px;color:${C.green};">Made by</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="40" valign="middle"><div style="width:40px;height:40px;line-height:40px;text-align:center;background:${C.bg};border-radius:20px;font-family:${SERIF};font-size:18px;color:${C.green};">${esc(p.artisan.name.charAt(0))}</div></td>
      <td style="padding-left:12px;">
        <div style="font-family:${SANS};font-size:14px;font-weight:bold;color:${C.green};">${esc(p.artisan.name)}</div>
        <div style="font-family:${SANS};font-size:13px;color:${C.ink};">${esc(p.artisan.role)}, ${esc(p.artisan.studio)}</div>
      </td>
    </tr></table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;"><tr>
      <td style="background:${C.bg};border-radius:8px;padding:18px 20px;">
        <div style="font-family:${SERIF};font-size:22px;color:${C.green};">${kept}</div>
        <div style="font-family:${SANS};font-size:13px;color:${C.ink};padding-top:4px;">Plus ${more} more rescued in ${esc(p.village)} so far.</div>
      </td>
    </tr></table>

    <h2 style="margin:28px 0 8px;font-family:${SERIF};font-weight:normal;font-size:22px;color:${C.green};">Where our bottles come from</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${villages}</table>

    <div style="padding-top:22px;">${button(p.url, 'Open and share your passport')}</div>
    <div style="font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};padding-top:8px;">Passport link: <a href="${esc(p.url)}" style="color:${C.sage};word-break:break-all;">${esc(p.url)}</a></div>
  `)
}

export function renderPassportEmail(order, passports) {
  const isSample = passports.some((p) => p.isSample)
  const note = isSample
    ? `<tr><td class="pad" style="padding:14px 28px 0;font-family:${SANS};font-size:11px;line-height:17px;color:${C.muted};text-align:center;">Village, maker and dates are illustrative while we finish recording each batch. Your piece is made from a bottle rescued in Goa.</td></tr>`
    : ''
  const intro = `<tr><td class="pad" style="padding:0 28px 16px;font-family:${SERIF};font-size:17px;line-height:26px;color:${C.ink};">${
    passports.length > 1
      ? `Your order ${esc(order.orderNumber)} holds ${passports.length} pieces, so here are ${passports.length} passports, one for each.`
      : `Here is the passport for the piece in your order ${esc(order.orderNumber)}.`
  } A printable PDF copy is attached.</td></tr>`
  const body = intro + passports.map((p, i) => (i ? spacer(20) : '') + passportCard(p)).join('') + note

  const first = passports[0]
  const html = shell({
    title: 'Your bottle passport',
    preheader: first ? first.headline : 'Your bottle passport',
    body,
  })
  const text = [
    `Your O.U.A.T. bottle passport${passports.length > 1 ? 's' : ''} (order ${order.orderNumber})`,
    '',
    ...passports.flatMap((p) => [
      `${p.id}: ${p.headline}`,
      `Once upon a time: ${p.was} -> Now: ${p.now}${p.quantity > 1 ? ` x ${p.quantity}` : ''}`,
      `Rescued in ${p.village} on ${formatDate(p.rescuedOn)}`,
      ...p.journey.map((s) => `  - ${s.title} (${formatDate(s.date)})`),
      `Made by ${p.artisan.name}, ${p.artisan.role}, ${p.artisan.studio}`,
      `View: ${p.url}`,
      '',
    ]),
    'A printable PDF copy is attached.',
    ...(isSample ? ['Village, maker and dates are illustrative while we finish recording each batch.'] : []),
  ].join('\n')

  const subject =
    passports.length === 1 ? `Your bottle passport ${first.id}: ${first.headline}` : `Your ${passports.length} bottle passports from O.U.A.T.`
  return { subject, html, text }
}

/* ------------------------------------------------------------------ */
/* New-order notification for the store owner                         */
/* ------------------------------------------------------------------ */

/** Owner addresses from STORE_OWNER_EMAIL (comma-separated). Empty list = notification off. */
export function storeOwnerEmails() {
  return String(process.env.STORE_OWNER_EMAIL || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
}

export function renderOwnerEmail(order) {
  const adminUrl = `${siteUrl()}/admin/orders`
  const isCod = order.paymentMethod === 'cod'
  const time = new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
  const qtyTotal = order.items.reduce((s, i) => s + i.qty, 0)

  const cell = (align, extra = '') =>
    `align="${align}" style="padding:9px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;line-height:20px;color:${C.ink};${extra}"`
  const itemRows = order.items
    .map(
      (i) => `<tr>
      <td ${cell('left')}>${esc(i.name)}${order.giftItems.includes(i.name) ? ` <span style="color:${C.stamp};font-size:12px;">(gift)</span>` : ''}</td>
      <td ${cell('center', 'padding-left:8px;padding-right:8px;white-space:nowrap;')}>${i.qty}</td>
      <td ${cell('right', 'white-space:nowrap;')}>${inr(i.unitPrice)}</td>
      <td ${cell('right', 'padding-left:10px;white-space:nowrap;')}>${inr(i.lineTotal)}</td>
    </tr>`,
    )
    .join('')
  const th = (t, align = 'left') =>
    `<td align="${align}" style="padding:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:0.4px;color:${C.muted};border-bottom:1px solid ${C.line};">${t}</td>`

  const field = (l, v) =>
    `<tr><td width="110" valign="top" style="padding:5px 0;font-family:${SANS};font-size:12px;line-height:20px;color:${C.muted};">${esc(l)}</td><td style="padding:5px 0;font-family:${SANS};font-size:14px;line-height:20px;color:${C.ink};">${v}</td></tr>`
  const link = (href, t) => `<a href="${esc(href)}" style="color:${C.sage};">${esc(t)}</a>`

  const body = card(`
    ${label('New order')}
    <div style="font-family:${MONO};font-size:14px;color:${C.sage};padding-top:4px;">${esc(order.orderNumber)}</div>
    <h1 class="h1" style="margin:12px 0 0;font-family:${SERIF};font-weight:normal;font-size:30px;line-height:36px;color:${C.green};">${inr(order.total)} &middot; ${qtyTotal} item${qtyTotal === 1 ? '' : 's'}</h1>
    <p style="margin:8px 0 0;font-family:${SANS};font-size:14px;line-height:21px;color:${C.ink};">${esc(order.customerName || 'A customer')} ordered on ${esc(order.dateLabel)} at ${esc(time)}. ${
      isCod ? `<strong style="color:${C.stamp};">Cash on delivery</strong>: collect ${inr(order.total)}.` : 'Paid online via Razorpay.'
    }</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;border-top:1px solid ${C.line};">
      <tr><td colspan="2" style="height:8px;font-size:0;line-height:8px;">&nbsp;</td></tr>
      ${field('Customer', esc(order.customerName || '-'))}
      ${field('Email', order.customerEmail ? link(`mailto:${order.customerEmail}`, order.customerEmail) : '-')}
      ${field('Phone', order.customerPhone ? link(`tel:${order.customerPhone}`, order.customerPhone) : '-')}
      ${field('Payment', `${esc(order.paymentLabel)}${order.razorpayPaymentId ? `<br><span style="font-family:${MONO};font-size:12px;color:${C.muted};">${esc(order.razorpayPaymentId)}</span>` : ''}`)}
      ${field('Ship to', [order.customerName, ...order.addressLines].filter(Boolean).map(esc).join('<br>') || '-')}
      ${order.giftNote ? field('Gift note', `<span style="font-family:${SERIF};font-style:italic;font-size:15px;">&ldquo;${esc(order.giftNote)}&rdquo;</span>`) : ''}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
      <tr>${th('Item')}${th('Qty', 'center')}${th('Price', 'right')}${th('Total', 'right')}</tr>
      ${itemRows}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      ${
        order.discount > 0
          ? `<tr><td style="padding:3px 0;font-family:${SANS};font-size:14px;color:${C.ink};">Coupon${order.couponCode ? ` <span style="font-family:${MONO};">${esc(order.couponCode)}</span>` : ''}</td><td align="right" style="padding:3px 0;font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;">&minus;${inr(order.discount)}</td></tr>`
          : ''
      }
      <tr><td style="padding:3px 0;font-family:${SANS};font-size:16px;font-weight:bold;color:${C.green};">${isCod ? 'To collect on delivery' : 'Total paid'}</td><td align="right" style="padding:3px 0;font-family:${SANS};font-size:16px;font-weight:bold;color:${C.green};white-space:nowrap;">${inr(order.total)}</td></tr>
    </table>

    <div style="padding-top:24px;">${button(adminUrl, 'Open orders in admin')}</div>
  `)

  const html = shell({
    title: `New order ${order.orderNumber}`,
    preheader: `${order.customerName || 'New order'}: ${inr(order.total)}, ${isCod ? 'cash on delivery' : 'paid online'}`,
    body,
  })

  const text = [
    `New order ${order.orderNumber}`,
    `${order.dateLabel} ${time}`,
    '',
    `Customer: ${order.customerName || '-'}`,
    `Email: ${order.customerEmail || '-'}`,
    `Phone: ${order.customerPhone || '-'}`,
    `Payment: ${order.paymentLabel}${order.razorpayPaymentId ? ` (${order.razorpayPaymentId})` : ''}`,
    '',
    ...order.items.map((i) => `${i.name}  ${i.qty} x ${inr(i.unitPrice)} = ${inr(i.lineTotal)}`),
    ...(order.discount > 0 ? [`Coupon ${order.couponCode ?? ''}: -${inr(order.discount)}`] : []),
    `${isCod ? 'To collect on delivery' : 'Total paid'}: ${inr(order.total)}`,
    '',
    'Ship to:',
    ...[order.customerName, ...order.addressLines].filter(Boolean),
    ...(order.giftNote ? ['', `Gift note: "${order.giftNote}"`] : []),
    '',
    `Admin: ${adminUrl}`,
  ].join('\n')

  const subject = `New order ${order.orderNumber}: ${inr(order.total)} (${isCod ? 'COD' : 'paid'}) from ${order.customerName || 'a customer'}`
  return { subject, html, text }
}

/* ------------------------------------------------------------------ */
/* Sending (once per order)                                            */
/* ------------------------------------------------------------------ */

const KEYS = { confirmation: 'orderEmail', passport: 'passportEmail', owner: 'ownerEmail' }

/** Atomically claim an email for sending. Returns false if it was already claimed (or forced is off and it ran). */
async function claim(orderId, key, force) {
  const result = await query(
    `UPDATE orders
     SET shipping_json = JSON_SET(COALESCE(shipping_json, JSON_OBJECT()), '$.${key}', 'sending', '$.${key}At', :now)
     WHERE id = :id ${force ? '' : `AND JSON_EXTRACT(shipping_json, '$.${key}') IS NULL`}`,
    { id: orderId, now: new Date().toISOString() },
  )
  return result.affectedRows === 1
}

async function mark(orderId, key, state, error = null) {
  await query(
    `UPDATE orders
     SET shipping_json = JSON_SET(COALESCE(shipping_json, JSON_OBJECT()), '$.${key}', :state, '$.${key}At', :now, '$.${key}Error', :error)
     WHERE id = :id`,
    { id: orderId, state, now: new Date().toISOString(), error: error ? String(error).slice(0, 300) : null },
  )
}

async function sendOne(orderId, kind, force, build) {
  const key = KEYS[kind]
  if (!(await claim(orderId, key, force))) return { kind, status: 'skipped', reason: 'already sent' }
  try {
    const info = await build()
    await mark(orderId, key, 'sent')
    return { kind, status: 'sent', messageId: info.messageId, smtpResponse: info.response }
  } catch (err) {
    console.error(`[mail] ${kind} email for order ${orderId} failed:`, err.message)
    await mark(orderId, key, 'failed', err.message).catch(() => {})
    return { kind, status: 'failed', error: err.message }
  }
}

/**
 * Send the confirmation (with invoice PDF) and the passport email for an order, and the
 * new-order notification to STORE_OWNER_EMAIL.
 * @param {number} orderId
 * @param {{ force?: boolean, only?: 'confirmation'|'passport'|'owner' }} [opts] force = resend even if already sent.
 *   A forced resend of the customer emails (no `only`) leaves the owner notification alone.
 */
export async function sendOrderEmails(orderId, { force = false, only } = {}) {
  if (!isMailConfigured()) {
    console.warn(`[mail] SMTP not configured; order ${orderId} emails not sent`)
    return { ok: false, error: 'SMTP is not configured', results: [] }
  }
  const order = await loadOrderForEmail(orderId)
  if (!order) return { ok: false, error: 'Order not found', results: [] }
  if (!order.isConfirmed) return { ok: false, error: 'Order is not confirmed yet (payment not captured)', results: [] }

  const results = []
  const owners = storeOwnerEmails()
  if (only === 'owner' || (!only && !force)) {
    if (owners.length) {
      results.push(
        await sendOne(order.id, 'owner', force, () =>
          sendMail({ to: owners.join(', '), replyTo: order.customerEmail || undefined, ...renderOwnerEmail(order) }),
        ),
      )
    } else if (only === 'owner') {
      return { ok: false, error: 'STORE_OWNER_EMAIL is not set', results }
    }
    if (only === 'owner') return { ok: results.every((r) => r.status !== 'failed'), results }
  }

  if (!order.customerEmail) return { ok: false, error: 'Order has no email address', results }
  if (!only || only === 'confirmation') {
    results.push(
      await sendOne(order.id, 'confirmation', force, async () => {
        const mail = renderConfirmationEmail(order)
        const pdf = await renderInvoicePdf(order)
        return sendMail({
          to: order.customerEmail,
          ...mail,
          attachments: [{ filename: `OUAT-invoice-${order.orderNumber}.pdf`, content: pdf, contentType: 'application/pdf' }],
        })
      }),
    )
  }
  if (!only || only === 'passport') {
    results.push(
      await sendOne(order.id, 'passport', force, async () => {
        const passports = await passportsForOrder(order.id)
        if (!passports.length) throw new Error('Order has no items')
        const pdf = await renderPassportPdf(passports)
        const filename = passports.length === 1 ? `OUAT-bottle-passport-${passports[0].id}.pdf` : `OUAT-bottle-passports-${order.orderNumber}.pdf`
        return sendMail({
          to: order.customerEmail,
          ...renderPassportEmail(order, passports),
          attachments: [{ filename, content: pdf, contentType: 'application/pdf' }],
        })
      }),
    )
  }
  return { ok: results.every((r) => r.status !== 'failed'), results }
}

/** Fire-and-forget version for the checkout path: never throws, never delays the response. */
export function queueOrderEmails(orderId) {
  setImmediate(() => {
    sendOrderEmails(orderId).catch((err) => console.error(`[mail] order ${orderId} emails failed:`, err.message))
  })
}
