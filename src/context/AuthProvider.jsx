import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { getAuthSession, loadStoredAuthSession, setAuthSession } from '../lib/authSession'
import {
  fetchMe,
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'

export const AuthContext = createContext(null)

const emptySession = { user: null, token: null, apiKey: null }

/** Read the saved sign-in once, before anything can write to storage. */
function initialSession() {
  const stored = loadStoredAuthSession()
  if (stored?.token) setAuthSession(stored)
  return stored?.token ? stored : emptySession
}

/** Only a 401/403 from the server means the sign-in is no longer valid; network blips keep it. */
const isAuthRejected = (err) => err?.status === 401 || err?.status === 403

export function AuthProvider({ children }) {
  // Restored from storage on first render. (Previously an effect saved the empty starting state
  // first, which wiped the stored sign-in, so every refresh logged the person out.)
  const [session, setSession] = useState(initialSession)
  const [booting, setBooting] = useState(() => Boolean(session.token))

  useEffect(() => {
    setAuthSession(session)
  }, [session])

  // Re-check the restored sign-in with the server (picks up name/role changes, drops expired tokens).
  useEffect(() => {
    if (!getAuthSession().token) return
    fetchMe()
      .then((user) => {
        if (user) setSession((prev) => ({ ...prev, user }))
        else setSession(emptySession)
      })
      .catch((err) => {
        if (isAuthRejected(err)) setSession(emptySession)
      })
      .finally(() => setBooting(false))
  }, [])

  const login = useCallback(async (values) => {
    const result = await loginRequest(values)
    if (result.ok) {
      setSession({
        user: result.user,
        token: result.token,
        apiKey: result.apiKey ?? null,
      })
    }
    return result
  }, [])

  const register = useCallback(async (values) => {
    const result = await registerRequest(values)
    if (result.ok) {
      setSession({
        user: result.user,
        token: result.token,
        apiKey: result.apiKey ?? null,
      })
    }
    return result
  }, [])

  const logout = useCallback(() => {
    setSession(emptySession)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!session.token) return
    setBooting(true)
    try {
      const user = await fetchMe()
      if (user) setSession((prev) => ({ ...prev, user }))
    } catch (err) {
      if (isAuthRejected(err)) setSession(emptySession)
    } finally {
      setBooting(false)
    }
  }, [session.token])

  const value = useMemo(
    () => ({
      user: session.user,
      booting,
      isAuthenticated: Boolean(session.user && session.token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [session, booting, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
