import { beforeEach, describe, expect, it, vi } from 'vitest'
import { alertsApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { buildAlert } from '../test/factories'
import { useAlertsStore } from './alertsStore'

vi.mock('../api/endpoints', () => ({
  alertsApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}))

const api = vi.mocked(alertsApi)

describe('alertsStore', () => {
  beforeEach(() => {
    useAlertsStore.getState().reset()
  })

  it('loads alerts', async () => {
    api.list.mockResolvedValue({ items: [buildAlert()], total: 1, page: 1, limit: 100 })

    await useAlertsStore.getState().fetch()

    const state = useAlertsStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('exposes load failures', async () => {
    api.list.mockRejectedValue(new ApiError(500, 'Internal server error'))

    await useAlertsStore.getState().fetch()

    expect(useAlertsStore.getState().error).toBe('Internal server error')
  })

  it('prepends created alerts', async () => {
    useAlertsStore.setState({ items: [buildAlert({ id: 'old' })] })
    api.create.mockResolvedValue(buildAlert({ id: 'new' }))

    const created = await useAlertsStore
      .getState()
      .create({ symbolId: 'sym-btc', condition: 'ABOVE', threshold: 1 })

    expect(created).toBe(true)
    expect(useAlertsStore.getState().items.map((item) => item.id)).toEqual(['new', 'old'])
  })

  it('reports validation errors on create', async () => {
    api.create.mockRejectedValue(
      new ApiError(400, 'Validation failed', [{ path: 'threshold', message: 'Too small' }]),
    )

    const created = await useAlertsStore
      .getState()
      .create({ symbolId: 'sym-btc', condition: 'ABOVE', threshold: -1 })

    expect(created).toBe(false)
    expect(useAlertsStore.getState().error).toBe('threshold: Too small')
    expect(useAlertsStore.getState().submitting).toBe(false)
  })

  it('removes alerts optimistically and restores them on failure', async () => {
    useAlertsStore.setState({ items: [buildAlert({ id: 'a' }), buildAlert({ id: 'b' })] })
    api.remove.mockRejectedValue(new ApiError(500, 'boom'))

    const pending = useAlertsStore.getState().remove('a')
    expect(useAlertsStore.getState().items.map((item) => item.id)).toEqual(['b'])
    await pending

    expect(useAlertsStore.getState().items.map((item) => item.id)).toEqual(['a', 'b'])
    expect(useAlertsStore.getState().error).toBe('boom')
  })

  it('replaces an existing alert when it is triggered', () => {
    useAlertsStore.setState({ items: [buildAlert({ id: 'a' }), buildAlert({ id: 'b' })] })

    useAlertsStore
      .getState()
      .applyTriggered(buildAlert({ id: 'b', status: 'TRIGGERED', triggeredPrice: 71000 }))

    const items = useAlertsStore.getState().items
    expect(items.find((item) => item.id === 'b')?.status).toBe('TRIGGERED')
    expect(items).toHaveLength(2)
  })

  it('adds a triggered alert that is not yet known locally', () => {
    useAlertsStore.getState().applyTriggered(buildAlert({ id: 'z', status: 'TRIGGERED' }))
    expect(useAlertsStore.getState().items.map((item) => item.id)).toEqual(['z'])
  })
})
