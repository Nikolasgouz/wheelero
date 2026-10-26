import { test, expect } from '@playwright/test'
import { showScreen, readSavedState } from './navigation'

test.use({ reducedMotion: 'reduce' })

test('IndexedDB persists more than 5 MiB of wheels without localStorage or API uploads', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/')) requests.push(request.url())
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  const original = (await readSavedState(page)).wheels[0]
  const wheels = Array.from({ length: 3 }, (_, i) => ({
    ...original,
    title: `Large wheel ${i}`,
    options: Array.from({ length: 10000 }, (_, index) => ({
      id: crypto.randomUUID(),
      label: `Entry ${index} ${'x'.repeat(140)}`,
      active: true,
      image: null,
    })),
  }))
  const buffer = Buffer.from(JSON.stringify({ format: 'gyrna', version: 1, wheels }))
  expect(buffer.length).toBeGreaterThan(5 * 1024 * 1024)
  await page.getByRole('button', { name: 'My wheels', exact: true }).first().click()
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'large.json', mimeType: 'application/json', buffer })
  await expect(page.locator('.wheel-card')).toHaveCount(4)
  await page.reload()
  await page.getByRole('button', { name: 'My wheels', exact: true }).first().click()
  await expect(page.locator('.wheel-card')).toHaveCount(4)
  expect((await readSavedState(page)).wheels.slice(1).map((wheel) => wheel.options.length)).toEqual(
    [10000, 10000, 10000],
  )
  expect(await page.evaluate(() => JSON.stringify(localStorage).length)).toBeLessThan(10000)
  expect(requests).toEqual([])
})

test('local by default: no list uploads, restore winners, backups and explicit snapshot', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/'))
      requests.push(request.method() + ' ' + new URL(request.url()).pathname)
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Unmute sound', exact: true })).toBeVisible()
  await page.getByLabel('Entry 1', { exact: true }).fill('<img src=x onerror=alert(1)>')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('.winner')).not.toBeEmpty()
  await expect(page.locator('.sr-only[role=status]')).toContainText(
    (await dialog.locator('.winner').textContent())!,
  )
  await dialog.getByRole('button', { name: 'Remove winner', exact: true }).click()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Restore entries', exact: true }).click()
  await expect(page.locator('.option-row')).toHaveCount(6)
  await page.reload()
  await showScreen(page, 'options')
  await expect(page.locator('.option-row')).toHaveCount(6)
  expect(requests).toEqual([])
  await expect(page.locator('img[onerror]')).toHaveCount(0)
  await page.getByRole('button', { name: 'My wheels', exact: true }).first().click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles((await (await download).path())!)
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  await page.locator('.wheel-card-open').last().click()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Share', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Results and other wheels are excluded')
  await page.getByRole('button', { name: 'Create link', exact: true }).click()
  await expect(page.getByRole('dialog').getByLabel('Share', { exact: true })).toBeVisible()
  const url = await page.getByRole('dialog').getByLabel('Share', { exact: true }).inputValue()
  expect(url).toContain('#wheel=')
  expect(requests).toEqual([])
  await expect(page.getByRole('button', { name: 'Revoke', exact: true })).toHaveCount(0)
})

test('distinct public tools work and remain available offline', async ({ page, context }) => {
  await page.goto('/random-number-wheel')
  await page.getByLabel('Minimum', { exact: true }).fill('8')
  await page.getByLabel('Maximum', { exact: true }).fill('12')
  await page.getByRole('button', { name: 'Generate number wheel', exact: true }).click()
  await expect(page.locator('.sidebar-entry input')).toHaveCount(5)
  await expect(page.getByLabel('Entry 1', { exact: true })).toHaveValue('8')
  await page.reload()
  await expect(page.locator('.sidebar-entry input')).toHaveCount(5)
  await page.goto('/yes-no-wheel')
  await expect(page.locator('.sidebar-entry input')).toHaveCount(2)
  await page.goto('/random-team-generator')
  await page
    .getByLabel('Names — one per line or spreadsheet cell')
    .fill('Alex\tEmma\r\nAlex\r\nNikos\r\nSofia')
  await page.getByRole('button', { name: 'Generate teams', exact: true }).click()
  await expect(page.locator('.team-results section')).toHaveCount(2)
  await expect(page.locator('.team-results li')).toHaveCount(5)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await context.setOffline(true)
  await page.goto('/random-name-picker')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Add multiple entries', exact: true }).click()
  await page.getByLabel('One entry per line').fill('A\tB\nC')
  await page.getByRole('button', { name: 'Add these entries', exact: true }).click()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
  await expect(page.getByRole('dialog').locator('.winner')).not.toBeEmpty()
})

