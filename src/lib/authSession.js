/** Session for API auth — persisted in sessionStorage so refresh keeps you signed in. */
const STORAGE_KEY = 'ouat_auth_session'

let session = { user: null, token: null, apiKey: null }

export function getAuthSession() {
  return session
}

export function setAuthSession(next) {
  session = {
    user: next?.user ?? null,
    token: next?.token ?? null,
    apiKey: next?.apiKey ?? null,
  }
  if (typeof window === 'undefined') return
  if (session.token && session.user) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: session.user, token: session.token, apiKey: session.apiKey }),
    )
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function loadStoredAuthSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.user) return null
    return {
      user: parsed.user,
      token: parsed.token,
      apiKey: parsed.apiKey ?? null,
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}
