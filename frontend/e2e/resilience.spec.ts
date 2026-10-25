import { showScreen } from './navigation'
import { test, expect } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

test('typing in the middle of a title preserves text and caret position', async ({ page }) => {
  await page.goto('/')
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  const title = page.getByLabel('Wheel title', { exact: true })
  await title.fill('ΑΒΓΔ')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await title.focus()
  await title.press('End')
  await title.press('ArrowLeft')
  await title.press('ArrowLeft')
  await title.pressSequentially('ΧΨΩ', { delay: 50 })
  await expect(title).toHaveValue('ΑΒΧΨΩΓΔ')
  const option = page.getByLabel('Option 1', { exact: true })
  await option.fill('ΑΒΓΔ')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await option.focus()
  await option.press('End')
  await option.press('ArrowLeft')
  await option.press('ArrowLeft')
  await option.pressSequentially('ΧΨΩ', { delay: 50 })
  await expect(option).toHaveValue('ΑΒΧΨΩΓΔ')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await page.reload()
  await expect(title).toHaveValue('ΑΒΧΨΩΓΔ')
  await expect(option).toHaveValue('ΑΒΧΨΩΓΔ')
})

test('copying a long Greek title preserves an emoji at the truncation boundary', async ({
  page,
}) => {
  const title = `${'α'.repeat(99)}🎲`
  await page.goto('/')
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await showScreen(page, 'options')
  await page.getByLabel('Wheel title', { exact: true }).fill(title)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('button', { name: 'My wheels', exact: true }).first().click()
  await page.getByRole('button', { name: `Copy: ${title}`, exact: true }).click()
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  await page.locator('.wheel-card-open').last().click()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  const copies = await (await page.request.get('/api/wheels')).json()
  expect(copies.map((wheel: { title: string }) => wheel.title)).toContain(`${title} · Copy`)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('clearing the cookie preserves local work in a new isolated workspace', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  const original = (await (await page.request.get('/api/wheels')).json())[0]
  await context.clearCookies()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Spin the wheel', exact: true }).click()
  await expect(page.getByText('Your session changed.', { exact: false })).toBeVisible()
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Spin the wheel', exact: true })).toBeEnabled()
  const copies = await (await page.request.get('/api/wheels')).json()
  expect(copies).toHaveLength(1)
  expect(copies[0].id).not.toBe(original.id)
  expect(copies[0].options).toEqual(original.options)
  expect((await page.request.get(`/api/wheels/${original.id}`)).status()).toBe(404)
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Spin the wheel', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('lost draw response recovers the same server result without a second draw', async ({
  page,
}) => {
  await page.goto('/')
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await page.route('**/api/wheels/*/draws', async (route) => {
    const response = await route.fetch()
    expect(response.ok()).toBe(true)
    await route.abort('failed')
  })
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Spin the wheel', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('The draw response is pending')
  await expect(page.getByRole('button', { name: 'Spin the wheel', exact: true })).toBeDisabled()
  await page.unroute('**/api/wheels/*/draws')
  await page.getByRole('button', { name: 'Sync', exact: true }).click()
  await expect(page.locator('.history li')).toHaveCount(1)
  const wheels = await (await page.request.get('/api/wheels')).json()
  expect(wheels[0].results).toHaveLength(1)
  expect(wheels[0].results[0].source).toBe('server')
})

test('export and import preserves a wheel and marks imported history as local', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Spin the wheel', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
  await page.getByRole('button', { name: 'My wheels', exact: true }).first().click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  const file = await (await downloaded).path()
  await page.locator('input[type=file]').setInputFiles(file!)
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  await page.locator('.wheel-card-open').last().click()
  await expect(page.locator('.history li')).toHaveCount(1)
  await expect(page.locator('.history li').getByLabel('Offline draw / import')).toHaveCount(1)
})

test('real service-worker update preserves saved and unsubmitted editor work', async ({ page }) => {
  const workerPath = path.resolve('dist/sw.js')
  const original = await readFile(workerPath, 'utf8')
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await showScreen(page, 'options')
  await page.getByLabel('Wheel title', { exact: true }).fill('Πριν την ενημέρωση')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Add multiple entries' }).click()
  await page.getByLabel('One entry per line').fill('Πρόχειρη ιδέα που δεν προστέθηκε')
  try {
    await writeFile(workerPath, `${original}\n// update lifecycle test ${Date.now()}\n`)
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.ready).update()
    })
    const update = page.getByRole('button', { name: 'Save & update' })
    await expect(update).toBeVisible()
    await update.click()
    await expect(update).toHaveCount(0)
    await expect(page.getByLabel('Wheel title', { exact: true })).toHaveValue(
      'Πριν την ενημέρωση',
    )
    await expect(page.getByLabel('One entry per line')).toHaveValue(
      'Πρόχειρη ιδέα που δεν προστέθηκε',
    )
  } finally {
    await writeFile(workerPath, original)
  }
})
