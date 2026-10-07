import type {
  Alert,
  AlertStatus,
  ChangePasswordInput,
  CreateAlertInput,
  LoginInput,
  MarketSymbol,
  Paginated,
  RegisterInput,
  RegistrationResult,
  ResetPasswordInput,
  Session,
  User,
  VerifyEmailInput,
} from '../types'
import { request } from './http'

export const authApi = {
  login: (input: LoginInput) =>
    request<Session>('/auth/login', { method: 'POST', body: input, auth: false }),
  register: (input: RegisterInput) =>
    request<RegistrationResult>('/auth/register', { method: 'POST', body: input, auth: false }),
  verifyEmail: (input: VerifyEmailInput) =>
    request<Session>('/auth/verify-email', { method: 'POST', body: input, auth: false }),
  resendVerification: (email: string) =>
    request<void>('/auth/resend-verification', { method: 'POST', body: { email }, auth: false }),
  forgotPassword: (email: string) =>
    request<void>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (input: ResetPasswordInput) =>
    request<void>('/auth/reset-password', { method: 'POST', body: input, auth: false }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
}

export const usersApi = {
  me: () => request<User>('/users/me'),
  updateProfile: (name: string) =>
    request<User>('/users/me', { method: 'PATCH', body: { name } }),
  changePassword: (input: ChangePasswordInput) =>
    request<Session>('/users/me/password', { method: 'POST', body: input }),
  deleteAccount: (password: string) =>
    request<void>('/users/me', { method: 'DELETE', body: { password } }),
}

export const symbolsApi = {
  list: () => request<MarketSymbol[]>('/symbols'),
}

export const alertsApi = {
  list: (status?: AlertStatus) =>
    request<Paginated<Alert>>(`/alerts?limit=100${status ? `&status=${status}` : ''}`),
  create: (input: CreateAlertInput) => request<Alert>('/alerts', { method: 'POST', body: input }),
  remove: (id: string) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),
}
