import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildAlert } from '../test/factories'
import { AlertList } from './AlertList'

const alerts = [
  buildAlert({ id: 'a', threshold: 70000 }),
  buildAlert({
    id: 'b',
    status: 'TRIGGERED',
    threshold: 60000,
    condition: 'BELOW',
    triggeredPrice: 59900,
    triggeredAt: '2026-01-02T10:00:00.000Z',
  }),
]

describe('AlertList', () => {
  it('lists alerts and filters by status', async () => {
    const user = userEvent.setup()
    render(<AlertList alerts={alerts} loading={false} onRemove={vi.fn()} />)

    expect(screen.getAllByTestId('alert-item')).toHaveLength(2)

    await user.click(screen.getByRole('tab', { name: 'Triggered' }))
    expect(screen.getAllByTestId('alert-item')).toHaveLength(1)
    expect(screen.getByText(/Fired at 59,900.00/)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Active' }))
    expect(screen.getAllByTestId('alert-item')).toHaveLength(1)
    expect(screen.queryByText(/Fired at/)).not.toBeInTheDocument()
  })

  it('calls onRemove with the alert id', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<AlertList alerts={[alerts[0]]} loading={false} onRemove={onRemove} />)

    await user.click(screen.getByRole('button', { name: 'Delete BTC alert' }))

    expect(onRemove).toHaveBeenCalledWith('a')
  })

  it('shows an empty state', () => {
    render(<AlertList alerts={[]} loading={false} onRemove={vi.fn()} />)
    expect(screen.getByText('No alerts to show.')).toBeInTheDocument()
  })
})