test('failed IndexedDB write preserves the last saved wheel and reports the error', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  const original = (await readSavedState(page)).wheels[0]
  await showScreen(page, 'options')
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args) {
      if (this.name === 'state') throw new DOMException('Full', 'QuotaExceededError')
      return put.apply(this, args)
    }
  })
  await page.getByLabel('Wheel title', { exact: true }).fill('Cannot be saved')
  await expect(page.getByRole('alert')).toContainText('Browser storage is full')
  expect((await readSavedState(page)).wheels[0]).toEqual(original)
  await page.reload()
  await expect(page.getByLabel('Wheel title', { exact: true })).toHaveValue(original.title)
})

test('public HTML has real headings and metadata and unknown routes return 404', async ({
  request,
}) => {
  const titles = new Set<string>()
  for (const path of [
    '/',
    '/random-name-picker',
    '/yes-no-wheel',
    '/random-number-wheel',
    '/random-team-generator',
    '/about',
    '/privacy',
  ]) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html.match(/<h1[ >]/g)).toHaveLength(1)
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('application/ld+json')
    expect(html).not.toContain('__PUBLIC_ORIGIN__')
    expect(html).toContain('property="og:image"')
    titles.add(html.match(/<title>(.*?)<\/title>/)![1])
  }
  expect(titles.size).toBe(7)
  expect((await request.get('/not-a-wheelero-page')).status()).toBe(404)
  expect((await request.get('/robots.txt')).status()).toBe(200)
  expect((await request.get('/sitemap.xml')).status()).toBe(200)
})

test('version 9 storage migrates locally, preserving wheels and a recovery copy', async ({
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
      const request = indexedDB.open('gyrna', 9)
      request.onupgradeneeded = () => request.result.createObjectStore('state')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction('state', 'readwrite')
        transaction.objectStore('state').put(
          {
            ...state,
            sync_enabled: true,
            pending_draw: null,
            workspace_id: 'old-workspace',
            wheels: state.wheels.map((wheel) => ({
              ...wheel,
              deleted: false,
              revision: 12,
              dirty: true,
              mutation_id: crypto.randomUUID(),
              pending_results: [],
              clear_history: false,
            })),
          },
          'current',
        )
        transaction.oncomplete = () => {
          db.close()
          resolve()
        }
      }
    })
  }, original)
  const requests: string[] = []
  restored.on('request', (request) => {
    if (request.url().includes('/api/')) requests.push(request.url())
  })
  await restored.goto('/')
  await expect(restored.locator('.sidebar-entry input')).toHaveCount(6)
  const upgraded = await readSavedState(restored)
  expect(upgraded.wheels).toEqual(original.wheels)
  expect(upgraded.version).toBe(1)
  expect(upgraded).not.toHaveProperty('sync_enabled')
  expect(requests).toEqual([])
  const recovery = await restored.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('gyrna', 10)
      request.onsuccess = () => resolve(request.result)
    })
    const previous = await new Promise<{ workspace_id: string }>((resolve) => {
      const request = db.transaction('legacy-backup').objectStore('legacy-backup').get('previous')
      request.onsuccess = () => resolve(request.result)
    })
    db.close()
    return previous
  })
  expect(recovery.workspace_id).toBe('old-workspace')
})
