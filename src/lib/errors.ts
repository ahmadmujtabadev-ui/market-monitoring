import { ApiError } from '../api/http'
import type { ActionResult } from '../types'

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const details = error.errors.map((item) => `${item.path}: ${item.message}`)
    return details.length > 0 ? details.join('; ') : error.message
  }
  if (error instanceof TypeError) return 'Unable to reach the server'
  return error instanceof Error ? error.message : 'Something went wrong'
}

export const toFailure = (error: unknown): Extract<ActionResult, { ok: false }> => {
  const fieldErrors: Record<string, string> = {}
  if (error instanceof ApiError) {
    for (const item of error.errors) fieldErrors[item.path] = item.message
  }
  const message =
    error instanceof ApiError && Object.keys(fieldErrors).length > 0
      ? 'Please correct the highlighted fields'
      : getErrorMessage(error)
  return { ok: false, message, fieldErrors }
}
