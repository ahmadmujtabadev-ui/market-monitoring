export interface DemoAsset {
  code: string
  price: number
  open: number
  history: number[]
}

const START: Array<[string, number]> = [
  ['BTC', 64064.88],
  ['ETH', 3155.51],
  ['SOL', 143.95],
]

const HISTORY_LENGTH = 30
const drift = (value: number, spread: number) => value * (1 + (Math.random() - 0.5) * spread)

export const createDemoMarket = (): DemoAsset[] =>
  START.map(([code, price]) => {
    const history = [price]
    for (let i = 1; i < HISTORY_LENGTH; i += 1) history.unshift(drift(history[0], 0.004))
    return { code, price, open: history[0], history }
  })

export const advanceDemoMarket = (assets: DemoAsset[]): DemoAsset[] =>
  assets.map((asset) => {
    const price = drift(asset.price, 0.0016)
    return { ...asset, price, history: [...asset.history.slice(1), price] }
  })
