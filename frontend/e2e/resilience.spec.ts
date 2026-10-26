import { showScreen, readSavedState } from './navigation'
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
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
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
  const copies = (await readSavedState(page)).wheels
  expect(copies.map((wheel: { title: string }) => wheel.title)).toContain(`${title} · Copy`)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('clearing cookies leaves local wheels and IDs unchanged', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  const original = (await readSavedState(page)).wheels[0]
  await context.clearCookies()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  expect((await readSavedState(page)).wheels[0]).toEqual(original)
})

test('browser draw completes once even when the server is unreachable', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
  await expect(page.getByRole('dialog').locator('.winner')).not.toBeEmpty()
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.locator('.history li')).toHaveCount(1)
  await context.setOffline(false)
  await page.reload()
  await expect(page.locator('.history li')).toHaveCount(1)
})

test('export and import preserves a wheel and marks imported history as local', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
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
  await expect(page.locator('.history li').getByLabel('Device draw / import')).toHaveCount(1)
})

test('real service-worker update preserves saved and unsubmitted editor work', { tag: '@exclusive' }, async ({ page }) => {
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
    await showScreen(page, 'wheel')
    await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
    await expect(update).toBeDisabled()
    const otherTab = await page.context().newPage()
    await otherTab.goto('/privacy')
    await otherTab.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      if (!registration.waiting) throw new Error('Expected a waiting worker')
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    })
    await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeDisabled()
    await expect(page.getByRole('dialog').locator('.winner')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
    await showScreen(page, 'options')
    await expect(update).toBeEnabled()
    await update.click()
    await expect(update).toHaveCount(0)
    await expect(page.getByLabel('Wheel title', { exact: true })).toHaveValue('Πριν την ενημέρωση')
    await expect(page.getByLabel('One entry per line')).toHaveValue(
      'Πρόχειρη ιδέα που δεν προστέθηκε',
    )
    await otherTab.close()
  } finally {
    await writeFile(workerPath, original)
  }
})
