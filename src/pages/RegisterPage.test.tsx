import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { authApi } from '../api/endpoints'
import { ApiError } from '../api/http'
import { renderRoutes } from '../test/renderRoutes'
import { RegisterPage } from './RegisterPage'

vi.mock('../api/endpoints', () => ({
  authApi: { register: vi.fn(), logout: vi.fn() },
}))

const api = vi.mocked(authApi)

const renderPage = () =>
  renderRoutes(<RegisterPage />, {
    path: '/register',
    extraRoutes: { '/verify-email': 'Verify page' },
  })

const fill = async (user: ReturnType<typeof userEvent.setup>, overrides: Record<string, string> = {}) => {
  const values = {
    'Full name': 'Jane',
    Email: 'jane@example.com',
    Password: 'Passw0rdX',
    'Confirm password': 'Passw0rdX',
    ...overrides,
  }
  for (const [label, value] of Object.entries(values)) {
    await user.type(screen.getByLabelText(label), value)
  }
}

describe('RegisterPage', () => {
  it('enforces the password rules with Yup', async () => {
    const user = userEvent.setup()
    renderPage()

    await fill(user, { Password: 'weak', 'Confirm password': 'weak' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument()
    expect(api.register).not.toHaveBeenCalled()
  })

  it('shows a live password strength meter', async () => {
    const user = userEvent.setup()
    renderPage()
    const meter = screen.getByTestId('password-strength')
    expect(meter).toHaveTextContent('')

    await user.type(screen.getByLabelText('Password'), 'abc')
    expect(meter).toHaveTextContent('Weak')

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'Passw0rd!x')
    expect(meter).toHaveTextContent('Strong')
  })

  it('requires matching passwords', async () => {
    const user = userEvent.setup()
    renderPage()

    await fill(user, { 'Confirm password': 'Different123' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
    expect(api.register).not.toHaveBeenCalled()
  })

  it('registers without sending the confirmation and moves on to verification', async () => {
    const user = userEvent.setup()
    api.register.mockResolvedValue({ email: 'jane@example.com', verificationRequired: true })
    renderPage()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(api.register).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Passw0rdX',
    })
    expect(await screen.findByText('Verify page')).toBeInTheDocument()
    expect(screen.getByTestId('state')).toHaveTextContent('jane@example.com')
  })

  it('shows a duplicate email error', async () => {
    const user = userEvent.setup()
    api.register.mockRejectedValue(new ApiError(409, 'Email is already registered'))
    renderPage()

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered')
  })
})
