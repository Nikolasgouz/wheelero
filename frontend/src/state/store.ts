import { useSyncExternalStore } from 'react'
import { api, ApiError, NetworkError, setCsrf } from '../api/client'
import { t } from '../i18n'
import { ct } from '../customization.i18n'
import { defaults, type Customization } from '../customization'
import { randomIndex } from '../lib/random'
import type { DrawResult, LocalWheel, Option, SavedState, Wheel } from '../types'
import { readState, writeState } from './storage'
import { templates } from './templates'

export function makeWheel(title: string, labels: string[]): LocalWheel {
  return {
    id: crypto.randomUUID(),
    title,
    revision: 0,
    no_repeat: false,
    customization: structuredClone(defaults),
    deleted: false,
    updated_at: new Date().toISOString(),
    options: labels.map((label) => ({ id: crypto.randomUUID(), label, active: true, image: null })),
    results: [],
    dirty: true,
    mutation_id: crypto.randomUUID(),
    pending_results: [],
  }
}

function localWheel(wheel: Wheel): LocalWheel {
  return { ...wheel, dirty: false, mutation_id: crypto.randomUUID(), pending_results: [] }
}

export function forkWheel(
  wheel: Pick<
    Wheel,
    'title' | 'options' | 'no_repeat' | 'customization' | 'results' | 'customization'
  >,
): LocalWheel {
  const results = wheel.results.map((r) => ({
    ...r,
    id: crypto.randomUUID(),
    source: 'offline' as const,
  }))
  return {
    ...makeWheel(wheel.title, []),
    options: wheel.options,
    no_repeat: wheel.no_repeat,
    customization: wheel.customization,
    results,
    pending_results: results.map((r) => r.id),
  }
}

let saved: SavedState
const pendingEdits = new Map<string, Partial<LocalWheel>>()
let view = { data: null as SavedState | null, online: navigator.onLine, notice: '' }
const listeners = new Set<() => void>()
const channel = new BroadcastChannel('gyrna-state')
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

async function transaction<T>(work: (state: SavedState) => Promise<T> | T): Promise<T> {
  return navigator.locks.request('gyrna-state', async () => {
    saved = (await readState())!
    try {
      return await work(saved)
    } finally {
      await writeState(saved)
      publish()
      channel.postMessage('changed')
    }
  })
}

channel.onmessage = async () => {
  await navigator.locks.request('gyrna-state', async () => {
    saved = (await readState())!
    publish()
  })
}

export async function initialize() {
  await navigator.locks.request('gyrna-state', async () => {
    const existing = await readState()
    if (existing) saved = existing
    else {
      const first = makeWheel(templates[0].title, templates[0].options)
      saved = {
        wheels: [first],
        active: first.id,
        pending_draw: null,
        workspace_id: '',
        removals: [],
      }
      await writeState(saved)
    }
    publish()
  })
  await synchronize()
}

export function activeOptions(wheel: Wheel): Option[] {
  return wheel.options.filter((o) => !wheel.no_repeat || o.active)
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
  // Controlled inputs need synchronous values to preserve their caret. Keep newer
  // edits visible while older IndexedDB writes complete in the serialized queue.
  const change = {
    ...pendingEdits.get(id),
    ...patch,
    dirty: true,
    mutation_id: crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  }
  pendingEdits.set(id, change)
  publish()
  try {
    await transaction((state) => {
      if (state.pending_draw?.wheel_id === id) throw new Error(t.uncertain)
      Object.assign(
        state.wheels.find((w) => w.id === id)!,
        change,
      )
    })
  } finally {
    if (pendingEdits.get(id)?.mutation_id === change.mutation_id) {
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
    if (state.pending_draw?.wheel_id === id) throw new Error(t.uncertain)
    const wheel = state.wheels.find((w) => w.id === id)!
    wheel.deleted = true
    wheel.dirty = true
    let next = state.wheels.find((w) => !w.deleted)
    if (!next) {
      next = makeWheel(t.newTitle, [])
      state.wheels.push(next)
    }
    state.active = next.id
  })
}

