import * as yup from 'yup'

const email = yup.string().trim().email('Enter a valid email address').required('Email is required')

const otp = yup
  .string()
  .trim()
  .matches(/^\d{6}$/, 'Enter the 6-digit code')
  .required('Code is required')

const strongPassword = (label: string) =>
  yup
    .string()
    .required(`${label} is required`)
    .min(8, 'Use at least 8 characters')
    .max(72, 'Use at most 72 characters')
    .matches(/[a-z]/, 'Include a lowercase letter')
    .matches(/[A-Z]/, 'Include an uppercase letter')
    .matches(/\d/, 'Include a number')

const confirmation = (field: string) =>
  yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref(field)], 'Passwords do not match')

export const loginSchema = yup.object({
  email,
  password: yup.string().required('Password is required'),
})

export const registerSchema = yup.object({
  name: yup.string().trim().required('Name is required').max(100, 'Use at most 100 characters'),
  email,
  password: strongPassword('Password'),
  confirmPassword: confirmation('password'),
})

export const verifyEmailSchema = yup.object({ email, otp })

export const forgotPasswordSchema = yup.object({ email })

export const resetPasswordSchema = yup.object({
  email,
  otp,
  password: strongPassword('New password'),
  confirmPassword: confirmation('password'),
})

export const profileSchema = yup.object({
  name: yup.string().trim().required('Name is required').max(100, 'Use at most 100 characters'),
})

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: strongPassword('New password').notOneOf(
    [yup.ref('currentPassword')],
    'Must be different from the current password',
  ),
  confirmPassword: confirmation('newPassword'),
})

export const deleteAccountSchema = yup.object({
  password: yup.string().required('Enter your password to confirm'),
})
