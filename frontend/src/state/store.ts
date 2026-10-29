import { useSyncExternalStore } from 'react'
import { t } from '../i18n'
import { ct } from '../customization.i18n'
import type { Customization } from '../customization'
import { randomIndex } from '../lib/random'
import type { DrawResult, LocalWheel, Option, SavedState, Wheel } from '../types'
import { readState, writeState, migrationNotice } from './storage'
import { templates } from './templates'
import { makeWheel } from './wheel'

export function forkWheel(
  wheel: Pick<Wheel, 'title' | 'options' | 'no_repeat' | 'customization' | 'results'>,
): LocalWheel {
  return {
    ...makeWheel(wheel.title, []),
    saved: true,
    options: wheel.options,
    no_repeat: wheel.no_repeat,
    customization: wheel.customization,
    results: wheel.results.map((result) => ({
      ...result,
      id: crypto.randomUUID(),
      source: 'offline',
    })),
  }
}

let saved: SavedState
const pendingEdits = new Map<string, Partial<LocalWheel>>()
let view = { data: null as SavedState | null, notice: '' }
const listeners = new Set<() => void>()
const channel = new BroadcastChannel('wheelero-local-state')
function publish() {
  view = {
    ...view,
    data: structuredClone({
      ...saved,
      wheels: saved.wheels.map((wheel) => ({ ...wheel, ...pendingEdits.get(wheel.id) })),
    }),
  }
  listeners.forEach((listener) => listener())
}
export function useStore() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => view,
  )
}

async function transaction<T>(work: (state: SavedState) => T): Promise<T> {
  return navigator.locks.request('wheelero-local-state', async () => {
    const state = (await readState())!
    const result = work(state)
    // Publish only after the IndexedDB transaction commits, including quota failures.
    await writeState(state)
    saved = state
    publish()
    channel.postMessage('changed')
    return result
  })
}

channel.onmessage = async () => {
  const state = await readState()
  if (!state) {
    view = { ...view, notice: 'Browser storage was cleared in another tab. Reload before editing.' }
    listeners.forEach((listener) => listener())
    return
  }
  saved = state
  publish()
}

export async function initialize(path: string) {
  await navigator.locks.request('wheelero-local-state', async () => {
    const first = makeWheel(templates[0].title, templates[0].options)
    saved = (await readState()) ?? {
      version: 1,
      tool_wheels: {},
      removed: [],
      wheels: [
        { ...first, saved: true },
        ...[2, 3].map((number) => ({
          ...makeWheel(`${t.wheel} ${number}`, []),
          saved: true,
        })),
      ],
      active: first.id,
      removals: [],
    }
    if (['/random-name-picker', '/yes-no-wheel', '/random-number-wheel'].includes(path)) {
      const existing = saved.wheels.find((wheel) => wheel.id === saved.tool_wheels[path])
      if (existing) saved.active = existing.id
      else {
        const initial =
          path === '/yes-no-wheel'
            ? makeWheel('Yes or no?', ['Yes', 'No'])
            : path === '/random-number-wheel'
              ? makeWheel(
                  'Numbers 1 to 10',
                  Array.from({ length: 10 }, (_, i) => String(i + 1)),
                )
              : makeWheel('Pick a name', [])
        saved.wheels.push(initial)
        saved.active = initial.id
        saved.tool_wheels[path] = initial.id
      }
    }
    await writeState(saved)
    view.notice = migrationNotice
    publish()
  })
}

export function activeOptions(wheel: Wheel): Option[] {
  return wheel.options.filter((option) => !wheel.no_repeat || option.active)
}

export async function editWheel(
  id: string,
  patch: Partial<Pick<Wheel, 'title' | 'options' | 'no_repeat' | 'customization'>>,
) {
  if (
    new TextEncoder().encode(
      JSON.stringify({
        ...saved.wheels.find((w) => w.id === id),
        ...pendingEdits.get(id),
        ...patch,
      }),
    ).length > 8_000_000
  )
    throw new Error(ct.bigWheel)
  const change = { ...pendingEdits.get(id), ...patch, updated_at: new Date().toISOString() }
  pendingEdits.set(id, change)
  publish()
  try {
    await transaction((state) => {
      const wheel = state.wheels.find((w) => w.id === id)
      if (!wheel) throw new Error('This wheel was deleted in another tab.')
      Object.assign(wheel, change)
    })
  } finally {
    if (pendingEdits.get(id) === change) {
      pendingEdits.delete(id)
      publish()
    }
  }
}

