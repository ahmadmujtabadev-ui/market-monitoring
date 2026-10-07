import type { Alert, MarketSymbol, Session, User } from '../types'

export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane',
  role: 'USER',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

export const buildSession = (overrides: Partial<Session> = {}): Session => ({
  user: buildUser(),
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  ...overrides,
})

export const buildSymbol = (overrides: Partial<MarketSymbol> = {}): MarketSymbol => ({
  id: 'sym-btc',
  code: 'BTC',
  name: 'Bitcoin',
  price: 65000,
  volatility: 0.002,
  isActive: true,
  ...overrides,
})

export const buildAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'alert-1',
  symbolId: 'sym-btc',
  symbol: { id: 'sym-btc', code: 'BTC', name: 'Bitcoin' },
  condition: 'ABOVE',
  threshold: 70000,
  status: 'ACTIVE',
  triggeredAt: null,
  triggeredPrice: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
