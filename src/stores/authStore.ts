import { create } from 'zustand'
import { authApi } from '../api/endpoints'
import { ApiError, setUnauthorizedHandler } from '../api/http'
import { toFailure } from '../lib/errors'
import { clearSession, loadSession, saveSession } from '../lib/session'
import type {
  ActionResult,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  Session,
  User,
  VerifyEmailInput,
} from '../types'

export type LoginResult =
  | ActionResult
  | (Extract<ActionResult, { ok: false }> & { unverified: true })

interface AuthState {
  user: User | null
  login: (input: LoginInput) => Promise<LoginResult>
  register: (input: RegisterInput) => Promise<ActionResult>
  verifyEmail: (input: VerifyEmailInput) => Promise<ActionResult>
  resendVerification: (email: string) => Promise<ActionResult>
  forgotPassword: (email: string) => Promise<ActionResult>
  resetPassword: (input: ResetPasswordInput) => Promise<ActionResult>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

const run = async (action: () => Promise<unknown>): Promise<ActionResult> => {
  try {
    await action()
    return { ok: true }
  } catch (error) {
    return toFailure(error)
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const startSession = (session: Session) => {
    saveSession(session)
    set({ user: session.user })
  }

  return {
    user: loadSession()?.user ?? null,
    login: async (input) => {
      try {
        startSession(await authApi.login(input))
        return { ok: true }
      } catch (error) {
        if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
          return { ok: false, unverified: true, message: error.message, fieldErrors: {} }
        }
        return toFailure(error)
      }
    },
    register: (input) => run(() => authApi.register(input)),
    verifyEmail: (input) => run(async () => startSession(await authApi.verifyEmail(input))),
    resendVerification: (email) => run(() => authApi.resendVerification(email)),
    forgotPassword: (email) => run(() => authApi.forgotPassword(email)),
    resetPassword: (input) => run(() => authApi.resetPassword(input)),
    logout: async () => {
      await authApi.logout().catch(() => undefined)
      clearSession()
      set({ user: null })
    },
    setUser: (user) => {
      const session = loadSession()
      if (session) saveSession({ ...session, user })
      set({ user })
    },
  }
})

setUnauthorizedHandler(() => useAuthStore.setState({ user: null }))
