import { openDB } from 'idb'
import type { SavedState, Wheel } from '../types'

export type LegacyWheel = Wheel & {
  deleted: boolean
  dirty: boolean
  mutation_id: string
  clear_history: boolean
}
export type LegacyState = Omit<SavedState, 'version' | 'wheels'> & {
  wheels: LegacyWheel[]
  sync_enabled: boolean
  pending_draw: { id: string } | null
}
import { defaults } from '../customization'
import { makeWheel } from './wheel'
import { templates } from './templates'
import { t } from '../i18n'
import { translateEnglishDefaults } from './englishDefaults'
import { upgradeCustomization } from './customizationMigration'

export let migrationNotice = ''
const database = openDB('gyrna', 12, {
  blocked() {
    window.alert(t.closeOldTabs)
  },
  blocking() {
    void database.then((db) => db.close())
  },
  async upgrade(db, oldVersion, _newVersion, transaction) {
    if (oldVersion < 10) db.createObjectStore('legacy-backup')
    if (oldVersion === 0) db.createObjectStore('state')
    else if (oldVersion < 10) {
      const store = transaction.objectStore('state')
      const state: LegacyState | undefined = await store.get('current')
      if (state) {
        await transaction.objectStore('legacy-backup').put(structuredClone(state), 'previous')
        if (oldVersion < 2) {
          state.removals = []
          for (const wheel of state.wheels) {
            wheel.customization = structuredClone(defaults)
            wheel.options = wheel.options.map((option) => ({ ...option, image: null }))
          }
        }
        if (oldVersion < 3) {
          const starter = makeWheel(templates[0].title, templates[0].options)
          state.wheels.push({
            ...starter,
            deleted: false,
            dirty: false,
            mutation_id: crypto.randomUUID(),
            clear_history: false,
          })
          if (!state.pending_draw) state.active = starter.id
        }
        if (oldVersion < 4) {
          for (const wheel of state.wheels) wheel.clear_history = false
        }
        if (oldVersion < 5) {
          for (const wheel of state.wheels) {
            if (
              ['WE HAVE A WINNER', 'Η ΤΥΧΗ ΔΙΑΛΕΞΕ'].includes(wheel.customization.popup_message)
            ) {
              wheel.customization.popup_message = defaults.popup_message
            }
          }
        }
        if (oldVersion < 6) {
          for (const wheel of state.wheels) translateEnglishDefaults(wheel)
        }
        if (oldVersion < 7) {
          for (const wheel of state.wheels) {
            wheel.customization = upgradeCustomization(wheel.customization)
            if (wheel.dirty) wheel.mutation_id = crypto.randomUUID()
          }
        }
        if (oldVersion < 8) {
          const pastel = ['#ded2f6', '#f6d5c4', '#cbe5dc', '#f4e6b7', '#cddff2', '#edcfe1']
          for (const wheel of state.wheels) {
            const palette = wheel.customization.palette
            if (
              palette.length === pastel.length &&
              palette.every((item, index) => item.enabled && item.color === pastel[index])
            ) {
              wheel.customization.palette = structuredClone(defaults.palette)
              if (wheel.dirty) wheel.mutation_id = crypto.randomUUID()
            }
          }
        }
        if (oldVersion < 9) {
          state.sync_enabled = false
          state.tool_wheels = {}
          state.removed = []
        }
        const current: SavedState = {
          version: 1,
          active: state.active,
          tool_wheels: state.tool_wheels,
          removed: state.removed,
          removals: state.removals,
          wheels: state.wheels
            .filter((wheel) => !wheel.deleted)
            .map((wheel) => ({
              id: wheel.id,
              title: wheel.title,
              options: wheel.options,
              results: wheel.results,
              no_repeat: wheel.no_repeat,
              customization: wheel.customization,
              updated_at: wheel.updated_at,
            })),
        }
        if (state.pending_draw)
          migrationNotice =
            'An unfinished draw from the old server version could not be recovered. Existing results were preserved; no replacement winner was generated.'
        await store.put(current, 'current')
      }
    } else {
      const store = transaction.objectStore('state')
      const state: SavedState | undefined = await store.get('current')
      if (state) {
        await transaction
          .objectStore('legacy-backup')
          .put(structuredClone(state), 'before-usability-rollback')
        state.wheels = state.wheels.map((wheel) => ({
          id: wheel.id,
          title: wheel.title,
          options: wheel.options,
          results: wheel.results,
          no_repeat: wheel.no_repeat,
          customization: wheel.customization,
          updated_at: wheel.updated_at,
        }))
        await store.put(state, 'current')
      }
    }
  },
})
export async function readState(): Promise<SavedState | undefined> {
  return (await database).get('state', 'current')
}
export async function writeState(state: SavedState): Promise<void> {
  try {
    await (await database).put('state', state, 'current')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError')
      throw new Error(
        'Browser storage is full. The change was not saved. Export a JSON backup, then free space or remove unused wheels and images.',
      )
    throw error
  }
}
export async function exportLegacyBackup() {
  const rollback: SavedState | undefined = await (
    await database
  ).get('legacy-backup', 'before-usability-rollback')
  const state: LegacyState | undefined = await (await database).get('legacy-backup', 'previous')
  const wheels = rollback ? rollback.wheels : state?.wheels.filter((wheel) => !wheel.deleted)
  if (!wheels) throw new Error('No previous browser database was found.')
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify({
          format: 'gyrna',
          version: 1,
          wheels,
        }),
      ],
      { type: 'application/json' },
    ),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'wheelero-recovery.json'
  link.click()
  URL.revokeObjectURL(url)
}
