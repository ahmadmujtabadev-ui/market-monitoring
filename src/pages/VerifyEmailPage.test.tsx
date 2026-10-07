import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { loadSession } from '../lib/session'
import { useAuthStore } from '../stores/authStore'
import { buildSession } from '../test/factories'
import { renderRoutes } from '../test/renderRoutes'
import { VerifyEmailPage } from './VerifyEmailPage'

vi.mock('../api/endpoints', () => ({
  authApi: { verifyEmail: vi.fn(), resendVerification: vi.fn(), logout: vi.fn() },
}))

const api = vi.mocked(authApi)

const renderPage = (email?: string) =>
  renderRoutes(<VerifyEmailPage />, {
    path: '/verify-email',
    initialEntry: {
      pathname: '/verify-email',
      state: email ? { email, notice: 'We sent a 6-digit code' } : null,
    },
    extraRoutes: { '/': 'Dashboard' },
  })

describe('VerifyEmailPage', () => {
  beforeEach(() => useAuthStore.setState({ user: null }))

  it('validates the code format', async () => {
    const user = userEvent.setup()
    renderPage('jane@example.com')

    await user.type(screen.getByLabelText('Verification code'), '12ab')
    await user.click(screen.getByRole('button', { name: 'Verify email' }))

    expect(await screen.findByText('Enter the 6-digit code')).toBeInTheDocument()
    expect(api.verifyEmail).not.toHaveBeenCalled()
  })

  it('verifies the code, starts a session and opens the dashboard', async () => {
    const user = userEvent.setup()
    api.verifyEmail.mockResolvedValue(buildSession())
    renderPage('jane@example.com')

    expect(screen.getByRole('status')).toHaveTextContent('We sent a 6-digit code')
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Verification code'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verify email' }))

    expect(api.verifyEmail).toHaveBeenCalledWith({ email: 'jane@example.com', otp: '123456' })
    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
    expect(loadSession()).not.toBeNull()
  })

  it('shows an invalid code error', async () => {
    const user = userEvent.setup()
    api.verifyEmail.mockRejectedValue(new ApiError(400, 'Invalid or expired code'))
    renderPage('jane@example.com')

    await user.type(screen.getByLabelText('Verification code'), '000000')
    await user.click(screen.getByRole('button', { name: 'Verify email' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired code')
  })

  it('asks for the email when it was not passed along', () => {
    renderPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('locks resend during the cooldown and resends afterwards', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      api.resendVerification.mockResolvedValue(undefined)
      renderPage('jane@example.com')

      expect(screen.getByRole('button', { name: /Resend code in 60s/ })).toBeDisabled()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(61000)
      })
      const resend = screen.getByRole('button', { name: 'Resend code' })
      expect(resend).toBeEnabled()

      await user.click(resend)

      expect(api.resendVerification).toHaveBeenCalledWith('jane@example.com')
      expect(await screen.findByText('A new code is on its way')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Resend code in/ })).toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })
})
