import nodemailer from 'nodemailer'
import { isLocal } from './appEnv.js'

let transporter = null

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM)
}

function getTransporter() {
  if (transporter) return transporter
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  })
  return transporter
}

/** Send one email. Throws if SMTP is not configured or the server rejects it. */
export async function sendMail({ to, subject, html, text, attachments, replyTo }) {
  if (!isMailConfigured()) {
    const err = new Error('SMTP is not configured (set SMTP_HOST and MAIL_FROM in .env)')
    err.code = 'MAIL_NOT_CONFIGURED'
    throw err
  }
  return getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    replyTo: replyTo || process.env.MAIL_REPLY_TO || undefined,
    to,
    // Test mail sent from a local setup is marked so it can't be mistaken for a real one.
    subject: isLocal() ? `[LOCAL] ${subject}` : subject,
    html,
    text,
    attachments,
  })
}
