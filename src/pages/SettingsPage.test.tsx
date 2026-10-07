import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { loadSession, saveSession } from '../lib/session'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import { buildSession, buildUser } from '../test/factories'
import { renderRoutes } from '../test/renderRoutes'
import { SettingsPage } from './SettingsPage'

vi.mock('../api/endpoints', () => ({
  authApi: { logout: vi.fn() },
  usersApi: { updateProfile: vi.fn(), changePassword: vi.fn(), deleteAccount: vi.fn() },
}))

const api = vi.mocked(usersApi)

const renderPage = () =>
  renderRoutes(<SettingsPage />, {
    path: '/settings',
    extraRoutes: { '/login': 'Login page', '/': 'Dashboard' },
  })

describe('SettingsPage', () => {
  beforeEach(() => {
    saveSession(buildSession())
    useAuthStore.setState({ user: buildSession().user })
    useToastStore.setState({ toasts: [] })
  })

  it('shows the account email with its verified badge', () => {
    renderPage()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('updates the name', async () => {
    const user = userEvent.setup()
    api.updateProfile.mockResolvedValue(buildUser({ name: 'Janet' }))
    renderPage()

    const name = screen.getByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Janet')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(api.updateProfile).toHaveBeenCalledWith('Janet')
    expect(await screen.findByDisplayValue('Janet')).toBeInTheDocument()
    expect(useAuthStore.getState().user?.name).toBe('Janet')
    expect(useToastStore.getState().toasts[0].title).toBe('Profile updated')
  })

  it('rejects an empty name', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.clear(screen.getByLabelText('Name'))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(api.updateProfile).not.toHaveBeenCalled()
  })

  it('validates a new password that differs from the current one', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Current password'), 'Passw0rdX')
    await user.type(screen.getByLabelText('New password'), 'Passw0rdX')
    await user.type(screen.getByLabelText('Confirm new password'), 'Passw0rdX')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(
      await screen.findByText('Must be different from the current password'),
    ).toBeInTheDocument()
    expect(api.changePassword).not.toHaveBeenCalled()
  })

  it('changes the password and keeps the new session', async () => {
    const user = userEvent.setup()
    api.changePassword.mockResolvedValue(buildSession({ refreshToken: 'refresh-2' }))
    renderPage()

    await user.type(screen.getByLabelText('Current password'), 'Passw0rdX')
    await user.type(screen.getByLabelText('New password'), 'BrandNew123')
    await user.type(screen.getByLabelText('Confirm new password'), 'BrandNew123')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(api.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Passw0rdX',
      newPassword: 'BrandNew123',
    })
    expect(await screen.findByLabelText('Current password')).toHaveValue('')
    expect(loadSession()?.refreshToken).toBe('refresh-2')
    expect(useToastStore.getState().toasts[0].title).toBe('Password changed')
  })

  it('shows the server error on the current password field', async () => {
    const user = userEvent.setup()
    api.changePassword.mockRejectedValue(
      new ApiError(400, 'Validation failed', [
        { path: 'currentPassword', message: 'Incorrect password' },
      ]),
    )
    renderPage()

    await user.type(screen.getByLabelText('Current password'), 'WrongPass1')
    await user.type(screen.getByLabelText('New password'), 'BrandNew123')
    await user.type(screen.getByLabelText('Confirm new password'), 'BrandNew123')
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    expect(await screen.findByText('Incorrect password')).toBeInTheDocument()
  })

  it('requires a password and an explicit confirmation to delete the account', async () => {
    const user = userEvent.setup()
    api.deleteAccount.mockResolvedValue(undefined)
    renderPage()

    expect(screen.queryByRole('button', { name: 'Permanently delete' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete my account' }))

    await user.click(screen.getByRole('button', { name: 'Permanently delete' }))
    expect(await screen.findByText('Enter your password to confirm')).toBeInTheDocument()
    expect(api.deleteAccount).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Confirm with your password'), 'Passw0rdX')
    await user.click(screen.getByRole('button', { name: 'Permanently delete' }))

    expect(api.deleteAccount).toHaveBeenCalledWith('Passw0rdX')
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('Your account has been deleted.')
    expect(loadSession()).toBeNull()
  })

  it('can cancel the deletion and keeps the account when the password is wrong', async () => {
    const user = userEvent.setup()
    api.deleteAccount.mockRejectedValue(
      new ApiError(400, 'Validation failed', [{ path: 'password', message: 'Incorrect password' }]),
    )
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Delete my account' }))
    await user.type(screen.getByLabelText('Confirm with your password'), 'WrongPass1')
    await user.click(screen.getByRole('button', { name: 'Permanently delete' }))
    expect(await screen.findByText('Incorrect password')).toBeInTheDocument()
    expect(loadSession()).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeInTheDocument()
  })
})
