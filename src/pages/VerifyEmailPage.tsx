import { Form, Formik } from 'formik'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { FormError, FormNotice, SubmitButton } from '../components/FormFeedback'
import { TextField } from '../components/TextField'
import { useCountdown } from '../hooks/useCountdown'
import { applyFailure, type FlowState } from '../lib/forms'
import { verifyEmailSchema } from '../lib/validation'
import { useAuthStore } from '../stores/authStore'

const RESEND_COOLDOWN_SECONDS = 60

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const state = useLocation().state as FlowState | null
  const { verifyEmail, resendVerification } = useAuthStore()
  const [notice, setNotice] = useState(state?.notice)
  const { remaining, restart } = useCountdown(RESEND_COOLDOWN_SECONDS)
  const [resendError, setResendError] = useState<string>()

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we emailed you"
      backTo={{ to: '/login', label: 'Back to sign in' }}
    >
      <Formik
        initialValues={{ email: state?.email ?? '', otp: '' }}
        validationSchema={verifyEmailSchema}
        onSubmit={async (values, helpers) => {
          const result = await verifyEmail(values)
          if (result.ok) return navigate('/', { replace: true })
          applyFailure(helpers, result)
        }}
      >
        {({ status, isSubmitting, values }) => (
          <Form className="space-y-[18px]" noValidate>
            <FormNotice message={notice} />
            {!state?.email && (
              <TextField name="email" label="Email" type="email" autoComplete="email" />
            )}
            <TextField
              name="otp"
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="text-center font-mono text-xl tracking-[0.5em]"
            />
            <FormError message={status ?? resendError} />
            <SubmitButton submitting={isSubmitting}>Verify email</SubmitButton>
            <button
              type="button"
              disabled={remaining > 0 || !values.email}
              onClick={async () => {
                setResendError(undefined)
                const result = await resendVerification(values.email)
                if (result.ok) {
                  setNotice('A new code is on its way')
                  restart()
                } else {
                  setResendError(result.message)
                }
              }}
              className="w-full cursor-pointer text-sm font-medium text-muted transition enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
            </button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