async function recoverDraw(state: SavedState) {
  const pending = state.pending_draw
  if (!pending) return
  try {
    const response = await api<{ wheel: Wheel; result: DrawResult }>(
      `/wheels/${pending.wheel_id}/draws`,
      'POST',
      {
        id: pending.id,
        revision: pending.revision,
      },
    )
    state.wheels = state.wheels.map((w) =>
      w.id === response.wheel.id ? localWheel(response.wheel) : w,
    )
    state.pending_draw = null
  } catch (error) {
    if (!(error instanceof ApiError) || ![404, 409].includes(error.status)) throw error
    state.pending_draw = null
    view.notice = t.conflict
  }
}

async function syncState(state: SavedState) {
  const session = await api<{ csrf: string; workspace_id: string }>('/session')
  setCsrf(session.csrf)
  if (state.workspace_id && state.workspace_id !== session.workspace_id) {
    const activeIndex = state.wheels
      .filter((w) => !w.deleted)
      .findIndex((w) => w.id === state.active)
    state.wheels = state.wheels
      .filter((w) => !w.deleted)
      .map((wheel) => {
        const copy = forkWheel(wheel)
        for (const removal of state.removals)
          if (removal.wheel_id === wheel.id) removal.wheel_id = copy.id
        return copy
      })
    state.active = state.wheels[Math.max(activeIndex, 0)].id
    state.pending_draw = null
    view.notice = t.sessionChanged
  }
  state.workspace_id = session.workspace_id
  await recoverDraw(state)
  const remote = await api<Wheel[]>('/wheels')
  for (let i = 0; i < state.wheels.length; i++) {
    let wheel = state.wheels[i]
    if (!wheel.dirty) continue
    if (!wheel.deleted && (!wheel.title.trim() || wheel.options.some((o) => !o.label.trim())))
      continue
    try {
      if (wheel.deleted) {
        if (wheel.revision > 0 || remote.some((r) => r.id === wheel.id)) {
          await api(`/wheels/${wheel.id}`, 'DELETE', { revision: Math.max(wheel.revision, 1) })
        }
        wheel.dirty = false
        continue
      }
      do {
        const batch = wheel.pending_results.slice(0, 1000)
        const response = await api<Wheel>(`/wheels/${wheel.id}`, 'PUT', {
          mutation_id: wheel.mutation_id,
          revision: wheel.revision,
          title: wheel.title,
          no_repeat: wheel.no_repeat,
          customization: wheel.customization,
          options: wheel.options,
          results: wheel.results.filter((r) => batch.includes(r.id)),
        })
        const remaining = wheel.pending_results.filter((id) => !batch.includes(id))
        wheel = {
          ...localWheel(response),
          results: [...wheel.results.filter((r) => remaining.includes(r.id)), ...response.results],
          pending_results: remaining,
          dirty: remaining.length > 0,
        }
        state.wheels[i] = wheel
        await writeState(state)
      } while (wheel.dirty)
    } catch (error) {
      if (!(error instanceof ApiError) || ![404, 409].includes(error.status)) throw error
      if (!wheel.deleted) {
        const copy = forkWheel({
          ...wheel,
          title: `${Array.from(wheel.title).slice(0, 100).join('')} · ${t.copy}`,
        })
        state.wheels.push(copy)
        for (const removal of state.removals)
          if (removal.wheel_id === wheel.id) removal.wheel_id = copy.id
        if (state.active === wheel.id) state.active = copy.id
      }
      state.wheels[i] = localWheel(
        remote.find((r) => r.id === wheel.id) ?? { ...wheel, deleted: true },
      )
      view.notice = t.conflict
    }
  }
  // Refresh after writes so our own successful revisions cannot be replaced by stale reads.
  const latest = await api<Wheel[]>('/wheels')
  const localIds = new Set(state.wheels.map((w) => w.id))
  state.wheels = state.wheels.map((w) => {
    const server = latest.find((r) => r.id === w.id)
    return server && !w.dirty ? localWheel(server) : w
  })
  state.wheels.push(...latest.filter((w) => !localIds.has(w.id)).map(localWheel))
  if (!state.wheels.some((w) => w.id === state.active && !w.deleted)) {
    let next = state.wheels.find((w) => !w.deleted)
    if (!next) {
      next = makeWheel(t.newTitle, [])
      state.wheels.push(next)
    }
    state.active = next.id
  }
  view.online = true
}

