import { expect, type Page } from '@playwright/test'

export async function showScreen(page: Page, screen: 'wheel' | 'options') {
  const panel = screen === 'wheel' ? '.spinner-panel' : '.editor-column'
  // Template selection navigates after its local write; wait for that operation first.
  await expect(page.getByRole('button', { name: 'New', exact: true })).toBeEnabled()
  if (!(await page.locator(panel).isVisible()))
    await page
      .getByRole('button', { name: screen === 'wheel' ? 'Wheel' : 'More options', exact: true })
      .click()
  await expect(page.locator(panel)).toBeVisible()
}

export async function readSavedState(page: Page): Promise<import('../src/types').SavedState> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('gyrna')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const state = await new Promise<import('../src/types').SavedState>((resolve, reject) => {
      const request = db.transaction('state').objectStore('state').get('current')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return state
  })
}
