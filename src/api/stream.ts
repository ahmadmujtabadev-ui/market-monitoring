import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getAccessToken } from '../lib/session'
import type { Alert, ConnectionStatus, PriceBatch } from '../types'
import { API_BASE, refreshSession } from './http'

export interface StreamHandlers {
  onPrices: (batch: PriceBatch) => void
  onAlert: (alert: Alert) => void
  onStatus: (status: ConnectionStatus) => void
}

const RECONNECT_DELAY_MS = 2000

class StreamClosedError extends Error {}
class StreamRetryError extends Error {}

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })

const parse = <T>(data: string): T | null => {
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

const connectOnce = (handlers: StreamHandlers, signal: AbortSignal): Promise<void> =>
  fetchEventSource(`${API_BASE}/stream`, {
    signal,
    openWhenHidden: true,
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
    async onopen(response) {
      if (response.ok) {
        handlers.onStatus('open')
        return
      }
      if (response.status === 401 && (await refreshSession())) throw new StreamRetryError()
      throw new StreamClosedError()
    },
    onmessage(message) {
      if (message.event === 'prices') {
        const batch = parse<PriceBatch>(message.data)
        if (batch) handlers.onPrices(batch)
      } else if (message.event === 'alert') {
        const alert = parse<Alert>(message.data)
        if (alert) handlers.onAlert(alert)
      }
    },
    onclose() {
      throw new StreamRetryError()
    },
    onerror(error) {
      throw error
    },
  })

export const openMarketStream = async (
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> => {
  handlers.onStatus('connecting')
  while (!signal.aborted) {
    try {
      await connectOnce(handlers, signal)
    } catch (error) {
      if (signal.aborted) break
      if (error instanceof StreamClosedError) {
        handlers.onStatus('closed')
        return
      }
      handlers.onStatus('reconnecting')
      await sleep(RECONNECT_DELAY_MS, signal)
    }
  }
}
