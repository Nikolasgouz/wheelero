import { showScreen } from './navigation'
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function ready(page: Page) {
  await page.goto('/')
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeEnabled()
  await expect
    .poll(async () => {
      const response = await page.request.get('/api/wheels')
      return response.ok() && (await response.json()).length > 0
    })
    .toBe(true)
}

test('edit, spin, pointer agreement, refresh persistence, JSON backup and library', async ({
  page,
}) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByLabel('Τίτλος τροχού', { exact: true }).fill('Η παρέα μας 🎲')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Αποθήκευση', exact: true }).click()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.winner')).not.toBeEmpty()
  const agreement = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('gyrna')
      request.onsuccess = () => resolve(request.result)
    })
    const state = await new Promise<{
      active: string
      wheels: { id: string; results: { choice_index: number; choice_count: number }[] }[]
    }>((resolve) => {
      const request = db.transaction('state').objectStore('state').get('current')
      request.onsuccess = () => resolve(request.result)
    })
    db.close()
    const result = state.wheels.find((w) => w.id === state.active)!.results[0]
    const transform = (document.querySelector('.wheel-svg') as SVGElement).style.transform
    const rotation = Number(transform.slice(7, -4))
    return (
      Math.floor(((360 - (rotation % 360)) % 360) / (360 / result.choice_count)) ===
      result.choice_index
    )
  })
  expect(agreement).toBe(true)
  await dialog.getByRole('button', { name: 'Κλείσιμο' }).click()
  await page.reload()
  await expect(page.getByLabel('Τίτλος τροχού', { exact: true })).toHaveValue('Η παρέα μας 🎲')
  await expect(page.locator('.history li')).toHaveCount(1)
  await page.getByRole('button', { name: 'Οι τροχοί μου', exact: true }).first().click()
  await expect(page.locator('.wheel-card')).toHaveCount(1)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Εξαγωγή JSON' }).click()
  expect((await download).suggestedFilename()).toMatch(/gyrna.*\.json/)
  await page.getByRole('button', { name: 'Αντίγραφο: Η παρέα μας 🎲', exact: true }).click()
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  await page.locator('input[type=file]').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":9}'),
  })
  await expect(page.getByRole('alert')).toContainText('Μη έγκυρο αντίγραφο')
})

test('share snapshot, copy into isolated session and revoke', async ({ page, browser }) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Κοινοποίηση', exact: true }).click()
  await page.getByRole('button', { name: 'Δημιουργία συνδέσμου' }).click()
  const input = page.getByRole('dialog').getByLabel('Κοινοποίηση', { exact: true })
  await expect(input).toBeVisible()
  const url = await input.inputValue()
  const recipient = await browser.newContext()
  const other = await recipient.newPage()
  await other.goto(url)
  await expect(other.getByRole('dialog')).toContainText('Κάποιος μοιράστηκε')
  await other.getByRole('button', { name: 'Κράτησε δικό σου αντίγραφο' }).click()
  await expect(other.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Ανάκληση', exact: true }).click()
  await other.goto(url)
  await expect(other.getByRole('alert')).toContainText('ανακλήθηκε')
  await recipient.close()
})

test('production service worker: offline reload, edit, draw and idempotent resync', async ({
  page,
  context,
}) => {
  await ready(page)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeEnabled()
  await showScreen(page, 'options')
  await page.getByLabel('Τίτλος τροχού', { exact: true }).fill('Χωρίς σύνδεση 🏕️')
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Τοπική κλήρωση')
  await page.getByRole('dialog').getByRole('button', { name: 'Κλείσιμο' }).click()
  await page.reload()
  await expect(page.getByLabel('Τίτλος τροχού', { exact: true })).toHaveValue('Χωρίς σύνδεση 🏕️')
  await expect(page.locator('.history li')).toHaveCount(1)
  await context.setOffline(false)
  await showScreen(page, 'options')
  await expect(page.getByText('Αποθηκεύτηκε', { exact: true })).toBeVisible()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Αποθήκευση', exact: true }).click()
  const wheels = await page.request.get('/api/wheels')
  const stored = (await wheels.json()).find(
    (w: { title: string }) => w.title === 'Χωρίς σύνδεση 🏕️',
  )
  expect(stored.results).toHaveLength(1)
  expect(stored.results[0].source).toBe('offline')
})

