import { useEffect, useState } from 'react'
import { AlertForm } from '../components/AlertForm'
import { AlertList } from '../components/AlertList'
import { AppHeader } from '../components/AppHeader'
import { Panel, panelClassName } from '../components/Panel'
import { PriceTable } from '../components/PriceTable'
import { useMarketStream } from '../hooks/useMarketStream'
import { useAlertsStore } from '../stores/alertsStore'
import { usePricesStore } from '../stores/pricesStore'
import { useSymbolsStore } from '../stores/symbolsStore'

export function DashboardPage() {
  const symbols = useSymbolsStore()
  const alerts = useAlertsStore()
  const prices = usePricesStore((state) => state.prices)
  const history = usePricesStore((state) => state.history)
  const [pickedSymbolId, setPickedSymbolId] = useState('')

  useMarketStream()

  useEffect(() => {
    void useSymbolsStore.getState().fetch()
    void useAlertsStore.getState().fetch()
    return () => useAlertsStore.getState().reset()
  }, [])

  const selectedSymbolId = pickedSymbolId || symbols.items[0]?.id || ''

  const currentPrice = (symbolId: string): number | undefined =>
    prices[symbolId]?.price ?? symbols.items.find((symbol) => symbol.id === symbolId)?.price

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-[1304px] flex-1 items-start gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className={`${panelClassName} overflow-hidden`}>
          <div className="flex items-baseline justify-between border-b border-line-soft px-4 py-[22px] sm:px-7">
            <h2 className="text-lg font-bold">Markets</h2>
            <p className="text-[13px] text-dim">USD · live updates</p>
          </div>
          {symbols.error && <p className="p-4 text-sm text-danger">{symbols.error}</p>}
          {symbols.loading && symbols.items.length === 0 ? (
            <p className="p-6 text-sm text-muted">Loading markets…</p>
          ) : (
            <PriceTable
              symbols={symbols.items}
              prices={prices}
              history={history}
              selectedId={selectedSymbolId}
              onSelect={setPickedSymbolId}
            />
          )}
        </section>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <Panel title="New price alert">
            <AlertForm
              symbols={symbols.items}
              symbolId={selectedSymbolId}
              onSymbolChange={setPickedSymbolId}
              currentPrice={currentPrice}
            />
          </Panel>
          <Panel title="Your alerts">
            <AlertList
              alerts={alerts.items}
              loading={alerts.loading}
              onRemove={(id) => void alerts.remove(id)}
            />
          </Panel>
        </div>
      </main>
    </div>
  )
}
