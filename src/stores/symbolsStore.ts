import { create } from 'zustand'
import { symbolsApi } from '../api/endpoints'
import { getErrorMessage } from '../lib/errors'
import type { MarketSymbol } from '../types'

interface SymbolsState {
  items: MarketSymbol[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useSymbolsStore = create<SymbolsState>((set) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null })
    try {
      set({ items: await symbolsApi.list(), loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },
}))
