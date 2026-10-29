import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateNumbers } from './numbers'

afterEach(() => vi.restoreAllMocks())

describe('random integer generator', () => {
  it.each([
    [NaN, 10, 1],
    [0, Infinity, 1],
    [1.1, 10, 1],
    [1, 2.5, 1],
    [10, 1, 1],
    [-1000000001, 0, 1],
    [0, 1000000001, 1],
    [0, 10, 0],
    [0, 10, 1001],
    [0, 10, 1.5],
    [0, 10, NaN],
  ])('rejects invalid bounds or quantity %s %s %s', (min, max, count) => {
    expect(() => generateNumbers(min, max, count, true)).toThrow(RangeError)
  })
  it('includes both limits, negative numbers, zero and singleton ranges', () => {
    const values = [0, 10]
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = values.shift() ?? 0
      return array
    })
    expect(generateNumbers(-5, 5, 2, true)).toEqual([-5, 5])
    expect(generateNumbers(0, 0, 3, true)).toEqual([0, 0, 0])
    expect(generateNumbers(-7, -7, 1, false)).toEqual([-7])
    expect(() => generateNumbers(7, 7, 2, false)).toThrow('not enough')
  })
  it('rejects the biased tail instead of reducing it modulo the range', () => {
    const values = [0xffffffff, 2]
    const random = vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = values.shift()!
      return array
    })
    expect(generateNumbers(10, 12, 1, true)).toEqual([12])
    expect(random).toHaveBeenCalledTimes(2)
  })
  it('maps the six equally likely shuffle paths to all six permutations', () => {
    const permutations = new Set<string>()
    for (let first = 0; first < 3; first++) {
      for (let second = 0; second < 2; second++) {
        const values = [first, second, 0]
        vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
          ;(array as Uint32Array)[0] = values.shift()!
          return array
        })
        const results = generateNumbers(-1, 1, 3, false)
        expect([...results].sort((a, b) => a - b)).toEqual([-1, 0, 1])
        permutations.add(results.join(','))
        vi.restoreAllMocks()
      }
    }
    expect(permutations.size).toBe(6)
  })
  it('supports the full range and maximum batch without allocating the range', () => {
    const values = generateNumbers(-1e9, 1e9, 1000, false)
    expect(new Set(values).size).toBe(1000)
    expect(values.every((value) => Number.isInteger(value) && value >= -1e9 && value <= 1e9)).toBe(
      true,
    )
    expect(new Set(generateNumbers(1, 1000, 1000, false)).size).toBe(1000)
    expect(() => generateNumbers(1, 999, 1000, false)).toThrow(RangeError)
  })
})
