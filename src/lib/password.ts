export const scorePassword = (password: string): number =>
  Math.min(
    4,
    Number(password.length >= 8) +
      Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) +
      Number(/\d/.test(password)) +
      Number(/[^A-Za-z0-9]/.test(password)),
  )

export const STRENGTH_LABELS = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'] as const
export const STRENGTH_COLORS = ['#1d2738', '#ff5d73', '#f5b73b', '#9be15d', '#19d98b'] as const
