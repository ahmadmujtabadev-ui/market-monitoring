import { create } from 'zustand'
import { alertsApi } from '../api/endpoints'
import { getErrorMessage } from '../lib/errors'
import type { Alert, CreateAlertInput } from '../types'

interface AlertsState {
  items: Alert[]
  loading: boolean
  submitting: boolean
  error: string | null
  fetch: () => Promise<void>
  create: (input: CreateAlertInput) => Promise<boolean>
  remove: (id: string) => Promise<void>
  applyTriggered: (alert: Alert) => void
  reset: () => void
}

const initialState = { items: [], loading: false, submitting: false, error: null }

export const useAlertsStore = create<AlertsState>((set, get) => ({
  ...initialState,
  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const page = await alertsApi.list()
      set({ items: page.items, loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },
  create: async (input) => {
    set({ submitting: true, error: null })
    try {
      const alert = await alertsApi.create(input)
      set({ items: [alert, ...get().items], submitting: false })
      return true
    } catch (error) {
      set({ submitting: false, error: getErrorMessage(error) })
      return false
    }
  },
  remove: async (id) => {
    const previous = get().items
    set({ items: previous.filter((alert) => alert.id !== id), error: null })
    try {
      await alertsApi.remove(id)
    } catch (error) {
      set({ items: previous, error: getErrorMessage(error) })
    }
  },
  applyTriggered: (alert) => {
    const items = get().items
    const exists = items.some((item) => item.id === alert.id)
    set({
      items: exists
        ? items.map((item) => (item.id === alert.id ? alert : item))
        : [alert, ...items],
    })
  },
  reset: () => set(initialState),
}))
