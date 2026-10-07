import { formatPercent, formatPrice } from '../lib/format'
import type { LivePrice } from '../stores/pricesStore'
import type { MarketSymbol } from '../types'
import { Sparkline } from './Sparkline'

interface PriceTableProps {
  symbols: MarketSymbol[]
  prices: Record<string, LivePrice>
  history?: Record<string, number[]>
  selectedId?: string
  onSelect?: (symbolId: string) => void
}

const UP = '#19d98b'
const DOWN = '#ff5d73'
const ROW_GRID = 'grid grid-cols-[1fr_auto_auto] items-center gap-4 md:grid-cols-[1.4fr_120px_1fr_110px]'

export function PriceTable({ symbols, prices, history = {}, selectedId, onSelect }: PriceTableProps) {
  if (symbols.length === 0) {
    return <p className="p-6 text-sm text-muted">No symbols available.</p>
  }

  return (
    <div role="table" aria-label="Markets">
      <div
        role="row"
        className={`${ROW_GRID} px-4 py-3.5 text-xs font-semibold tracking-[0.08em] text-dim sm:px-7`}
      >
        <div role="columnheader">SYMBOL</div>
        <div role="columnheader" className="max-md:hidden">
          TREND
        </div>
        <div role="columnheader" className="text-right">
          PRICE (USD)
        </div>
        <div role="columnheader" className="text-right max-md:hidden">
          CHANGE
        </div>
      </div>
      {symbols.map((symbol) => {
        const live = prices[symbol.id]
        const change = live?.changePercent ?? 0
        const up = change >= 0
        const color = up ? UP : DOWN
        return (
          <button
            key={symbol.id}
            type="button"
            role="row"
            data-testid={`row-${symbol.code}`}
            aria-selected={selectedId === symbol.id}
            onClick={() => onSelect?.(symbol.id)}
            className={`${ROW_GRID} w-full cursor-pointer border-0 border-t border-[#131b29] px-4 py-4 text-left transition hover:bg-[#0e1624] sm:px-7 ${
              selectedId === symbol.id ? 'bg-[#0d1624]' : 'bg-transparent'
            }`}
          >
            <div role="cell">
              <div className="text-[15px] font-bold text-ink">{symbol.code}</div>
              <div className="mt-0.5 text-[13px] text-dim">{symbol.name}</div>
            </div>
            <div role="cell" className="max-md:hidden">
              <Sparkline values={history[symbol.id] ?? []} color={color} />
            </div>
            <div
              role="cell"
              className="text-right font-mono text-[17px] font-medium"
              style={{ color }}
            >
              {formatPrice(live?.price ?? symbol.price)}
            </div>
            <div
              role="cell"
              className="text-right font-mono text-sm max-md:hidden"
              style={{ color }}
            >
              <span aria-hidden>{up ? '▲' : '▼'}</span> {formatPercent(change)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
