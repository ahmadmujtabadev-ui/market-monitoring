import { describe, expect, it } from 'vitest'
import { sparklinePath } from './sparkline'

describe('sparklinePath', () => {
  it('returns nothing until there are two points', () => {
    expect(sparklinePath([])).toBe('')
    expect(sparklinePath([5])).toBe('')
  })

  it('maps the lowest value to the bottom and the highest to the top', () => {
    expect(sparklinePath([1, 2, 3])).toBe('M0.0 25.0 L48.0 14.0 L96.0 3.0')
  })

  it('draws a flat line for constant prices', () => {
    expect(sparklinePath([7, 7, 7])).toBe('M0.0 25.0 L48.0 25.0 L96.0 25.0')
  })
})
