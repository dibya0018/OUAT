import { getAuthSession } from './authSession.js'

/** Base URL for the O.U.A.T. API (empty = same origin). */
export function apiBase() {
  const base = import.meta.env.VITE_API_BASE_URL
  if (base === undefined || base === '') return ''
  return base.replace(/\/$/, '')
}

export function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const { token, apiKey } = getAuthSession()
  if (token) headers.Authorization = `Bearer ${token}`
  else if (apiKey) headers['X-API-Key'] = apiKey
  return headers
}

export async function apiPost(path, body, { auth = false } = {}) {
  const headers = auth
    ? authHeaders()
    : { 'Content-Type': 'application/json' }
  if (!auth) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { ...data, ok: false, status: res.status }
  return data
}

export async function apiGet(path, { auth = false } = {}) {
  const headers = auth ? authHeaders() : {}
  const res = await fetch(`${apiBase()}${path}`, { headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `API ${res.status}`)
  return data
}

async function apiJson(method, path, body, { auth = false } = {}) {
  const headers = auth ? authHeaders() : { 'Content-Type': 'application/json' }
  if (!auth) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `API ${res.status}`)
  return data
}

export function apiPut(path, body, opts) {
  return apiJson('PUT', path, body, opts)
}

export function apiPatch(path, body, opts) {
  return apiJson('PATCH', path, body, opts)
}

export function apiDelete(path, opts) {
  return apiJson('DELETE', path, null, opts)
}
