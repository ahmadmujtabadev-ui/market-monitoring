import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { loadSession, saveSession } from '../lib/session'
import { buildSession } from '../test/factories'
import { useAuthStore } from './authStore'

vi.mock('../api/endpoints', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    logout: vi.fn(),
  },
}))

const api = vi.mocked(authApi)

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null })
  })

  it('stores the session and user after login', async () => {
    const session = buildSession()
    api.login.mockResolvedValue(session)

    const result = await useAuthStore.getState().login({ email: 'jane@example.com', password: 'x' })

    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().user).toEqual(session.user)
    expect(loadSession()).toEqual(session)
  })

  it('returns the failure message without storing anything', async () => {
    api.login.mockRejectedValue(new ApiError(401, 'Invalid credentials'))

    const result = await useAuthStore.getState().login({ email: 'a@b.com', password: 'bad' })

    expect(result).toMatchObject({ ok: false, message: 'Invalid credentials' })
    expect(useAuthStore.getState().user).toBeNull()
    expect(loadSession()).toBeNull()
  })

  it('flags unverified accounts so the UI can route to verification', async () => {
    api.login.mockRejectedValue(new ApiError(403, 'Email not verified', [], 'EMAIL_NOT_VERIFIED'))

    const result = await useAuthStore.getState().login({ email: 'a@b.com', password: 'x' })

    expect(result).toMatchObject({ ok: false, unverified: true })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('registers without creating a session', async () => {
    api.register.mockResolvedValue({ email: 'jane@example.com', verificationRequired: true })

    const result = await useAuthStore
      .getState()
      .register({ name: 'Jane', email: 'jane@example.com', password: 'Passw0rdX' })

    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().user).toBeNull()
    expect(loadSession()).toBeNull()
  })

  it('maps server field errors on registration', async () => {
    api.register.mockRejectedValue(
      new ApiError(400, 'Validation failed', [{ path: 'password', message: 'Too weak' }]),
    )

    const result = await useAuthStore
      .getState()
      .register({ name: 'Jane', email: 'jane@example.com', password: 'x' })

    expect(result).toMatchObject({ ok: false, fieldErrors: { password: 'Too weak' } })
  })

  it('starts a session once the email is verified', async () => {
    const session = buildSession()
    api.verifyEmail.mockResolvedValue(session)

    const result = await useAuthStore
      .getState()
      .verifyEmail({ email: 'jane@example.com', otp: '123456' })

    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().user).toEqual(session.user)
    expect(loadSession()).toEqual(session)
  })

  it('reports an invalid code without a session', async () => {
    api.verifyEmail.mockRejectedValue(new ApiError(400, 'Invalid or expired code'))

    const result = await useAuthStore
      .getState()
      .verifyEmail({ email: 'jane@example.com', otp: '000000' })

    expect(result).toMatchObject({ ok: false, message: 'Invalid or expired code' })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('wraps the recovery calls', async () => {
    api.forgotPassword.mockResolvedValue(undefined)
    api.resetPassword.mockResolvedValue(undefined)
    api.resendVerification.mockResolvedValue(undefined)

    expect(await useAuthStore.getState().forgotPassword('a@b.com')).toEqual({ ok: true })
    expect(
      await useAuthStore
        .getState()
        .resetPassword({ email: 'a@b.com', otp: '123456', password: 'NewPassw0rd' }),
    ).toEqual({ ok: true })
    expect(await useAuthStore.getState().resendVerification('a@b.com')).toEqual({ ok: true })
  })

  it('clears local state on logout even if the request fails', async () => {
    saveSession(buildSession())
    useAuthStore.setState({ user: buildSession().user })
    api.logout.mockRejectedValue(new ApiError(500, 'boom'))

    await useAuthStore.getState().logout()

    expect(useAuthStore.getState().user).toBeNull()
    expect(loadSession()).toBeNull()
  })
})
