import { defaults } from '../customization'
import type { LocalWheel } from '../types'

export function makeWheel(title: string, labels: string[]): LocalWheel {
  return {
    id: crypto.randomUUID(),
    title,
    no_repeat: false,
    customization: structuredClone(defaults),
    updated_at: new Date().toISOString(),
    options: labels.map((label) => ({ id: crypto.randomUUID(), label, active: true, image: null })),
    results: [],
  }
}
