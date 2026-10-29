import { describe, expect, it } from 'vitest'
import { indexAtPointer, targetRotation } from './geometry'
import { randomIndex, shuffled } from './random'
import { backupSchema } from '../types'

describe('pointer agreement', () => {
  it('lands inside each winning sector across positions and repeated rotations', () => {
    let current = 0
    const failures: string[] = []
    for (const count of [...Array.from({ length: 200 }, (_, i) => i + 1), 1000, 10000]) {
      for (let index = 0; index < count; index++) {
        for (const position of [0.05, 0.5, 0.94991]) {
          const next = targetRotation(current, index, count, position)
          const landed = (((360 - (next % 360)) % 360) * count) / 360 - index
          if (
            next - current < 1800 ||
            indexAtPointer(next, count) !== index ||
            Math.abs(landed - position) > 0.0001
          ) {
            failures.push(`${count}:${index}:${position}`)
          }
          current = next
        }
      }
    }
    expect(failures).toEqual([])
  })
})
it('selects valid cryptographic indices and preserves duplicate entries in shuffle', () => {
  for (const count of [1, 2, 3, 7, 200, 201, 10000]) {
    for (let i = 0; i < 100; i++) expect(randomIndex(count)).toBeLessThan(count)
  }
  expect(shuffled(['a', 'a', 'b']).sort()).toEqual(['a', 'a', 'b'])
  expect(() => randomIndex(0)).toThrow()
  expect(() => randomIndex(10001)).toThrow()
  const entries = Array.from({ length: 10000 }, (_, id) => ({ id, label: 'Duplicate' }))
  expect(shuffled(entries).sort((a, b) => a.id - b.id)).toEqual(entries)
})
it('rejects malformed imports and impossible result indices', () => {
  expect(backupSchema.safeParse({ version: 1, wheels: [] }).success).toBe(false)
  expect(backupSchema.safeParse({ format: 'gyrna', version: 2, wheels: [] }).success).toBe(false)
})
