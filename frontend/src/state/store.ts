import { useSyncExternalStore } from 'react'
import { t } from '../i18n'
import { translate } from '../locale'
import type { Customization } from '../customization'
import { randomIndex } from '../lib/random'
import type { DrawResult, LocalWheel, Option, SavedState, Wheel } from '../types'
import { readState, writeState, migrationNotice } from './storage'
import { templates } from './templates'
import { activeOptions, makeOptions, makeWheel, restartRound } from './wheel'
import { parseEntries } from '../lib/entries'

export function forkWheel(
  wheel: Pick<Wheel, 'title' | 'options' | 'no_repeat' | 'customization' | 'results' | 'classroom'>,
): LocalWheel {
  return {
    ...makeWheel(wheel.title, []),
    options: wheel.options,
    no_repeat: wheel.no_repeat,
    classroom: wheel.classroom,
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
    const first = makeWheel(translate(templates[0].title), templates[0].options)
    saved = (await readState()) ?? {
      version: 1,
      tool_wheels: {},
      removed: [],
      wheels: [first],
      active: first.id,
      removals: [],
    }
    if (['/random-name-picker', '/yes-no-wheel', '/random-number-wheel'].includes(path)) {
      const existing = saved.wheels.find((wheel) => wheel.id === saved.tool_wheels[path])
      if (existing) saved.active = existing.id
      else {
        const initial =
          path === '/yes-no-wheel'
            ? makeWheel(translate('Yes or no?'), ['Yes', 'No'].map(translate))
            : path === '/random-number-wheel'
              ? makeWheel(
                  translate('Numbers 1 to 10'),
                  Array.from({ length: 10 }, (_, i) => String(i + 1)),
                )
              : makeWheel(translate('Pick a name'), [])
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

export async function editWheel(
  id: string,
  patch: Partial<Pick<Wheel, 'title' | 'options' | 'no_repeat' | 'customization' | 'classroom'>>,
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
    throw new Error('This wheel exceeds 8 MB. Remove or resize some images.')
  const change = { ...pendingEdits.get(id), ...patch, updated_at: new Date().toISOString() }
  pendingEdits.set(id, change)
  publish()
  try {
    await transaction((state) => {
      const wheel = state.wheels.find((w) => w.id === id)
      if (!wheel) throw new Error('This wheel was deleted in another tab.')
      Object.assign(wheel, change)
      if (wheel.classroom) {
        const ids = new Set(wheel.options.map((o) => o.id))
        wheel.classroom.absent_ids = wheel.classroom.absent_ids.filter((id) => ids.has(id))
      }
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
    state.active = id
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
    if (state.active === id) state.active = state.wheels[0].id
  })
}
export async function clearWheel(id: string, section: 'entries' | 'results') {
  await transaction((state) => {
    const wheel = state.wheels.find((w) => w.id === id)!
    if (section === 'entries') {
      wheel.options = []
      if (wheel.classroom) wheel.classroom.absent_ids = []
      state.removed = state.removed.filter((item) => item.wheel_id !== id)
    } else wheel.results = []
    state.removals = state.removals.filter((item) => item.wheel_id !== id)
    wheel.updated_at = new Date().toISOString()
  })
}
export async function importEntries(id: string, text: string, mode: 'replace' | 'add') {
  const labels = parseEntries(text)
  await transaction((state) => {
    const wheel = state.wheels.find((w) => w.id === id)!
    if (
      !labels.length ||
      labels.some((label) => label.length > 160) ||
      labels.length + (mode === 'add' ? wheel.options.length : 0) > 10000
    )
      throw new Error('Up to 10,000 entries, with up to 160 characters each.')
    const options = makeOptions(labels)
    wheel.options = mode === 'add' ? [...wheel.options, ...options] : options
    if (mode === 'replace') {
      if (wheel.classroom) wheel.classroom.absent_ids = []
      state.removed = state.removed.filter((item) => item.wheel_id !== id)
      state.removals = state.removals.filter((item) => item.wheel_id !== id)
    }
    wheel.updated_at = new Date().toISOString()
    if (new TextEncoder().encode(JSON.stringify(wheel)).length > 8_000_000)
      throw new Error('This wheel exceeds 8 MB. Remove or resize some images.')
  })
}
export async function startNewRound(id: string) {
  await transaction((state) => {
    const wheel = state.wheels.find((w) => w.id === id)!
    restartRound(wheel)
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
    if (!options.length) throw new Error('Every entry has had a turn. Start a new round!')
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
  if (wheel.classroom)
    wheel.classroom.absent_ids = wheel.classroom.absent_ids.filter((id) => id !== optionId)
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
    if (wheel.options.length + removed.length > 10000)
      throw new Error('Up to 10,000 entries, with up to 160 characters each.')
    for (const item of [...removed].reverse())
      if (!wheel.options.some((option) => option.id === item.option.id))
        wheel.options.splice(item.position, 0, item.option)
    wheel.options = wheel.options.map((option) => ({ ...option, active: true }))
    state.removed = state.removed.filter((item) => item.wheel_id !== id)
    state.removals = state.removals.filter((item) => item.wheel_id !== id)
  })
}
