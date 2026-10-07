import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { describe, expect, it, vi } from 'vitest'
import { PasswordField } from './PasswordField'

const renderField = () =>
  render(
    <Formik initialValues={{ password: '' }} onSubmit={() => undefined}>
      <PasswordField name="password" label="Password" />
    </Formik>,
  )

describe('PasswordField', () => {
  it('hides the password by default and toggles visibility with the eye button', async () => {
    const user = userEvent.setup()
    renderField()
    const input = screen.getByLabelText('Password')
    await user.type(input, 'Secret123')

    expect(input).toHaveAttribute('type', 'password')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('Secret123')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('does not submit the form when toggling', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Formik initialValues={{ password: '' }} onSubmit={onSubmit}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <PasswordField name="password" label="Password" />
          </form>
        )}
      </Formik>,
    )

    await user.click(screen.getByRole('button', { name: 'Show password' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
