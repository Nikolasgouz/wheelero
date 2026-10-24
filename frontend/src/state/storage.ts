import { openDB } from 'idb'
import type { SavedState } from '../types'
import { defaults } from '../customization'

const database = openDB('gyrna', 2, {
  async upgrade(db, oldVersion, _newVersion, transaction) {
    if (oldVersion === 0) db.createObjectStore('state')
    else {
      const store = transaction.objectStore('state')
      const state: SavedState | undefined = await store.get('current')
      if (state) {
        state.removals = []
        for (const wheel of state.wheels) {
          wheel.customization = structuredClone(defaults)
          wheel.options = wheel.options.map((option) => ({ ...option, image: null }))
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
