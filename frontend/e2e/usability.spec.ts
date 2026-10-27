import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readSavedState } from './navigation'

test.use({ reducedMotion: 'reduce' })

test('paste preview, cancel, replace and add preserve duplicates and persist', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Paste a list', exact: true }).click()
  await page.getByLabel('One entry per line').fill(' Alex \r\n\r\n Emma\r\nAlex ')
  await expect(page.getByRole('dialog')).toContainText('3 entries ready to import')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.locator('.sidebar-entry input')).toHaveCount(6)
  await page.getByRole('button', { name: 'Paste a list', exact: true }).click()
  await page.getByLabel('One entry per line').fill(' Alex \r\n\r\n Emma\r\nAlex ')
  await page.getByRole('button', { name: 'Replace current entries', exact: true }).click()
  await expect(page.locator('.sidebar-entry input')).toHaveCount(3)
  const ids = (await readSavedState(page)).wheels[0].options.map((o) => o.id)
  await page.getByRole('button', { name: 'Paste a list', exact: true }).click()
  await page.getByLabel('One entry per line').fill(' Sofia\tNikos ')
  await page.getByRole('button', { name: 'Add to current entries', exact: true }).click()
  await expect(page.locator('.sidebar-entry input')).toHaveCount(5)
  await page.reload()
  await expect(page.locator('.sidebar-entry input')).toHaveCount(5)
  const options = (await readSavedState(page)).wheels[0].options
  expect(options.map((o) => o.label)).toEqual(['Alex', 'Emma', 'Alex', 'Sofia', 'Nikos'])
  expect(options.slice(0, 3).map((o) => o.id)).toEqual(ids)
  expect(new Set(options.map((o) => o.id)).size).toBe(5)
})

test('classroom attendance and no-repeat rounds persist offline with duplicate student names', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Classroom', exact: true }).click()
  await page.getByLabel('Class name', { exact: true }).fill('Class 1')
  await page.getByRole('button', { name: 'Create class', exact: true }).click()
  await page.getByRole('button', { name: 'Paste a list', exact: true }).click()
  await page.getByLabel('One entry per line').fill('Alex\nAlex\nEmma')
  await page.getByRole('button', { name: 'Replace current entries', exact: true }).click()
  await page.getByRole('button', { name: 'Attendance', exact: true }).click()
  await page.getByLabel('Absent 1: Alex', { exact: true }).check()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.locator('.classroom-controls')).toContainText('3 students available')
  await page.getByRole('button', { name: 'Attendance', exact: true }).click()
  await page.getByLabel('Absent 1: Alex', { exact: true }).check()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.locator('.classroom-controls')).toContainText('2 students available')
  await page.screenshot({ path: '../artifacts/usability-classroom.png', fullPage: false })
  await expect(page.locator('.classroom-controls input')).toBeChecked()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await context.setOffline(true)
  for (let remaining = 1; remaining >= 0; remaining--) {
    await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
    await expect(page.getByRole('dialog').locator('.winner')).not.toBeEmpty()
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
    await expect(page.locator('.classroom-controls')).toContainText(
      `${remaining} students available`,
    )
  }
  await expect(page.locator('.classroom-controls')).toContainText('Round complete')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeDisabled()
  const state = await readSavedState(page)
  const wheel = state.wheels.find((w) => w.id === state.active)!
  expect(new Set(wheel.results.map((r) => r.option_id)).size).toBe(2)
  expect(wheel.results.map((r) => r.option_id)).not.toContain(wheel.options[0].id)
  await page.getByRole('button', { name: 'Start new round', exact: true }).click()
  await expect(page.locator('.classroom-controls')).toContainText('2 students available')
  await page.reload()
  await expect(page.locator('.classroom-controls')).toContainText('2 students available')
  await page.getByRole('button', { name: 'Attendance', exact: true }).click()
  await expect(page.getByLabel('Absent 1: Alex', { exact: true })).toBeChecked()
  await page.getByLabel('Absent 2: Alex', { exact: true }).check()
  await page.getByLabel('Absent 3: Emma', { exact: true }).check()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.locator('.classroom-controls')).toContainText('All students are absent')
  await expect(page.locator('.sidebar-entry input')).toHaveCount(3)
})

test('compact workspace fits desktop, mobile, dark mode and keyboard dialogs', async ({ page }) => {
  for (const [width, height] of [
    [1366, 768],
    [1440, 900],
    [1920, 1080],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Customize', exact: true })).toBeVisible()
    await expect(page.locator('.tool-navigation a[aria-current=page]')).toHaveCount(1)
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const wheel = await page.locator('.wheel-stage').boundingBox()
    if (width >= 1024) expect(wheel!.y + wheel!.height).toBeLessThanOrEqual(height)
    await page.screenshot({ path: `../artifacts/usability-${width}-light.png`, fullPage: false })
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.screenshot({ path: `../artifacts/usability-${width}-dark.png`, fullPage: false })
    const accessibility = await new AxeBuilder({ page }).analyze()
    expect(accessibility.violations).toEqual([])
    const customize = page.getByRole('button', { name: 'Customize', exact: true })
    await customize.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(customize).toBeFocused()
    await page.getByRole('button', { name: 'Light mode', exact: true }).click()
  }
  await page.setViewportSize({ width: 683, height: 384 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Customize', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Click to spin', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeInViewport()
})

test('version 10 wheels gain classroom defaults with original data recoverable', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  const original = await readSavedState(page)
  await page.close()
  const restored = await context.newPage()
  await restored.goto('/manifest.webmanifest')
  await restored.evaluate(async (state) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('gyrna')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('gyrna', 10)
      request.onupgradeneeded = () => {
        request.result.createObjectStore('state')
        request.result.createObjectStore('legacy-backup')
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['state', 'legacy-backup'], 'readwrite')
        transaction.objectStore('legacy-backup').put({ untouched: true }, 'previous')
        transaction.objectStore('state').put(
          {
            ...state,
            wheels: state.wheels.map((wheel) => {
              const legacy = { ...wheel, classroom: undefined }
              return legacy
            }),
          },
          'current',
        )
        transaction.oncomplete = () => {
          db.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
      }
    })
  }, original)
  await restored.goto('/')
  await expect(restored.locator('.sidebar-entry input')).toHaveCount(6)
  expect(await readSavedState(restored)).toEqual(original)
  const recovery = await restored.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('gyrna')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = db.transaction('legacy-backup')
    const records = await Promise.all(
      ['previous', 'before-classroom'].map(
        (key) =>
          new Promise<unknown>((resolve, reject) => {
            const request = transaction.objectStore('legacy-backup').get(key)
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
          }),
      ),
    )
    const version = db.version
    db.close()
    return { records, version }
  })
  expect(recovery.version).toBe(11)
  expect(recovery.records[0]).toEqual({ untouched: true })
  expect(recovery.records[1]).toEqual({
    ...original,
    wheels: original.wheels.map((wheel) => ({ ...wheel, classroom: undefined })),
  })
})
