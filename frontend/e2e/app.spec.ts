import { showScreen } from './navigation'
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function ready(page: Page) {
  await page.goto('/')
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
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
  await expect(page.locator('.wheel-tools button')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Pause idle rotation' })).toHaveCount(0)
  await expect
    .poll(() =>
      page
        .locator('.wheel-svg')
        .evaluate((svg) =>
          svg.getAnimations().some((animation) => animation.playState === 'running'),
        ),
    )
    .toBe(true)
  await page.locator('.sidebar-actions').getByRole('button', { name: 'Sort', exact: true }).click()
  expect(
    await page
      .locator('.sidebar-entry input')
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
  ).toEqual(['Alex', 'Emma', 'James', 'Noah', 'Olivia', 'Sofia'])
  await page
    .locator('.sidebar-actions')
    .getByRole('button', { name: 'Shuffle', exact: true })
    .click()
  expect(
    await page
      .locator('.sidebar-entry input')
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).sort()),
  ).toEqual(['Alex', 'Emma', 'James', 'Noah', 'Olivia', 'Sofia'])
  await page.locator('.sidebar-actions').getByRole('button', { name: 'Sort', exact: true }).click()
  await page.getByRole('button', { name: 'Edit name: Alex', exact: true }).click()
  const firstEntry = page.getByLabel('Entry 1', { exact: true })
  await expect(firstEntry).toBeFocused()
  expect(
    await firstEntry.evaluate((input: HTMLInputElement) =>
      input.value.slice(input.selectionStart!, input.selectionEnd!),
    ),
  ).toBe('Alex')
  await page.keyboard.insertText('Πίτσα παρέας 🍕')
  await firstEntry.press('Enter')
  await expect(firstEntry).not.toBeFocused()
  await page.getByLabel('New entry…', { exact: true }).fill('Παγωτό 🍦')
  await page.getByRole('button', { name: 'Add entry', exact: true }).click()
  await expect(page.locator('.sidebar-entry')).toHaveCount(7)
  await page.getByRole('button', { name: 'Delete entry: Παγωτό 🍦', exact: true }).click()
  await expect(page.locator('.sidebar-entry')).toHaveCount(6)
  await showScreen(page, 'options')
  await page.getByLabel('Wheel title', { exact: true }).fill('Η παρέα μας 🎲')
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Entry 1', { exact: true })).toBeDisabled()
  for (const name of ['Customize', 'Mute sound', 'Presentation mode']) {
    const button = page.locator('.wheel-tools').getByRole('button', { name, exact: true })
    await expect(button).toBeDisabled()
    await expect(button).toHaveCSS('cursor', 'not-allowed')
    await button.evaluate((node: HTMLButtonElement) => node.click())
  }
  await expect(page.getByRole('button', { name: 'Mute sound', exact: true })).toBeVisible()
  await expect(page.locator('.home')).not.toHaveClass(/presenting/)
  for (const name of ['Shuffle', 'Sort', 'Clear entries'])
    await expect(
      page.locator('.sidebar-actions').getByRole('button', { name, exact: true }),
    ).toBeDisabled()
  await expect
    .poll(async () => {
      const response = await page.request.get('/api/wheels')
      return (await response.json())[0].results.length
    })
    .toBe(1)
  await page.getByRole('tab', { name: 'Results', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeDisabled()
  await expect(page.locator('#sidebar-results .history li')).toHaveCount(0)
  await expect(page.locator('#sidebar-tab-results .count-badge')).toHaveText('0')
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
  await dialog.getByRole('button', { name: 'Close' }).click()
  for (const button of await page.locator('.wheel-tools button').all())
    await expect(button).toBeEnabled()
  await expect
    .poll(() =>
      page
        .locator('.wheel-svg')
        .evaluate((svg) =>
          svg.getAnimations().some((animation) => animation.playState === 'running'),
        ),
    )
    .toBe(true)
  await expect(page.getByRole('tab', { name: 'Results', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('#sidebar-results .history li')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Entry 1', { exact: true })).toHaveValue('Πίτσα παρέας 🍕')
  await expect(page.getByLabel('Wheel title', { exact: true })).toHaveValue('Η παρέα μας 🎲')
  await expect(page.locator('.history li')).toHaveCount(1)
  await page.getByRole('button', { name: 'My wheels', exact: true }).first().click()
  await expect(page.locator('.wheel-card')).toHaveCount(1)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  expect((await download).suggestedFilename()).toMatch(/gyrna.*\.json/)
  await page.getByRole('button', { name: 'Copy: Η παρέα μας 🎲', exact: true }).click()
  await expect(page.locator('.wheel-card')).toHaveCount(2)
  await page.locator('input[type=file]').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":9}'),
  })
  await expect(page.getByRole('alert')).toContainText('Invalid backup')
})

test('share snapshot, copy into isolated session and revoke', async ({ page, browser }) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Share', exact: true }).click()
  await page.getByRole('button', { name: 'Create link' }).click()
  const input = page.getByRole('dialog').getByLabel('Share', { exact: true })
  await expect(input).toBeVisible()
  const url = await input.inputValue()
  const recipient = await browser.newContext()
  const other = await recipient.newPage()
  await other.goto(url)
  await expect(other.getByRole('dialog')).toContainText('Someone shared')
  await other.getByRole('button', { name: 'Save your own copy' }).click()
  await expect(other.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Revoke', exact: true }).click()
  await other.goto(url)
  await expect(other.getByRole('alert')).toContainText('revoked')
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
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  await showScreen(page, 'options')
  await page.getByLabel('Wheel title', { exact: true }).fill('Χωρίς σύνδεση 🏕️')
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Offline draw')
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
  await page.reload()
  await expect(page.getByLabel('Wheel title', { exact: true })).toHaveValue('Χωρίς σύνδεση 🏕️')
  await expect(page.locator('.history li')).toHaveCount(1)
  await context.setOffline(false)
  await showScreen(page, 'options')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
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
  await page.getByLabel('Wheel title', { exact: true }).fill('Τοπική αλλαγή')
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
  await expect(page.getByText('A newer version was found.', { exact: false })).toBeVisible()
  const synced = await (await page.request.get('/api/wheels')).json()
  expect(synced.map((w: { title: string }) => w.title)).toEqual(
    expect.arrayContaining(['Νεότερη αλλαγή server', 'Τοπική αλλαγή · Copy']),
  )
})

test('bulk blanks, duplicate removal, 200 entries and no-repeat exhaustion', async ({ page }) => {
  await ready(page)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: '🤔 Yes or no?', exact: false }).click()
  await showScreen(page, 'options')
  await page.getByRole('switch', { name: 'No repeats' }).check()
  for (let i = 0; i < 2; i++) {
    await showScreen(page, 'wheel')
    await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
  }
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'New round', exact: true }).first().click()
  await showScreen(page, 'wheel')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Add multiple entries' }).click()
  await page.getByLabel('One entry per line').fill('\nAnna\n\nAnna\n')
  await page.getByRole('button', { name: 'Add these entries' }).click()
  await page.getByRole('button', { name: 'Remove duplicates' }).click()
  await expect(page.locator('.option-row')).toHaveCount(3)
  await showScreen(page, 'options')
  await page.getByRole('button', { name: 'Add multiple entries' }).click()
  await page
    .getByLabel('One entry per line')
    .fill(Array.from({ length: 197 }, (_, i) => `Όνομα ${i}`).join('\n'))
  await page.getByRole('button', { name: 'Add these entries' }).click()
  await expect(page.locator('.option-row')).toHaveCount(200)
  await expect(page.locator('.wheel-svg text')).toHaveCount(200)
  await expect(page.locator('.wheel-legend li')).toHaveCount(200)
})