export async function addWheels(wheels: LocalWheel[]) {
  await transaction((state) => {
    state.wheels.push(...wheels)
    state.active = wheels[0].id
  })
}
export async function selectWheel(id: string) {
  await transaction((state) => {
    const wheel = state.wheels.find((wheel) => wheel.id === id)
    if (!wheel) throw new Error(t.wheelDeleted)
    activateWheel(state, wheel)
  })
}
function activateWheel(state: SavedState, wheel: LocalWheel) {
  if (!wheel.saved) {
    state.active = wheel.id
    return
  }
  const draft = { ...structuredClone(wheel), id: crypto.randomUUID(), saved: false }
  state.wheels.push(draft)
  state.active = draft.id
}
export async function saveWheel(id: string, title: string) {
  await transaction((state) => {
    const wheel = state.wheels.find((wheel) => wheel.id === id)
    if (!wheel) throw new Error(t.wheelDeleted)
    const existing =
      (wheel.saved && wheel.title === title ? wheel : undefined) ??
      [...state.wheels].reverse().find((candidate) => candidate.saved && candidate.title === title)
    const snapshot = {
      ...structuredClone(wheel),
      id: existing?.id ?? crypto.randomUUID(),
      title,
      updated_at: new Date().toISOString(),
      saved: true,
    }
    if (existing) Object.assign(existing, snapshot)
    else state.wheels.push(snapshot)
    if (wheel.saved) activateWheel(state, snapshot)
    else {
      wheel.title = title
      wheel.updated_at = snapshot.updated_at
    }
  })
}
export async function deleteWheel(id: string) {
  await transaction((state) => {
    state.wheels = state.wheels.filter((wheel) => wheel.id !== id)
    state.removals = state.removals.filter((item) => item.wheel_id !== id)
    state.removed = state.removed.filter((item) => item.wheel_id !== id)
    for (const path of Object.keys(state.tool_wheels))
      if (state.tool_wheels[path] === id) delete state.tool_wheels[path]
    if (!state.wheels.length) state.wheels.push(makeWheel(t.newTitle, []))
    if (state.active === id) activateWheel(state, state.wheels[0])
  })
}
export async function clearWheel(id: string, section: 'entries' | 'results') {
  await transaction((state) => {
    const wheel = state.wheels.find((w) => w.id === id)!
    if (section === 'entries') {
      wheel.options = []
      state.removed = state.removed.filter((item) => item.wheel_id !== id)
    } else wheel.results = []
    state.removals = state.removals.filter((item) => item.wheel_id !== id)
    wheel.updated_at = new Date().toISOString()
  })
}
export async function spinWheel(id: string): Promise<{
  result: DrawResult
  options: Option[]
  customization: Customization
}> {
  return transaction((state) => {
    if (state.active !== id) throw new Error('The active wheel changed in another tab.')
    const wheel = state.wheels.find((w) => w.id === id)!
    const options = activeOptions(wheel)
    if (!options.length) throw new Error(t.exhausted)
    const index = randomIndex(options.length)
    const result: DrawResult = {
      id: crypto.randomUUID(),
      option_id: options[index].id,
      label: options[index].label,
      choice_index: index,
      choice_count: options.length,
      source: 'offline',
      created_at: new Date().toISOString(),
    }
    wheel.results.unshift(result)
    if (wheel.no_repeat)
      wheel.options = wheel.options.map((option) =>
        option.id === result.option_id ? { ...option, active: false } : option,
      )
    return { result, options, customization: wheel.customization }
  })
}
export async function flushStorage() {
  await navigator.locks.request('wheelero-local-state', () => undefined)
}
function removeOption(state: SavedState, wheelId: string, optionId: string): boolean {
  const wheel = state.wheels.find((w) => w.id === wheelId)
  state.removals = state.removals.filter(
    (item) => item.wheel_id !== wheelId || item.option_id !== optionId,
  )
  if (!wheel) return false
  const position = wheel.options.findIndex((option) => option.id === optionId)
  if (position === -1) return false
  state.removed.push({ wheel_id: wheelId, option: wheel.options[position], position })
  wheel.options.splice(position, 1)
  return true
}
export async function removeWinner(wheelId: string, optionId: string) {
  return transaction((state) => removeOption(state, wheelId, optionId))
}
export async function removeDueWinners() {
  return transaction((state) =>
    state.removals
      .filter((item) => item.due <= Date.now())
      .filter((item) => removeOption(state, item.wheel_id, item.option_id)),
  )
}
export async function scheduleRemoval(wheelId: string, result: DrawResult, config: Customization) {
  await transaction((state) => {
    if (!state.removals.some((item) => item.result_id === result.id))
      state.removals.push({
        wheel_id: wheelId,
        option_id: result.option_id,
        result_id: result.id,
        due: Date.now() + 5000,
        sound: config.removal_sound,
        volume: config.result_volume,
      })
  })
}
export async function restoreEntries(id: string) {
  await transaction((state) => {
    const wheel = state.wheels.find((w) => w.id === id)!
    const removed = state.removed.filter((item) => item.wheel_id === id)
    if (wheel.options.length + removed.length > 10000) throw new Error(t.limit)
    for (const item of [...removed].reverse())
      if (!wheel.options.some((option) => option.id === item.option.id))
        wheel.options.splice(item.position, 0, item.option)
    wheel.options = wheel.options.map((option) => ({ ...option, active: true }))
    state.removed = state.removed.filter((item) => item.wheel_id !== id)
    state.removals = state.removals.filter((item) => item.wheel_id !== id)
  })
}
