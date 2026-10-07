export const formatPrice = (value: number): string => {
  const digits = value >= 100 ? 2 : value >= 1 ? 3 : 4
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export const formatPercent = (value: number): string =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`

export const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
