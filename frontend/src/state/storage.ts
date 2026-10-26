import { openDB } from 'idb'
import type { SavedState } from '../types'
import { defaults } from '../customization'
import { makeWheel } from './wheel'
import { templates } from './templates'
import { t } from '../i18n'
import { translateEnglishDefaults } from './englishDefaults'
import { upgradeCustomization } from './customizationMigration'

const database = openDB('gyrna', 8, {
  blocked() {
    window.alert(t.closeOldTabs)
  },
  blocking() {
    void database.then((db) => db.close())
  },
  async upgrade(db, oldVersion, _newVersion, transaction) {
    if (oldVersion === 0) db.createObjectStore('state')
    else {
      const store = transaction.objectStore('state')
      const state: SavedState | undefined = await store.get('current')
      if (state) {
        if (oldVersion < 2) {
          state.removals = []
          for (const wheel of state.wheels) {
            wheel.customization = structuredClone(defaults)
            wheel.options = wheel.options.map((option) => ({ ...option, image: null }))
          }
        }
        if (oldVersion < 3) {
          const starter = makeWheel(templates[0].title, templates[0].options)
          state.wheels.push(starter)
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
        await store.put(state, 'current')
      }
    }
  },
})
export async function readState(): Promise<SavedState | undefined> {
  return (await database).get('state', 'current')
}
export async function writeState(state: SavedState): Promise<void> {
  await (await database).put('state', state, 'current')
}
