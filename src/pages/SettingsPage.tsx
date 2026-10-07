import { Form, Formik } from 'formik'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { FormError, SubmitButton } from '../components/FormFeedback'
import { panelClassName } from '../components/Panel'
import { PasswordField } from '../components/PasswordField'
import { TextField } from '../components/TextField'
import { applyFailure, type FlowState } from '../lib/forms'
import { changePasswordSchema, deleteAccountSchema, profileSchema } from '../lib/validation'
import { useAuthStore } from '../stores/authStore'
import { useProfileStore } from '../stores/profileStore'
import { useToastStore } from '../stores/toastStore'

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className={`${panelClassName} space-y-5 p-6`}>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ProfileCard() {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const pushToast = useToastStore((state) => state.push)

  return (
    <Card title="Profile" description="Your name is shown in the dashboard header">
      <Formik
        enableReinitialize
        initialValues={{ name: user?.name ?? '' }}
        validationSchema={profileSchema}
        onSubmit={async ({ name }, helpers) => {
          const result = await updateProfile(name.trim())
          if (!result.ok) return applyFailure(helpers, result)
          pushToast({ kind: 'success', title: 'Profile updated' })
        }}
      >
        {({ status, isSubmitting, dirty }) => (
          <Form className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <p className="text-[13px] font-semibold text-label">Email</p>
              <p className="flex items-center gap-2 text-sm text-muted">
                {user?.email}
                {user?.emailVerified && (
                  <span className="rounded-full bg-[#0f2a22] px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.05em] text-accent">
                    Verified
                  </span>
                )}
              </p>
            </div>
            <TextField name="name" label="Name" autoComplete="name" />
            <FormError message={status} />
            <div className="max-w-40">
              <SubmitButton submitting={isSubmitting || !dirty} busyLabel="Save changes">
                Save changes
              </SubmitButton>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  )
}

function PasswordCard() {
  const changePassword = useProfileStore((state) => state.changePassword)
  const pushToast = useToastStore((state) => state.push)

  return (
    <Card title="Password" description="Changing your password signs out your other sessions">
      <Formik
        initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        validationSchema={changePasswordSchema}
        onSubmit={async ({ currentPassword, newPassword }, helpers) => {
          const result = await changePassword({ currentPassword, newPassword })
          if (!result.ok) return applyFailure(helpers, result)
          helpers.resetForm()
          pushToast({ kind: 'success', title: 'Password changed' })
        }}
      >
        {({ status, isSubmitting }) => (
          <Form className="space-y-4" noValidate>
            <PasswordField
              name="currentPassword"
              label="Current password"
              autoComplete="current-password"
            />
            <PasswordField name="newPassword" label="New password" autoComplete="new-password" />
            <PasswordField
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
            />
            <FormError message={status} />
            <div className="max-w-48">
              <SubmitButton submitting={isSubmitting}>Change password</SubmitButton>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  )
}

function DangerCard() {
  const navigate = useNavigate()
  const deleteAccount = useProfileStore((state) => state.deleteAccount)
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="space-y-5 rounded-[18px] border border-[#3a1824] bg-[#1a0e16]/40 p-6">
      <div>
        <h2 className="text-lg font-bold text-danger">Delete account</h2>
        <p className="mt-1 text-sm text-muted">
          Permanently removes your account and all of your alerts. This cannot be undone.
        </p>
      </div>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="h-11 cursor-pointer rounded-[10px] border border-down/50 bg-transparent px-4 text-sm font-semibold text-danger transition hover:bg-down/10"
        >
          Delete my account
        </button>
      ) : (
        <Formik
          initialValues={{ password: '' }}
          validationSchema={deleteAccountSchema}
          onSubmit={async ({ password }, helpers) => {
            const result = await deleteAccount(password)
            if (!result.ok) return applyFailure(helpers, result)
            navigate('/login', {
              replace: true,
              state: { notice: 'Your account has been deleted.' } satisfies FlowState,
            })
          }}
        >
          {({ status, isSubmitting }) => (
            <Form className="space-y-4" noValidate>
              <PasswordField
                name="password"
                label="Confirm with your password"
                autoComplete="current-password"
              />
              <FormError message={status} />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 cursor-pointer rounded-[10px] border-0 bg-down px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {isSubmitting ? 'Deleting…' : 'Permanently delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-11 cursor-pointer rounded-[10px] border border-edge bg-transparent px-4 text-sm font-semibold text-label transition hover:bg-[#111a2a]"
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </section>
  )
}

export function SettingsPage() {
  return (
    <div className="min-h-full">
      <AppHeader showConnection={false} />
      <main className="mx-auto max-w-[720px] space-y-6 px-4 py-8 sm:px-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[30px] font-extrabold tracking-[-0.02em]">Settings</h1>
          <Link to="/" className="text-sm font-semibold text-accent transition hover:text-[#6ff0b8]">
            &larr; Back to dashboard
          </Link>
        </div>
        <ProfileCard />
        <PasswordCard />
        <DangerCard />
      </main>
    </div>
  )
}
