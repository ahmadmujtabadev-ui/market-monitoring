import { Form, Formik } from 'formik'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormError, FormNotice, SubmitButton } from '../components/FormFeedback'
import { PasswordField } from '../components/PasswordField'
import { TextField } from '../components/TextField'
import { applyFailure, type FlowState } from '../lib/forms'
import { resetPasswordSchema } from '../lib/validation'
import { useAuthStore } from '../stores/authStore'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const state = useLocation().state as FlowState | null
  const resetPassword = useAuthStore((store) => store.resetPassword)

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the code from your email and choose a new password."
      backTo={{ to: '/forgot-password', label: 'Request a new code' }}
    >
      <Formik
        initialValues={{ email: state?.email ?? '', otp: '', password: '', confirmPassword: '' }}
        validationSchema={resetPasswordSchema}
        onSubmit={async ({ email, otp, password }, helpers) => {
          const result = await resetPassword({ email, otp, password })
          if (!result.ok) return applyFailure(helpers, result)
          navigate('/login', {
            replace: true,
            state: { notice: 'Password updated. Sign in with your new password.' } satisfies FlowState,
          })
        }}
      >
        {({ status, isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <FormNotice message={state?.notice} />
            {!state?.email && (
              <TextField
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
              />
            )}
            <TextField
              name="otp"
              label="Reset code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="text-center font-mono text-xl tracking-[0.5em]"
            />
            <PasswordField name="password" label="New password" autoComplete="new-password" />
            <PasswordField
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
            />
            <FormError message={status} />
            <SubmitButton submitting={isSubmitting}>Reset password</SubmitButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