for (const width of [360, 390, 768, 1440]) {
  test(`responsive, keyboard and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await ready(page)
    await expect(page.locator('.editor-column')).toBeHidden()
    await expect(
      page.locator('.desktop-nav').getByRole('button', { name: 'Entries', exact: true }),
    ).toHaveCount(0)
    await expect(page.locator('.sidebar-actions button')).toHaveText(['Shuffle', 'Sort', 'Clear'])
    await expect(page.locator('.wheel-tools button').first()).toHaveAttribute(
      'aria-label',
      'Customize',
    )
    await page.getByRole('button', { name: 'Customize', exact: true }).click()
    await expect(page.getByRole('dialog').getByRole('tab')).toHaveCount(3)
    await page.keyboard.press('Escape')
    await expect(page.locator('.templates-section')).toBeHidden()
    await expect(page.getByRole('tab', { name: 'Entries', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const wheelBounds = (await page.locator('.wheel-stage').boundingBox())!
    const wheelPanel = (await page.locator('.spinner-panel').boundingBox())!
    const sidebar = (await page.locator('.wheel-sidebar').boundingBox())!
    if (width >= 1024) {
      expect(sidebar.x).toBeGreaterThan(wheelBounds.x + wheelBounds.width)
      expect(width - sidebar.x - sidebar.width).toBeLessThanOrEqual(17)
      expect(Math.abs(wheelBounds.x + wheelBounds.width / 2 - width / 2)).toBeLessThan(100)
      expect(wheelBounds.width).toBeGreaterThan(800)
    } else {
      expect(
        Math.abs(wheelBounds.x + wheelBounds.width / 2 - wheelPanel.x - wheelPanel.width / 2),
      ).toBeLessThan(2)
      expect(sidebar.y).toBeGreaterThan(wheelBounds.y + wheelBounds.height)
    }
    await page.getByRole('tab', { name: 'Entries', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Results', exact: true })).toBeFocused()
    await expect(page.locator('#sidebar-results')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('#sidebar-entries')).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, 0))
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
      await showScreen(page, 'options')
      await expect(page.getByLabel('Wheel title', { exact: true })).toBeVisible()
      await expect(page.locator('.spinner-panel')).toBeHidden()
      await page.getByRole('button', { name: 'Customize', exact: true }).click()
      await expect(page.getByRole('dialog').getByRole('tab')).toHaveCount(3)
      await page.keyboard.press('Escape')
      await page.screenshot({ path: `../artifacts/editor-${width}.png`, fullPage: true })
    }
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
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
  expect(await page.locator('.wheel-svg').evaluate((svg) => svg.getAnimations().length)).toBe(0)
  await expect(page.getByRole('button', { name: 'Pause idle rotation' })).toBeHidden()
  await showScreen(page, 'wheel')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(
    await page.locator('.wheel-svg').evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('1e-05s')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
