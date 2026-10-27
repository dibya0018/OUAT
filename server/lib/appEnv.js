/*
 * Which environment the server runs in, and the public URL that goes with it.
 *
 *   APP_ENV=local       → every link we generate (emails, passports, reset links) points at LOCAL_SITE_URL
 *   APP_ENV=production  → links point at SITE_URL (the live site). This is the default.
 *
 * Use siteUrl() for any absolute link to the storefront; never read SITE_URL directly.
 */

const DEFAULT_PRODUCTION_URL = 'https://ouatworld.com'
const DEFAULT_LOCAL_URL = 'http://localhost:5173'

const trimSlash = (u) => String(u).replace(/\/+$/, '')

export function appEnv() {
  return String(process.env.APP_ENV || 'production').trim().toLowerCase() === 'local'
    ? 'local'
    : 'production'
}

export const isLocal = () => appEnv() === 'local'

/** Base URL of the storefront for the current environment, without a trailing slash. */
export function siteUrl() {
  return isLocal()
    ? trimSlash(process.env.LOCAL_SITE_URL || DEFAULT_LOCAL_URL)
    : trimSlash(process.env.SITE_URL || DEFAULT_PRODUCTION_URL)
}
