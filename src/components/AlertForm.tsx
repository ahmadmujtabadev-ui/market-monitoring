import { useState, type FormEvent } from 'react'
import { formatPrice } from '../lib/format'
import { useAlertsStore } from '../stores/alertsStore'
import { useToastStore } from '../stores/toastStore'
import type { AlertCondition, MarketSymbol } from '../types'
import { compactFieldClassName, labelClassName, selectClassName } from './Field'
import { primaryButtonClassName } from './FormFeedback'

interface AlertFormProps {
  symbols: MarketSymbol[]
  symbolId: string
  onSymbolChange: (symbolId: string) => void
  currentPrice: (symbolId: string) => number | undefined
}

export function AlertForm({ symbols, symbolId, onSymbolChange, currentPrice }: AlertFormProps) {
  const { create, submitting, error } = useAlertsStore()
  const pushToast = useToastStore((state) => state.push)
  const [condition, setCondition] = useState<AlertCondition>('BELOW')
  const [threshold, setThreshold] = useState('')
  const [validation, setValidation] = useState<string | null>(null)
  const [lastSymbolId, setLastSymbolId] = useState(symbolId)

  if (symbolId !== lastSymbolId) {
    setLastSymbolId(symbolId)
    setThreshold('')
    setValidation(null)
  }

  const price = symbolId ? currentPrice(symbolId) : undefined

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const value = Number(threshold.replace(/,/g, ''))
    if (!symbolId) return setValidation('Select a symbol')
    if (!threshold.trim() || !Number.isFinite(value) || value <= 0) {
      return setValidation('Enter a threshold greater than zero')
    }
    setValidation(null)
    const created = await create({ symbolId, condition, threshold: value })
    if (created) {
      setThreshold('')
      pushToast({ kind: 'success', title: 'Alert created' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="alert-symbol" className={labelClassName}>
          Symbol
        </label>
        <select
          id="alert-symbol"
          value={symbolId}
          onChange={(event) => onSymbolChange(event.target.value)}
          className={selectClassName}
        >
          {symbols.map((symbol) => (
            <option key={symbol.id} value={symbol.id}>
              {symbol.code} — {symbol.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="alert-condition" className={labelClassName}>
            Condition
          </label>
          <select
            id="alert-condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value as AlertCondition)}
            className={selectClassName}
          >
            <option value="BELOW">Price falls to</option>
            <option value="ABOVE">Price rises to</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="alert-threshold" className={labelClassName}>
            Threshold
          </label>
          <input
            id="alert-threshold"
            type="text"
            inputMode="decimal"
            value={threshold}
            onChange={(event) => {
              setThreshold(event.target.value)
              setValidation(null)
            }}
            placeholder={price !== undefined ? formatPrice(price) : '0.00'}
            className={`${compactFieldClassName} font-mono`}
          />
        </div>
      </div>

      {price !== undefined && (
        <p className="text-[13px] text-dim">
          Current price: <span className="font-mono text-label">{formatPrice(price)}</span>
        </p>
      )}

      {(validation ?? error) && (
        <p
          role="alert"
          className="rounded-[10px] border border-[#3a1824] bg-[#1a0e16] px-3 py-2.5 text-[13px] text-danger"
        >
          {validation ?? error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || symbols.length === 0}
        className={primaryButtonClassName}
      >
        {submitting ? 'Creating…' : 'Create alert'}
      </button>
    </form>
  )
}
