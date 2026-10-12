import { apiGet, apiPost } from '../lib/api'
import { getAuthSession } from '../lib/authSession'

export async function register(values) {
  const result = await apiPost('/auth/register', {
    name: values.name,
    email: values.email,
    password: values.password,
    passwordConfirm: values.passwordConfirm,
  })
  if (!result.ok) {
    return { ok: false, errors: result.errors ?? { form: result.error ?? 'Registration failed.' } }
  }
  return {
    ok: true,
    user: result.user,
    token: result.token,
    apiKey: result.apiKey ?? null,
  }
}

export async function login(values) {
  try {
    const result = await apiPost('/auth/login', {
      login: String(values.login ?? '').trim(),
      password: String(values.password ?? ''),
    })
    if (!result.ok) {
      const errors = result.errors ?? {}
      if (result.error && !Object.keys(errors).length) errors.form = result.error
      if (result.status === 503 || result.status >= 500) {
        errors.form = 'Could not reach the server. Start the API (npm run dev) and check DB in .env.'
      }
      return { ok: false, errors }
    }
    return { ok: true, user: result.user, token: result.token, apiKey: null }
  } catch {
    return {
      ok: false,
      errors: { form: 'Network error — is the API running on port 3001?' },
    }
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
