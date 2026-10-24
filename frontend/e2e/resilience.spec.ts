import { test, expect } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

test('lost draw response recovers the same server result without a second draw', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Αποθηκεύτηκε', { exact: true })).toBeVisible()
  await page.route('**/api/wheels/*/draws', async route => {
    const response = await route.fetch()
    expect(response.ok()).toBe(true)
    await route.abort('failed')
  })
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Η απάντηση της κλήρωσης εκκρεμεί')
  await expect(page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true })).toBeDisabled()
  await page.unroute('**/api/wheels/*/draws')
  await page.getByRole('button', { name: 'Συγχρονισμός', exact: true }).click()
  await expect(page.locator('.history li')).toHaveCount(1)
  const wheels = await (await page.request.get('/api/wheels')).json()
  expect(wheels[0].results).toHaveLength(1)
  expect(wheels[0].results[0].source).toBe('server')
})

test('export and import preserves a wheel and marks imported history as local', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByText('Αποθηκεύτηκε', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Γύρνα τον τροχό', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Κλείσιμο' }).click()
  await page.getByRole('button', { name: 'Οι τροχοί μου', exact: true }).first().click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Εξαγωγή JSON' }).click()
  const file = await (await downloaded).path()
  await page.locator('input[type=file]').setInputFiles(file!)
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  await page.locator('.wheel-card-open').last().click()
  await expect(page.locator('.history li')).toHaveCount(1)
  await expect(page.locator('.history li').getByLabel('Τοπική κλήρωση / εισαγωγή')).toHaveCount(1)
})

test('real service-worker update preserves saved and unsubmitted editor work', async ({ page }) => {
  const workerPath = path.resolve('dist/sw.js')
  const original = await readFile(workerPath, 'utf8')
  await page.goto('/')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await page.getByLabel('Τίτλος τροχού', { exact: true }).fill('Πριν την ενημέρωση')
  await page.getByRole('button', { name: 'Μαζική προσθήκη' }).click()
  await page.getByLabel('Μία επιλογή σε κάθε γραμμή').fill('Πρόχειρη ιδέα που δεν προστέθηκε')
  try {
    await writeFile(workerPath, `${original}\n// update lifecycle test ${Date.now()}\n`)
    await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update() })
    const update = page.getByRole('button', { name: 'Αποθήκευση & ενημέρωση' })
    await expect(update).toBeVisible()
    await update.click()
    await expect(update).toHaveCount(0)
    await expect(page.getByLabel('Τίτλος τροχού', { exact: true })).toHaveValue('Πριν την ενημέρωση')
    await expect(page.getByLabel('Μία επιλογή σε κάθε γραμμή')).toHaveValue('Πρόχειρη ιδέα που δεν προστέθηκε')
  } finally {
    await writeFile(workerPath, original)
  }
})
