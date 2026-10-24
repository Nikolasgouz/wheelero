import { openDB } from 'idb'
import type { SavedState } from '../types'

const database = openDB('gyrna', 1, {
  upgrade(db) {
    db.createObjectStore('state')
  },
})
export async function readState(): Promise<SavedState | undefined> {
  return (await database).get('state', 'current')
}
export async function writeState(state: SavedState): Promise<void> {
  await (await database).put('state', state, 'current')
}
