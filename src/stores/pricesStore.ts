import { create } from 'zustand'
import type { ConnectionStatus, PriceBatch, PriceDirection, PriceTick } from '../types'

export const HISTORY_LENGTH = 30

export interface LivePrice extends PriceTick {
  direction: PriceDirection
  sequence: number
  open: number
}

interface PricesState {
  prices: Record<string, LivePrice>
  history: Record<string, number[]>
  connection: ConnectionStatus
  lastUpdate: string | null
  applyBatch: (batch: PriceBatch) => void
  setConnection: (status: ConnectionStatus) => void
  reset: () => void
}

const directionOf = (tick: PriceTick): PriceDirection =>
  tick.price > tick.previousPrice ? 'up' : tick.price < tick.previousPrice ? 'down' : 'flat'

const percentFrom = (open: number, price: number): number =>
  open === 0 ? 0 : ((price - open) / open) * 100

const initialState = {
  prices: {} as Record<string, LivePrice>,
  history: {} as Record<string, number[]>,
  connection: 'connecting' as ConnectionStatus,
  lastUpdate: null,
}

export const usePricesStore = create<PricesState>((set, get) => ({
  ...initialState,
  applyBatch: (batch) => {
    const prices = { ...get().prices }
    const history = { ...get().history }
    for (const tick of batch.ticks) {
      const previous = prices[tick.symbolId]
      const open = previous?.open ?? tick.previousPrice
      prices[tick.symbolId] = {
        ...tick,
        open,
        changePercent: percentFrom(open, tick.price),
        direction: directionOf(tick),
        sequence: (previous?.sequence ?? 0) + 1,
      }
      history[tick.symbolId] = [...(history[tick.symbolId] ?? [open]), tick.price].slice(
        -HISTORY_LENGTH,
      )
    }
    set({ prices, history, lastUpdate: batch.at })
  },
  setConnection: (connection) => set({ connection }),
  reset: () => set(initialState),
}))
