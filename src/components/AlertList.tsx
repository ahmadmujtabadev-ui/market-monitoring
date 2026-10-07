import { useState } from 'react'
import { formatDateTime, formatPrice } from '../lib/format'
import type { Alert, AlertStatus } from '../types'

type Filter = 'ALL' | AlertStatus

interface AlertListProps {
  alerts: Alert[]
  loading: boolean
  onRemove: (id: string) => void
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRIGGERED', label: 'Triggered' },
]

const BADGES: Record<AlertStatus, string> = {
  ACTIVE: 'bg-[#0f2a22] text-accent',
  TRIGGERED: 'bg-[#2e2610] text-amber',
}

export function AlertList({ alerts, loading, onRemove }: AlertListProps) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const visible = filter === 'ALL' ? alerts : alerts.filter((alert) => alert.status === filter)

  return (
    <div>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-field p-1" role="tablist">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={`h-[34px] cursor-pointer rounded-[9px] border-0 text-sm font-semibold transition ${
              filter === value ? 'bg-[#26334a] text-white' : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {loading && alerts.length === 0 && <p className="text-sm text-muted">Loading alerts…</p>}
        {!loading && visible.length === 0 && (
          <p className="py-7 text-center text-sm text-dim">No alerts to show.</p>
        )}

        {visible.map((alert) => (
          <div
            key={alert.id}
            data-testid="alert-item"
            className="rounded-xl border border-line bg-field px-4 py-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <b className="text-base">{alert.symbol?.code ?? 'Symbol'}</b>
                <span
                  className={`rounded-full px-2 py-[3px] text-[11px] font-bold tracking-[0.05em] ${BADGES[alert.status]}`}
                >
                  {alert.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(alert.id)}
                aria-label={`Delete ${alert.symbol?.code ?? ''} alert`}
                className="cursor-pointer border-0 bg-transparent text-[13px] text-dim transition hover:text-danger"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 text-[15px]">
              {alert.condition === 'ABOVE' ? 'Rises to' : 'Falls to'}{' '}
              <span className="font-mono">{formatPrice(alert.threshold)}</span>
            </p>
            <p className="mt-1 text-[12.5px] text-dim">
              {alert.status === 'TRIGGERED' && alert.triggeredAt && alert.triggeredPrice !== null
                ? `Fired at ${formatPrice(alert.triggeredPrice)} · ${formatDateTime(alert.triggeredAt)}`
                : `Watching · created ${formatDateTime(alert.createdAt)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
