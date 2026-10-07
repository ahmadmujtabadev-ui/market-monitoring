import { Form, Formik } from 'formik'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout, linkClassName } from '../components/AuthLayout'
import { FormError, FormNotice, SubmitButton } from '../components/FormFeedback'
import { PasswordField } from '../components/PasswordField'
import { TextField } from '../components/TextField'
import { applyFailure, type FlowState } from '../lib/forms'
import { loginSchema } from '../lib/validation'
import { useAuthStore } from '../stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const notice = (useLocation().state as FlowState | null)?.notice
  const login = useAuthStore((state) => state.login)

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your dashboard."
      footer={
        <>
          No account?{' '}
          <Link to="/register" className={linkClassName}>
            Create one
          </Link>
        </>
      }
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={async (values, helpers) => {
          const result = await login(values)
          if (result.ok) return navigate('/', { replace: true })
          if ('unverified' in result) {
            return navigate('/verify-email', {
              state: { email: values.email, notice: result.message } satisfies FlowState,
            })
          }
          applyFailure(helpers, result)
        }}
      >
        {({ status, isSubmitting }) => (
          <Form className="space-y-[18px]" noValidate>
            <FormNotice message={notice} />
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
              autoComplete="current-password"
              placeholder="Enter your password"
              labelAside={
                <Link to="/forgot-password" className={`text-[13px] font-medium ${linkClassName}`}>
                  Forgot password?
                </Link>
              }
            />
            <FormError message={status} />
            <SubmitButton submitting={isSubmitting}>Sign in</SubmitButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
