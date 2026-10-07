export type Role = 'USER' | 'ADMIN'
export type AlertCondition = 'ABOVE' | 'BELOW'
export type AlertStatus = 'ACTIVE' | 'TRIGGERED'
export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting' | 'closed'
export type PriceDirection = 'up' | 'down' | 'flat'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  emailVerified: boolean
  createdAt: string
}

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
}

export interface MarketSymbol {
  id: string
  code: string
  name: string
  price: number
  volatility: number
  isActive: boolean
}

export interface AlertSymbol {
  id: string
  code: string
  name: string
}

export interface Alert {
  id: string
  symbolId: string
  symbol?: AlertSymbol
  condition: AlertCondition
  threshold: number
  status: AlertStatus
  triggeredAt: string | null
  triggeredPrice: number | null
  createdAt: string
}

export interface CreateAlertInput {
  symbolId: string
  condition: AlertCondition
  threshold: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface PriceTick {
  symbolId: string
  code: string
  price: number
  previousPrice: number
  changePercent: number
}

export interface PriceBatch {
  at: string
  ticks: PriceTick[]
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface RegistrationResult {
  email: string
  verificationRequired: boolean
}

export interface VerifyEmailInput {
  email: string
  otp: string
}

export interface ResetPasswordInput {
  email: string
  otp: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors: Record<string, string> }
