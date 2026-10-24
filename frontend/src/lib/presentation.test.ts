import { describe, expect, it } from 'vitest'
import { defaults, customizationSchema } from '../customization'
import { presentationOptions } from './presentation'
import { indexAtPointer, targetRotation } from './geometry'

describe('customized display preserves every winning ID', () => {
  const entries = Array.from({ length: 1100 }, (_, i) => ({
    id: String(i),
    label: `Name ${i % 37}`,
    active: true,
    image: i % 2 ? '/images/aurora.webp' : null,
  }))
  for (const duplicates of [true, false]) {
    for (const max of [4, 17, 1000]) {
      it(`maps every winner with duplicates=${duplicates}, maximum=${max}`, () => {
        const config = { ...defaults, show_duplicates: duplicates, max_names: max }
        for (const winner of entries) {
          const visible = presentationOptions(entries, config, winner.id)
          expect(visible.length).toBeLessThanOrEqual(max)
          const index = visible.findIndex((o) => o.id === winner.id)
          expect(index).toBeGreaterThanOrEqual(0)
          const rotation = targetRotation(1173, index, visible.length)
          expect(visible[indexAtPointer(rotation, visible.length)].id).toBe(winner.id)
        }
        expect(entries).toHaveLength(1100)
      }, 30000)
    }
  }
  it('requires a nonempty enabled palette and bounded versioned settings', () => {
    expect(customizationSchema.safeParse(defaults).success).toBe(true)
    for (const patch of [
      { version: 2 },
      { duration: 61 },
      { max_names: 3 },
      { spin_volume: 101 },
      { palette: defaults.palette.map((c) => ({ ...c, enabled: false })) },
    ])
      expect(customizationSchema.safeParse({ ...defaults, ...patch }).success).toBe(false)
  })
})
