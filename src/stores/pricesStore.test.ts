import { beforeEach, describe, expect, it } from 'vitest'
import { HISTORY_LENGTH, usePricesStore } from './pricesStore'

const tick = (symbolId: string, price: number, previousPrice: number) => ({
  symbolId,
  code: symbolId.toUpperCase(),
  price,
  previousPrice,
  changePercent: ((price - previousPrice) / previousPrice) * 100,
})

describe('pricesStore', () => {
  beforeEach(() => usePricesStore.getState().reset())

  it('derives the direction of each tick', () => {
    usePricesStore.getState().applyBatch({
      at: '2026-01-01T00:00:00.000Z',
      ticks: [tick('a', 11, 10), tick('b', 9, 10), tick('c', 10, 10)],
    })

    const { prices, lastUpdate } = usePricesStore.getState()
    expect(prices.a.direction).toBe('up')
    expect(prices.b.direction).toBe('down')
    expect(prices.c.direction).toBe('flat')
    expect(lastUpdate).toBe('2026-01-01T00:00:00.000Z')
  })

  it('measures change against the first price seen, not the previous tick', () => {
    const { applyBatch } = usePricesStore.getState()
    applyBatch({ at: 't1', ticks: [tick('a', 101, 100)] })
    applyBatch({ at: 't2', ticks: [tick('a', 102, 101)] })
    applyBatch({ at: 't3', ticks: [tick('a', 99, 102)] })

    const live = usePricesStore.getState().prices.a
    expect(live.open).toBe(100)
    expect(live.changePercent).toBeCloseTo(-1, 5)
    expect(live.direction).toBe('down')
  })

  it('keeps a bounded price history per symbol', () => {
    const { applyBatch } = usePricesStore.getState()
    for (let i = 0; i < 45; i += 1) {
      applyBatch({ at: `t${i}`, ticks: [tick('a', 100 + i, 99 + i)] })
    }

    const history = usePricesStore.getState().history.a
    expect(history).toHaveLength(HISTORY_LENGTH)
    expect(history.at(-1)).toBe(144)
  })

  it('merges batches and increments the per-symbol sequence', () => {
    const { applyBatch } = usePricesStore.getState()
    applyBatch({ at: 't1', ticks: [tick('a', 11, 10), tick('b', 5, 5)] })
    applyBatch({ at: 't2', ticks: [tick('a', 12, 11)] })

    const { prices } = usePricesStore.getState()
    expect(prices.a.price).toBe(12)
    expect(prices.a.sequence).toBe(2)
    expect(prices.b.sequence).toBe(1)
  })

  it('tracks connection status and resets', () => {
    usePricesStore.getState().setConnection('open')
    expect(usePricesStore.getState().connection).toBe('open')

    usePricesStore.getState().applyBatch({ at: 't', ticks: [tick('a', 1, 1)] })
    usePricesStore.getState().reset()

    expect(usePricesStore.getState().prices).toEqual({})
    expect(usePricesStore.getState().connection).toBe('connecting')
  })
})
