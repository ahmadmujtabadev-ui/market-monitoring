import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { loadSession, saveSession } from '../lib/session'
import { buildSession, buildUser } from '../test/factories'
import { useAuthStore } from './authStore'
import { useProfileStore } from './profileStore'

vi.mock('../api/endpoints', () => ({
  authApi: { logout: vi.fn() },
  usersApi: { updateProfile: vi.fn(), changePassword: vi.fn(), deleteAccount: vi.fn() },
}))

const api = vi.mocked(usersApi)

describe('profileStore', () => {
  beforeEach(() => {
    saveSession(buildSession())
    useAuthStore.setState({ user: buildSession().user })
  })

  it('updates the profile and keeps the stored session in sync', async () => {
    api.updateProfile.mockResolvedValue(buildUser({ name: 'Renamed' }))

    const result = await useProfileStore.getState().updateProfile('Renamed')

    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().user?.name).toBe('Renamed')
    expect(loadSession()?.user.name).toBe('Renamed')
    expect(loadSession()?.accessToken).toBe('access-1')
  })

  it('surfaces profile errors', async () => {
    api.updateProfile.mockRejectedValue(new ApiError(500, 'boom'))
    expect(await useProfileStore.getState().updateProfile('X')).toMatchObject({
      ok: false,
      message: 'boom',
    })
  })

  it('replaces the session after a password change', async () => {
    api.changePassword.mockResolvedValue(
      buildSession({ accessToken: 'access-2', refreshToken: 'refresh-2' }),
    )

    const result = await useProfileStore
      .getState()
      .changePassword({ currentPassword: 'Old', newPassword: 'NewPassw0rd' })

    expect(result).toEqual({ ok: true })
    expect(loadSession()?.refreshToken).toBe('refresh-2')
  })

  it('maps an incorrect current password onto its field', async () => {
    api.changePassword.mockRejectedValue(
      new ApiError(400, 'Validation failed', [
        { path: 'currentPassword', message: 'Incorrect password' },
      ]),
    )

    const result = await useProfileStore
      .getState()
      .changePassword({ currentPassword: 'bad', newPassword: 'NewPassw0rd' })

    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { currentPassword: 'Incorrect password' },
    })
    expect(loadSession()?.refreshToken).toBe('refresh-1')
  })

  it('clears the session after deleting the account', async () => {
    api.deleteAccount.mockResolvedValue(undefined)

    const result = await useProfileStore.getState().deleteAccount('Passw0rdX')

    expect(api.deleteAccount).toHaveBeenCalledWith('Passw0rdX')
    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().user).toBeNull()
    expect(loadSession()).toBeNull()
  })

  it('keeps the session when deletion fails', async () => {
    api.deleteAccount.mockRejectedValue(
      new ApiError(400, 'Validation failed', [{ path: 'password', message: 'Incorrect password' }]),
    )

    const result = await useProfileStore.getState().deleteAccount('bad')

    expect(result).toMatchObject({ ok: false, fieldErrors: { password: 'Incorrect password' } })
    expect(useAuthStore.getState().user).not.toBeNull()
    expect(loadSession()).not.toBeNull()
  })
})
