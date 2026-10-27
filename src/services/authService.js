import { apiGet, apiPost } from '../lib/api'
import { getAuthSession } from '../lib/authSession'

const NETWORK_ERROR = "We couldn't reach our server. Check your connection and try again."
const SERVER_ERROR = 'Something went wrong on our side. Please try again in a moment.'
const RATE_LIMITED = 'Too many attempts. Please wait a few minutes and try again.'

/**
 * Turn a failed auth API response into form errors the page can show.
 * Field errors (400/409) pass through; everything else becomes `errors.form`.
 * 5xx details are developer-facing (DB/env hints), so customers get a generic message.
 */
function authErrors(result, fallback) {
  const errors = { ...(result.errors ?? {}) }
  const status = result.status ?? 0
  const serverMessage = result.error || result.message

  if (status >= 500) {
    if (serverMessage) console.warn('[auth]', status, serverMessage)
    errors.form = SERVER_ERROR
  } else if (status === 429) {
    errors.form = serverMessage || RATE_LIMITED
  } else if (!Object.keys(errors).length) {
    errors.form = serverMessage || fallback
  }
  return errors
}

export async function register(values) {
  try {
    const result = await apiPost('/auth/register', {
      name: values.name,
      email: values.email,
      password: values.password,
      passwordConfirm: values.passwordConfirm,
    })
    if (!result.ok) {
      return { ok: false, errors: authErrors(result, 'Could not create your account. Please try again.') }
    }
    return {
      ok: true,
      user: result.user,
      token: result.token,
      apiKey: result.apiKey ?? null,
    }
  } catch {
    return { ok: false, errors: { form: NETWORK_ERROR } }
  }
}

export async function login(values) {
  try {
    const result = await apiPost('/auth/login', {
      login: String(values.login ?? '').trim(),
      password: String(values.password ?? ''),
    })
    if (!result.ok) {
      return { ok: false, errors: authErrors(result, 'Sign in failed. Please try again.') }
    }
    return { ok: true, user: result.user, token: result.token, apiKey: null }
  } catch {
    return { ok: false, errors: { form: NETWORK_ERROR } }
  }
}

export async function requestPasswordReset(values) {
  try {
    const result = await apiPost('/auth/forgot-password', {
      email: String(values.email ?? '').trim(),
    })
    if (!result.ok) {
      return { ok: false, errors: authErrors(result, 'Could not send the reset link. Please try again.') }
    }
    return { ok: true, message: result.message }
  } catch {
    return { ok: false, errors: { form: NETWORK_ERROR } }
  }
}

export async function resetPassword(values) {
  try {
    const result = await apiPost('/auth/reset-password', {
      token: values.token,
      password: values.password,
      passwordConfirm: values.passwordConfirm,
    })
    if (!result.ok) {
      return {
        ok: false,
        tokenInvalid: result.code === 'TOKEN_INVALID',
        errors: authErrors(result, 'Could not reset your password. Please try again.'),
      }
    }
    return { ok: true, message: result.message }
  } catch {
    return { ok: false, errors: { form: NETWORK_ERROR } }
  }
}

export async function fetchMe() {
  const { token } = getAuthSession()
  if (!token) return null
  const data = await apiGet('/auth/me', { auth: true })
  return data.user ?? null
}

export async function regenerateApiKey() {
  const result = await apiPost('/auth/regenerate-api-key', {}, { auth: true })
  if (!result.ok) return { ok: false, error: result.error ?? 'Could not create API key.' }
  return { ok: true, apiKey: result.apiKey }
}