export async function synchronize() {
  return transaction(async (state) => {
    try {
      await syncState(state)
    } catch (error) {
      if (!(error instanceof NetworkError)) throw error
      view.online = false
    }
    return state.active
  })
}

export async function spinWheel(
  id: string,
): Promise<{ result: DrawResult; options: Option[]; customization: Customization }> {
  return transaction(async (state) => {
    if (state.pending_draw) throw new Error(t.uncertain)
    try {
      await syncState(state)
    } catch (error) {
      if (!(error instanceof NetworkError)) throw error
      view.online = false
    }
    if (state.active !== id) throw new Error(t.conflict)
    const wheel = state.wheels.find((w) => w.id === id)!
    if (wheel.deleted) throw new Error(t.conflict)
    const options = activeOptions(wheel)
    if (wheel.options.length < 2 && !(wheel.no_repeat && wheel.results.length > 0))
      throw new Error(t.insufficient)
    if (!options.length) throw new Error(t.exhausted)
    const drawId = crypto.randomUUID()
    if (view.online) {
      state.pending_draw = { wheel_id: id, id: drawId, revision: wheel.revision }
      await writeState(state)
      try {
        const response = await api<{ wheel: Wheel; result: DrawResult }>(
          `/wheels/${id}/draws`,
          'POST',
          {
            id: drawId,
            revision: wheel.revision,
          },
        )
        state.wheels = state.wheels.map((w) => (w.id === id ? localWheel(response.wheel) : w))
        state.pending_draw = null
        return { result: response.result, options, customization: wheel.customization }
      } catch (error) {
        if (error instanceof ApiError) state.pending_draw = null
        if (error instanceof NetworkError) {
          view.online = false
          throw new Error(t.uncertain)
        }
        throw error
      }
    }
    const index = randomIndex(options.length)
    const result: DrawResult = {
      id: drawId,
      option_id: options[index].id,
      label: options[index].label,
      choice_index: index,
      choice_count: options.length,
      source: 'offline',
      created_at: new Date().toISOString(),
    }
    wheel.results.unshift(result)
    wheel.pending_results.push(result.id)
    if (wheel.no_repeat)
      wheel.options = wheel.options.map((o) =>
        o.id === result.option_id ? { ...o, active: false } : o,
      )
    wheel.dirty = true
    wheel.mutation_id = crypto.randomUUID()
    return { result, options, customization: wheel.customization }
  })
}

export async function flushStorage() {
  await navigator.locks.request('gyrna-state', () => Promise.resolve())
}

function removeOption(state: SavedState, wheelId: string, optionId: string): boolean {
  if (state.pending_draw?.wheel_id === wheelId) throw new Error(t.uncertain)
  const wheel = state.wheels.find((w) => w.id === wheelId && !w.deleted)
  state.removals = state.removals.filter((r) => r.wheel_id !== wheelId || r.option_id !== optionId)
  if (!wheel || !wheel.options.some((o) => o.id === optionId)) return false
  wheel.options = wheel.options.filter((o) => o.id !== optionId)
  wheel.dirty = true
  wheel.mutation_id = crypto.randomUUID()
  return true
}
export async function removeWinner(wheelId: string, optionId: string): Promise<boolean> {
  return transaction((state) => removeOption(state, wheelId, optionId))
}
export async function removeDueWinners() {
  return transaction((state) => {
    if (state.pending_draw) return []
    return state.removals
      .filter((removal) => removal.due <= Date.now())
      .filter((removal) => removeOption(state, removal.wheel_id, removal.option_id))
  })
}
export async function scheduleRemoval(wheelId: string, result: DrawResult, config: Customization) {
  await transaction((state) => {
    if (!state.removals.some((r) => r.result_id === result.id))
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
