import { siteUrl } from './appEnv.js'

/*
 * "Reset your password" email. Table-based, inline CSS, same look as the order emails
 * (server/lib/orderEmails.js), kept separate so the two can change independently.
 */

const C = {
  bg: '#f4f0e4',
  card: '#ffffff',
  line: '#e4ddc9',
  green: '#2c4430',
  sage: '#4d694e',
  ink: '#2d2d2d',
  muted: '#6b6b6b',
}
const SERIF = "Georgia, 'Times New Roman', Times, serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export function renderPasswordResetEmail({ name, resetUrl, expiresMinutes }) {
  const firstName = String(name ?? '').trim().split(/\s+/)[0]
  const greeting = firstName ? `Hi ${esc(firstName)},` : 'Hi,'
  const subject = 'Reset your O.U.A.T. password'

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(subject)}</title>
<style>
  body { margin:0; padding:0; }
  table { border-collapse:collapse; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:28px !important; line-height:34px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">Use this link within ${expiresMinutes} minutes to choose a new password.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td class="pad" style="padding:8px 28px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${SERIF};font-size:24px;color:${C.green};">O.U.A.T.</td>
      <td align="right" style="font-family:${SANS};font-size:12px;color:${C.sage};">Once Upon A Time &middot; Goa</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="pad" style="padding:32px 28px;">
      <div class="h1" style="font-family:${SERIF};font-size:32px;line-height:38px;color:${C.green};">Reset your password</div>
      <p style="margin:20px 0 0;font-family:${SANS};font-size:15px;line-height:23px;color:${C.ink};">${greeting}</p>
      <p style="margin:12px 0 0;font-family:${SANS};font-size:15px;line-height:23px;color:${C.ink};">
        We received a request to reset the password for your O.U.A.T. account. Click the button below to choose a new one.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr>
        <td style="background:${C.sage};border-radius:6px;">
          <a href="${esc(resetUrl)}" style="display:inline-block;padding:12px 24px;font-family:${SANS};font-size:14px;color:#ffffff;text-decoration:none;">Choose a new password</a>
        </td>
      </tr></table>
      <p style="margin:24px 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${C.muted};">
        This link works once and expires in ${expiresMinutes} minutes. If you didn't ask to reset your password, you can ignore this email; your password won't change.
      </p>
      <p style="margin:16px 0 0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};word-break:break-all;">
        If the button doesn't work, paste this link into your browser:<br>
        <a href="${esc(resetUrl)}" style="color:${C.sage};">${esc(resetUrl)}</a>
      </p>
    </td></tr></table>
  </td></tr>
  <tr><td class="pad" style="padding:20px 28px;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};text-align:center;">
    <a href="${siteUrl()}" style="color:${C.sage};">ouatworld.com</a> &middot; Reclaimed glass, cut by hand in Goa
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  const text = [
    greeting,
    '',
    'We received a request to reset the password for your O.U.A.T. account.',
    `Choose a new password here (works once, expires in ${expiresMinutes} minutes):`,
    resetUrl,
    '',
    "If you didn't ask for this, you can ignore this email; your password won't change.",
  ].join('\n')

  return { subject, html, text }
}
