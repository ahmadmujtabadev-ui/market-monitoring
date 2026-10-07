import type { FormikHelpers } from 'formik'
import type { ActionResult } from '../types'

export const applyFailure = <Values extends object>(
  helpers: FormikHelpers<Values>,
  result: Extract<ActionResult, { ok: false }>,
): void => {
  helpers.setStatus(result.message)
  for (const [field, message] of Object.entries(result.fieldErrors)) {
    helpers.setFieldError(field, message)
  }
}

export interface FlowState {
  email?: string
  notice?: string
}
