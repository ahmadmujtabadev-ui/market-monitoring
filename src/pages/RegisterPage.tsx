import { Form, Formik } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, linkClassName } from '../components/AuthLayout'
import { FormError, SubmitButton } from '../components/FormFeedback'
import { PasswordField } from '../components/PasswordField'
import { PasswordStrength } from '../components/PasswordStrength'
import { TextField } from '../components/TextField'
import { applyFailure, type FlowState } from '../lib/forms'
import { registerSchema } from '../lib/validation'
import { useAuthStore } from '../stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking prices and setting alerts."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className={linkClassName}>
            Sign in
          </Link>
        </>
      }
    >
      <Formik
        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={registerSchema}
        onSubmit={async ({ name, email, password }, helpers) => {
          const result = await register({ name, email, password })
          if (!result.ok) return applyFailure(helpers, result)
          navigate('/verify-email', {
            state: { email, notice: `We sent a 6-digit code to ${email}` } satisfies FlowState,
          })
        }}
      >
        {({ status, isSubmitting, values }) => (
          <Form className="space-y-4" noValidate>
            <TextField
              name="name"
              label="Full name"
              autoComplete="name"
              placeholder="Ada Lovelace"
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
            <PasswordField
              name="password"
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            >
              <PasswordStrength password={values.password} />
            </PasswordField>
            <PasswordField
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Repeat password"
            />
            <FormError message={status} />
            <div className="pt-1">
              <SubmitButton submitting={isSubmitting}>Create account</SubmitButton>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
