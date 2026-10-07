import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LivePrice } from '../stores/pricesStore'
import { buildSymbol } from '../test/factories'
import { PriceTable } from './PriceTable'

const live = (overrides: Partial<LivePrice>): LivePrice => ({
  symbolId: 'sym-btc',
  code: 'BTC',
  price: 66000,
  previousPrice: 65000,
  open: 65000,
  changePercent: 1.54,
  direction: 'up',
  sequence: 1,
  ...overrides,
})

describe('PriceTable', () => {
  it('shows the last known price before any live update', () => {
    render(<PriceTable symbols={[buildSymbol()]} prices={{}} />)

    const row = screen.getByTestId('row-BTC')
    expect(within(row).getByText('65,000.00')).toBeInTheDocument()
    expect(within(row).getByText('0.00%')).toBeInTheDocument()
  })

  it('renders live prices with direction styling', () => {
    render(
      <PriceTable
        symbols={[buildSymbol(), buildSymbol({ id: 'sym-eth', code: 'ETH', name: 'Ethereum', price: 3200 })]}
        prices={{
          'sym-btc': live({}),
          'sym-eth': live({
            symbolId: 'sym-eth',
            code: 'ETH',
            price: 3100,
            previousPrice: 3200,
            open: 3200,
            changePercent: -3.12,
            direction: 'down',
          }),
        }}
      />,
    )

    const btc = screen.getByTestId('row-BTC')
    const eth = screen.getByTestId('row-ETH')
    expect(within(btc).getByText('66,000.00')).toHaveStyle({ color: 'rgb(25, 217, 139)' })
    expect(within(btc).getByText('+1.54%')).toBeInTheDocument()
    expect(within(eth).getByText('3,100.00')).toHaveStyle({ color: 'rgb(255, 93, 115)' })
    expect(within(eth).getByText('-3.12%')).toBeInTheDocument()
  })

  it('draws a trend line only once there is history', () => {
    const { container, rerender } = render(
      <PriceTable symbols={[buildSymbol()]} prices={{}} history={{ 'sym-btc': [1] }} />,
    )
    expect(container.querySelector('path')).toHaveAttribute('d', '')

    rerender(
      <PriceTable symbols={[buildSymbol()]} prices={{}} history={{ 'sym-btc': [1, 2, 3] }} />,
    )
    expect(container.querySelector('path')?.getAttribute('d')).toMatch(/^M0\.0 25\.0 L48\.0/)
  })

  it('reports the clicked symbol and marks the selected row', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <PriceTable
        symbols={[buildSymbol(), buildSymbol({ id: 'sym-eth', code: 'ETH', name: 'Ethereum' })]}
        prices={{}}
        selectedId="sym-eth"
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByTestId('row-BTC'))

    expect(onSelect).toHaveBeenCalledWith('sym-btc')
    expect(screen.getByTestId('row-ETH')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('row-BTC')).toHaveAttribute('aria-selected', 'false')
  })

  it('renders an empty state', () => {
    render(<PriceTable symbols={[]} prices={{}} />)
    expect(screen.getByText('No symbols available.')).toBeInTheDocument()
  })
})
