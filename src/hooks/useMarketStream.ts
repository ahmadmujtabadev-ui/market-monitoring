import { useEffect } from 'react'
import { openMarketStream } from '../api/stream'
import { formatPrice } from '../lib/format'
import { useAlertsStore } from '../stores/alertsStore'
import { usePricesStore } from '../stores/pricesStore'
import { useToastStore } from '../stores/toastStore'

export const useMarketStream = (): void => {
  useEffect(() => {
    const controller = new AbortController()

    void openMarketStream(
      {
        onPrices: (batch) => usePricesStore.getState().applyBatch(batch),
        onStatus: (status) => usePricesStore.getState().setConnection(status),
        onAlert: (alert) => {
          useAlertsStore.getState().applyTriggered(alert)
          const verb = alert.condition === 'ABOVE' ? 'rose to' : 'fell to'
          useToastStore.getState().push({
            kind: 'alert',
            title: 'Alert triggered',
            message: `${alert.symbol?.code ?? 'Price'} ${verb} ${formatPrice(alert.triggeredPrice ?? alert.threshold)}`,
          })
        },
      },
      controller.signal,
    )

    return () => {
      controller.abort()
      usePricesStore.getState().reset()
    }
  }, [])
}
