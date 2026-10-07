import type { Session } from '../types'

const STORAGE_KEY = 'market-monitor.session'

export const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export const saveSession = (session: Session): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

export const getAccessToken = (): string | null => loadSession()?.accessToken ?? null
