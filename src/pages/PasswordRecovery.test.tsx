import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { authApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { renderRoutes } from '../test/renderRoutes'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { ResetPasswordPage } from './ResetPasswordPage'

vi.mock('../api/endpoints', () => ({
  authApi: { forgotPassword: vi.fn(), resetPassword: vi.fn(), logout: vi.fn() },
}))

const api = vi.mocked(authApi)

describe('ForgotPasswordPage', () => {
  const renderPage = () =>
    renderRoutes(<ForgotPasswordPage />, {
      path: '/forgot-password',
      extraRoutes: { '/reset-password': 'Reset page' },
    })

  it('validates the email', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(api.forgotPassword).not.toHaveBeenCalled()
  })

  it('requests a code and continues to the reset page', async () => {
    const user = userEvent.setup()
    api.forgotPassword.mockResolvedValue(undefined)
    renderPage()

    await user.type(screen.getByLabelText('Email'), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(api.forgotPassword).toHaveBeenCalledWith('jane@example.com')
    expect(await screen.findByText('Reset page')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('jane@example.com')
  })
})

describe('ResetPasswordPage', () => {
  const renderPage = () =>
    renderRoutes(<ResetPasswordPage />, {
      path: '/reset-password',
      initialEntry: { pathname: '/reset-password', state: { email: 'jane@example.com' } },
      extraRoutes: { '/login': 'Login page' },
    })

  const fill = async (user: ReturnType<typeof userEvent.setup>, password = 'BrandNew123', confirm = password) => {
    await user.type(screen.getByLabelText('Reset code'), '123456')
    await user.type(screen.getByLabelText('New password'), password)
    await user.type(screen.getByLabelText('Confirm new password'), confirm)
  }

  it('validates matching strong passwords', async () => {
    const user = userEvent.setup()
    renderPage()

    await fill(user, 'BrandNew123', 'Mismatch123')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
    expect(api.resetPassword).not.toHaveBeenCalled()
  })

  it('resets the password and returns to login with a notice', async () => {
    const user = userEvent.setup()
    api.resetPassword.mockResolvedValue(undefined)
    renderPage()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(api.resetPassword).toHaveBeenCalledWith({
      email: 'jane@example.com',
      otp: '123456',
      password: 'BrandNew123',
    })
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('Password updated')
  })

  it('shows an invalid code error', async () => {
    const user = userEvent.setup()
    api.resetPassword.mockRejectedValue(new ApiError(400, 'Invalid or expired code'))
    renderPage()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired code')
  })

  it('toggles visibility on both password fields independently', async () => {
    const user = userEvent.setup()
    renderPage()
    const [first] = screen.getAllByRole('button', { name: 'Show password' })

    await user.click(first)

    expect(screen.getByLabelText('New password')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Confirm new password')).toHaveAttribute('type', 'password')
  })
})
