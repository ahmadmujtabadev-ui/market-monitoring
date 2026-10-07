import { clearSession, loadSession, saveSession } from '../lib/session'
import type { Session } from '../types'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export const API_BASE = `${API_URL}/api`

export interface FieldError {
  path: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: FieldError[]
  readonly code?: string

  constructor(status: number, message: string, errors: FieldError[] = [], code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.code = code
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

let onUnauthorized: () => void = () => {}
let refreshInFlight: Promise<boolean> | null = null

export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler
}

const send = (path: string, options: RequestOptions, token: string | null): Promise<Response> =>
  fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    signal: options.signal,
    headers: {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

const toApiError = async (response: Response): Promise<ApiError> => {
  const payload = await response.json().catch(() => null)
  const message = typeof payload?.message === 'string' ? payload.message : response.statusText
  return new ApiError(
    response.status,
    message || 'Request failed',
    payload?.errors ?? [],
    payload?.code,
  )
}

const performRefresh = async (): Promise<boolean> => {
  const current = loadSession()
  if (!current) return false
  try {
    const response = await send(
      '/auth/refresh',
      { method: 'POST', body: { refreshToken: current.refreshToken } },
      null,
    )
    if (!response.ok) throw await toApiError(response)
    saveSession((await response.json()) as Session)
    return true
  } catch {
    clearSession()
    onUnauthorized()
    return false
  }
}

export const refreshSession = (): Promise<boolean> => {
  refreshInFlight ??= performRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const authenticated = options.auth !== false
  let response = await send(path, options, authenticated ? (loadSession()?.accessToken ?? null) : null)

  if (response.status === 401 && authenticated && (await refreshSession())) {
    response = await send(path, options, loadSession()?.accessToken ?? null)
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
