import { useEffect, useState } from 'react'
import { advanceDemoMarket, createDemoMarket } from '../lib/demoMarket'
import { formatPercent, formatPrice } from '../lib/format'
import { Logo } from './Logo'
import { Sparkline } from './Sparkline'

export function AuthShowcase() {
  const [assets, setAssets] = useState(createDemoMarket)

  useEffect(() => {
    const timer = setInterval(() => setAssets(advanceDemoMarket), 1500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative hidden flex-col justify-between border-r border-line-soft bg-[radial-gradient(900px_500px_at_15%_10%,rgba(25,217,139,0.10),transparent_60%)] bg-panel-alt px-14 py-10 lg:flex">
      <Logo />

      <div className="max-w-[460px]">
        <h2 className="text-balance text-[44px] font-extrabold leading-[1.08] tracking-[-0.03em]">
          Watch the market. Get notified when it moves.
        </h2>
        <p className="mt-[18px] max-w-[400px] text-base leading-[1.55] text-muted">
          Live simulated prices for seven assets, with threshold alerts that fire the moment a
          price crosses your level.
        </p>
        <div className="mt-9 overflow-hidden rounded-2xl border border-line bg-panel">
          {assets.map((asset, index) => {
            const change = ((asset.price - asset.open) / asset.open) * 100
            const color = change >= 0 ? '#19d98b' : '#ff5d73'
            return (
              <div
                key={asset.code}
                className={`grid grid-cols-[56px_1fr_90px_72px] items-center gap-3 px-[18px] py-3.5 ${index > 0 ? 'border-t border-line-soft' : ''}`}
              >
                <div className="text-sm font-bold">{asset.code}</div>
                <Sparkline values={asset.history} color={color} className="h-6 w-full" />
                <div className="text-right font-mono text-sm" style={{ color }}>
                  {formatPrice(asset.price)}
                </div>
                <div className="text-right font-mono text-xs" style={{ color }}>
                  {formatPercent(change)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-dim">
        <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-accent" />
        Streaming live over Server-Sent Events
      </div>
    </div>
  )
}
