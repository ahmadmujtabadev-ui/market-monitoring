import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { useAuthStore } from '../stores/authStore'
import { buildSession } from '../test/factories'
import { renderRoutes } from '../test/renderRoutes'
import { LoginPage } from './LoginPage'

vi.mock('../api/endpoints', () => ({
  authApi: { login: vi.fn(), logout: vi.fn() },
}))

const api = vi.mocked(authApi)

const renderPage = (notice?: string) =>
  renderRoutes(<LoginPage />, {
    path: '/login',
    initialEntry: { pathname: '/login', state: notice ? { notice } : null },
    extraRoutes: { '/': 'Dashboard', '/verify-email': 'Verify page' },
  })

describe('LoginPage', () => {
  beforeEach(() => useAuthStore.setState({ user: null }))

  it('validates before calling the API', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(api.login).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.tab()
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('logs in and goes to the dashboard', async () => {
    const user = userEvent.setup()
    api.login.mockResolvedValue(buildSession())
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'Passw0rdX')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(api.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'Passw0rdX' })
    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })

  it('shows the server error and stays on the page', async () => {
    const user = userEvent.setup()
    api.login.mockRejectedValue(new ApiError(401, 'Invalid credentials'))
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('sends unverified users to the verification page with their email', async () => {
    const user = userEvent.setup()
    api.login.mockRejectedValue(new ApiError(403, 'Email not verified', [], 'EMAIL_NOT_VERIFIED'))
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'Passw0rdX')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Verify page')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('jane@example.com')
  })

  it('shows flow notices and links to password recovery', () => {
    renderPage('Password updated. Sign in with your new password.')
    expect(screen.getByRole('status')).toHaveTextContent('Password updated')
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })

  it('has a password visibility toggle', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
  })
})
