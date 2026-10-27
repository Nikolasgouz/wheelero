import { defaults } from '../customization'
import type { LocalWheel, Wheel } from '../types'

export function makeWheel(title: string, labels: string[]): LocalWheel {
  return {
    id: crypto.randomUUID(),
    title,
    no_repeat: false,
    classroom: null,
    customization: structuredClone(defaults),
    updated_at: new Date().toISOString(),
    options: makeOptions(labels),
    results: [],
  }
}

export function makeOptions(labels: string[]) {
  return labels.map((label) => ({ id: crypto.randomUUID(), label, active: true, image: null }))
}

export function activeOptions(wheel: Wheel) {
  const absent = new Set(wheel.classroom?.absent_ids)
  return wheel.options.filter(
    (option) => !absent.has(option.id) && (!wheel.no_repeat || option.active),
  )
}

export function restartRound(wheel: Wheel) {
  wheel.options = wheel.options.map((option) => ({ ...option, active: true }))
}
