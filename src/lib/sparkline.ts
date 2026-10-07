const WIDTH = 96
const TOP = 3
const BOTTOM = 25

export const sparklinePath = (values: number[]): string => {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * WIDTH
      const y = BOTTOM - ((value - min) / range) * (BOTTOM - TOP)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}
