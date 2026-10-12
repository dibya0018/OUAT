import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { loadStoredAuthSession, setAuthSession } from '../lib/authSession'
import {
  fetchMe,
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'

export const AuthContext = createContext(null)

const emptySession = { user: null, token: null, apiKey: null }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(emptySession)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    setAuthSession(session)
  }, [session])

  useEffect(() => {
    const stored = loadStoredAuthSession()
    if (!stored?.token) {
      setBooting(false)
      return
    }
    setSession(stored)
    setAuthSession(stored)
    fetchMe()
      .then((user) => {
        if (user) setSession((prev) => ({ ...prev, user }))
        else setSession(emptySession)
      })
      .catch(() => setSession(emptySession))
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
    } catch {
      setSession(emptySession)
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
