import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { alertsApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { useAlertsStore } from '../stores/alertsStore'
import { useToastStore } from '../stores/toastStore'
import { buildAlert, buildSymbol } from '../test/factories'
import { AlertForm } from './AlertForm'

vi.mock('../api/endpoints', () => ({
  alertsApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}))

const api = vi.mocked(alertsApi)
const symbols = [buildSymbol(), buildSymbol({ id: 'sym-eth', code: 'ETH', name: 'Ethereum', price: 3200 })]

function Harness() {
  const [symbolId, setSymbolId] = useState(symbols[0].id)
  return (
    <AlertForm
      symbols={symbols}
      symbolId={symbolId}
      onSymbolChange={setSymbolId}
      currentPrice={() => 65000}
    />
  )
}

const renderForm = () => render(<Harness />)

describe('AlertForm', () => {
  beforeEach(() => {
    useAlertsStore.getState().reset()
    useToastStore.setState({ toasts: [] })
  })

  it('validates the threshold before calling the API', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Create alert' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a threshold greater than zero')

    await user.type(screen.getByLabelText('Threshold'), '-5')
    await user.click(screen.getByRole('button', { name: 'Create alert' }))
    expect(screen.getByRole('alert')).toHaveTextContent('greater than zero')
    expect(api.create).not.toHaveBeenCalled()
  })

  it('submits the selected values and resets the threshold', async () => {
    const user = userEvent.setup()
    api.create.mockResolvedValue(buildAlert({ id: 'created' }))
    renderForm()

    await user.selectOptions(screen.getByLabelText('Symbol'), 'sym-eth')
    await user.selectOptions(screen.getByLabelText('Condition'), 'ABOVE')
    await user.type(screen.getByLabelText('Threshold'), '3000.5')
    await user.click(screen.getByRole('button', { name: 'Create alert' }))

    expect(api.create).toHaveBeenCalledWith({
      symbolId: 'sym-eth',
      condition: 'ABOVE',
      threshold: 3000.5,
    })
    expect(await screen.findByLabelText('Threshold')).toHaveValue('')
    expect(useAlertsStore.getState().items[0].id).toBe('created')
    expect(useToastStore.getState().toasts[0].title).toBe('Alert created')
  })

  it('shows server errors', async () => {
    const user = userEvent.setup()
    api.create.mockRejectedValue(new ApiError(422, 'Active alert limit of 50 reached'))
    renderForm()

    await user.type(screen.getByLabelText('Threshold'), '10')
    await user.click(screen.getByRole('button', { name: 'Create alert' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Active alert limit of 50 reached')
  })

  it('shows the current price of the selected symbol', () => {
    renderForm()
    expect(screen.getByText('65,000.00', { selector: 'span' })).toBeInTheDocument()
  })

  it('defaults to a falling-price alert and accepts thousands separators', async () => {
    const user = userEvent.setup()
    api.create.mockResolvedValue(buildAlert({ id: 'created' }))
    renderForm()

    expect(screen.getByLabelText('Condition')).toHaveValue('BELOW')
    await user.type(screen.getByLabelText('Threshold'), '64,000.5')
    await user.click(screen.getByRole('button', { name: 'Create alert' }))

    expect(api.create).toHaveBeenCalledWith({
      symbolId: 'sym-btc',
      condition: 'BELOW',
      threshold: 64000.5,
    })
  })

  it('clears the threshold when the selected symbol changes', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Threshold'), '123')
    await user.selectOptions(screen.getByLabelText('Symbol'), 'sym-eth')

    expect(screen.getByLabelText('Threshold')).toHaveValue('')
  })
})
