import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormError, SubmitButton } from '../components/FormFeedback'
import { TextField } from '../components/TextField'
import { applyFailure, type FlowState } from '../lib/forms'
import { forgotPasswordSchema } from '../lib/validation'
import { useAuthStore } from '../stores/authStore'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPassword = useAuthStore((state) => state.forgotPassword)

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we will send you a code to choose a new password."
      backTo={{ to: '/login', label: 'Back to sign in' }}
    >
      <Formik
        initialValues={{ email: '' }}
        validationSchema={forgotPasswordSchema}
        onSubmit={async ({ email }, helpers) => {
          const result = await forgotPassword(email)
          if (!result.ok) return applyFailure(helpers, result)
          navigate('/reset-password', {
            state: {
              email,
              notice: 'If an account exists for that email, a code is on its way',
            } satisfies FlowState,
          })
        }}
      >
        {({ status, isSubmitting }) => (
          <Form className="space-y-[18px]" noValidate>
            <TextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
            <FormError message={status} />
            <SubmitButton submitting={isSubmitting}>Send reset code</SubmitButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
