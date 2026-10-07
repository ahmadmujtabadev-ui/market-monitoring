import { describe, expect, it } from 'vitest'
import { scorePassword } from './password'

describe('scorePassword', () => {
  it.each([
    ['', 0],
    ['abc', 0],
    ['abcdefgh', 1],
    ['Abcdefgh', 2],
    ['Abcdefg1', 3],
    ['Abcdef1!', 4],
  ])('scores %j as %d', (password, score) => {
    expect(scorePassword(password)).toBe(score)
  })
})