test('revision conflict preserves local changes in a new wheel', async ({ page, context }) => {
  await ready(page)
  const wheels = await (await page.request.get('/api/wheels')).json()
  const wheel = wheels[0]
  const session = await (await page.request.get('/api/session')).json()
  await context.setOffline(true)
  await showScreen(page, 'options')
  await page.getByLabel('Τίτλος τροχού', { exact: true }).fill('Τοπική αλλαγή')
  // APIRequestContext is independent of browser offline emulation.
  const response = await page.request.put(`/api/wheels/${wheel.id}`, {
    headers: { 'X-CSRF-Token': session.csrf },
    data: {
      revision: wheel.revision,
      mutation_id: crypto.randomUUID(),
      title: 'Νεότερη αλλαγή server',
      no_repeat: wheel.no_repeat,
      options: wheel.options,
      results: [],
    },
  })
  expect(response.ok()).toBe(true)
  await context.setOffline(false)
  await expect(page.getByText('Βρέθηκε νεότερη έκδοση.', { exact: false })).toBeVisible()
  const synced = await (await page.request.get('/api/wheels')).json()
  expect(synced.map((w: { title: string }) => w.title)).toEqual(
    expect.arrayContaining(['Νεότερη αλλαγή server', 'Τοπική αλλαγή · Αντίγραφο']),
  )
})

test('bulk blanks, duplicate removal, 200 entries and no-repeat exhaustion', async ({ page }) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: '🤔 Ναι ή όχι;', exact: false }).click()
  await showScreen(page, 'options')
  await page.getByRole('switch', { name: 'Χωρίς επανάληψη' }).check()
  for (let i = 0; i < 2; i++) {
    await showScreen(page, 'wheel')
    await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Κλείσιμο' }).click()
  }
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Νέος γύρος', exact: true }).first().click()
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeEnabled()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Μαζική προσθήκη' }).click()
  await page.getByLabel('Μία επιλογή σε κάθε γραμμή').fill('\nΆννα\n\nΆννα\n')
  await page.getByRole('button', { name: 'Πρόσθεσε τις γραμμές' }).click()
  await page.getByRole('button', { name: 'Αφαίρεση διπλοτύπων' }).click()
  await expect(page.locator('.option-row')).toHaveCount(3)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Μαζική προσθήκη' }).click()
  await page
    .getByLabel('Μία επιλογή σε κάθε γραμμή')
    .fill(Array.from({ length: 197 }, (_, i) => `Όνομα ${i}`).join('\n'))
  await page.getByRole('button', { name: 'Πρόσθεσε τις γραμμές' }).click()
  await expect(page.locator('.option-row')).toHaveCount(200)
  await expect(page.locator('.wheel-svg text')).toHaveCount(200)
  await expect(page.locator('.wheel-legend li')).toHaveCount(200)
})

for (const width of [360, 390, 768, 1440]) {
  test(`responsive, keyboard and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await ready(page)
    await expect(page.locator('.editor-column')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Προσαρμογή', exact: true })).toHaveCount(0)
    await expect(page.locator('.templates-section')).toBeHidden()
    await expect(page.locator('.history')).not.toHaveAttribute('open')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `../artifacts/light-${width}.png`, fullPage: true })
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
      [],
    )
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true)
    {
      await page.getByRole('button', { name: 'Επιλογές', exact: true }).click()
      await expect(page.getByLabel('Τίτλος τροχού', { exact: true })).toBeVisible()
      await expect(page.locator('.spinner-panel')).toBeHidden()
      await page.getByRole('button', { name: 'Προσαρμογή', exact: true }).click()
      await expect(page.getByRole('dialog').getByRole('tab')).toHaveCount(3)
      await page.keyboard.press('Escape')
      await page.screenshot({ path: `../artifacts/editor-${width}.png`, fullPage: true })
    }
    await page.getByRole('button', { name: 'Σκοτεινό θέμα', exact: true }).click()
    await page.screenshot({ path: `../artifacts/dark-${width}.png`, fullPage: true })
    const darkScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      darkScan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, detail: n.failureSummary })),
      })),
    ).toEqual([])
  })
}

test('reduced motion and keyboard modal dismissal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await ready(page)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(
    await page.locator('.wheel-svg').evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('1e-05s')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
