import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.use({
  storageState: { cookies: [], origins: [] },
  serviceWorkers: 'block',
  reducedMotion: 'reduce',
})

async function analyticsBrowser(page: Page) {
  const events: { name: string; params: Record<string, unknown> }[] = []
  const scripts: string[] = []
  await page.context().exposeBinding('captureAnalytics', (_source, args: unknown[]) => {
    if (args[0] === 'event')
      events.push({ name: args[1] as string, params: args[2] as Record<string, unknown> })
  })
  await page.context().route('https://wheelero.com/**', async (route) => {
    const url = new URL(route.request().url())
    const response = await route.fetch({ url: `http://localhost:4173${url.pathname}${url.search}` })
    await route.fulfill({ response })
  })
  await page
    .context()
    .route(
      /https:\/\/[^/]*(google-analytics|googletagmanager|doubleclick)\.[^/]+\//,
      async (route) => {
        scripts.push(route.request().url())
        if (route.request().url().startsWith('https://www.googletagmanager.com/gtag/js?')) {
          await route.fulfill({
            contentType: 'text/javascript',
            body: `
        const layer = window.dataLayer;
        layer.forEach(args => window.captureAnalytics(Array.from(args)));
        layer.push = function(...items) {
          items.forEach(args => window.captureAnalytics(Array.from(args)));
          return Array.prototype.push.apply(this, items);
        };
      `,
          })
        } else await route.abort()
      },
    )
  return { events, scripts }
}

test('basic consent blocks all Google requests before acceptance and after rejection', async ({
  page,
}) => {
  const { events, scripts } = await analyticsBrowser(page)
  await page.goto('https://wheelero.com/?email=PRIVATE_EMAIL#PRIVATE_SHARE')
  await expect(page.getByRole('button', { name: 'Accept cookies', exact: true })).toBeVisible()
  await page.waitForTimeout(500)
  expect(scripts).toEqual([])
  expect(events).toEqual([])
  expect(await page.context().cookies()).toEqual([])
  await page.getByRole('button', { name: 'Reject cookies', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Accept cookies', exact: true })).toHaveCount(0)
  await page.goto('https://wheelero.com/cookies')
  await expect(page.locator('.analytics-settings [role=status]')).toContainText('Analytics is off.')
  expect(scripts).toEqual([])
})

test('one page view per navigation and only safe successful feature events', async ({ page }) => {
  const { events, scripts } = await analyticsBrowser(page)
  await page.goto('https://wheelero.com/?utm_source=PRIVATE_CAMPAIGN#PRIVATE_SHARE')
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await expect.poll(() => events.filter((e) => e.name === 'page_view').length).toBe(1)
  expect(scripts).toHaveLength(1)
  expect(events[0].params.page_location).toBe('https://wheelero.com/')
  expect(events[0].params.page_referrer).toBe('')
  await page.getByRole('textbox', { name: 'Wheel title', exact: true }).fill('PRIVATE_TITLE')
  await page
    .getByRole('textbox', { name: 'Entries', exact: true })
    .fill('PRIVATE_NAME_1\nPRIVATE_NAME_2')
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
  await expect(page.getByRole('dialog').locator('.winner')).toBeVisible()
  await expect.poll(() => events.filter((e) => e.name === 'wheel_spin_complete').length).toBe(1)
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click()
  await expect.poll(() => events.filter((e) => e.name === 'wheel_save').length).toBe(1)
  await page.getByRole('button', { name: 'Share', exact: true }).click()
  await page.getByRole('button', { name: 'Create link', exact: true }).click()
  await expect.poll(() => events.filter((e) => e.name === 'wheel_share').length).toBe(1)
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'More options', exact: true }).click()
  await page.locator('.save-bar').getByRole('button', { name: 'Save', exact: true }).click()
  await expect.poll(() => events.filter((e) => e.name === 'wheel_save').length).toBe(2)
  await page.goto('https://wheelero.com/random-team-generator?email=PRIVATE_EMAIL')
  await expect.poll(() => events.filter((e) => e.name === 'page_view').length).toBe(2)
  await page.getByLabel('Names, one per line').fill('PRIVATE_ONLY')
  await page.getByRole('button', { name: 'Generate teams', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  expect(events.filter((e) => e.name === 'teams_generate')).toHaveLength(0)
  await page.getByLabel('Names, one per line').fill('PRIVATE_A\nPRIVATE_B\nPRIVATE_C\nPRIVATE_D')
  await page.getByRole('button', { name: 'Generate teams', exact: true }).click()
  await expect.poll(() => events.filter((e) => e.name === 'teams_generate').length).toBe(1)
  expect(events.at(-1)!.params.entry_count).toBe(4)
  expect(events.at(-1)!.params.team_count).toBe(2)
  expect(JSON.stringify(events)).not.toContain('PRIVATE')
  for (const event of events) {
    expect(Object.keys(event.params).sort()).toEqual(
      [
        'page_location',
        'page_title',
        'page_referrer',
        'send_to',
        ...(event.name !== 'page_view' ? ['entry_count'] : []),
        ...(event.name === 'teams_generate' ? ['team_count'] : []),
      ].sort(),
    )
  }
})

test('revocation removes tracking and cookies across tabs without deleting wheels', async ({
  page,
}) => {
  const { events, scripts } = await analyticsBrowser(page)
  await page.goto('https://wheelero.com/')
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await expect.poll(() => events.length).toBe(1)
  await page.getByRole('textbox', { name: 'Wheel title', exact: true }).fill('Retained wheel')
  const settings = await page.context().newPage()
  await settings.goto('https://wheelero.com/cookies')
  await settings.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await expect(page.locator('iframe')).toHaveCount(1)
  await page.context().addCookies([
    { name: '_ga', value: 'test', domain: 'wheelero.com', path: '/', secure: true },
    { name: '_ga_JB9ZRMKRKR', value: 'test', domain: 'wheelero.com', path: '/', secure: true },
  ])
  await settings.getByRole('button', { name: 'Reject cookies', exact: true }).click()
  await expect(page.locator('iframe')).toHaveCount(0)
  expect(
    (await page.context().cookies()).filter((cookie) => cookie.name.startsWith('_ga')),
  ).toEqual([])
  const before = events.length
  const loaded = scripts.length
  await page.getByRole('button', { name: 'Click to spin', exact: true }).click()
  await expect(page.getByRole('dialog').locator('.winner')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Wheel title', exact: true })).toHaveValue(
    'Retained wheel',
  )
  expect(events).toHaveLength(before)
  expect(scripts).toHaveLength(loaded)
})

test('local preview stays untracked even with acceptance and debug enabled', async ({ page }) => {
  const { scripts } = await analyticsBrowser(page)
  await page.goto('http://localhost:4173/')
  await page.evaluate(() => sessionStorage.setItem('wheelero-analytics-debug', 'true'))
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await page.reload()
  await expect(page.locator('iframe')).toHaveCount(0)
  expect(scripts).toEqual([])
})

test('failed persistence does not emit a save event', async ({ page }) => {
  const { events } = await analyticsBrowser(page)
  await page.goto('https://wheelero.com/')
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await expect.poll(() => events.length).toBe(1)
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args) {
      if (this.name === 'state') throw new DOMException('Full', 'QuotaExceededError')
      return put.apply(this, args)
    }
  })
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
  expect(events.filter((event) => event.name === 'wheel_save')).toHaveLength(0)
})

test('debug is opt-in, consent changes do not duplicate views and unsafe messages are rejected', async ({
  page,
}) => {
  const { events } = await analyticsBrowser(page)
  await page.goto('https://wheelero.com/cookies?email=PRIVATE_EMAIL#PRIVATE_FRAGMENT')
  await page.evaluate(() => sessionStorage.setItem('wheelero-analytics-debug', 'true'))
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await expect.poll(() => events.length).toBe(1)
  expect(events[0].params.debug_mode).toBe(true)
  expect(events[0].params.page_location).toBe('https://wheelero.com/cookies')
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await page.evaluate(() => {
    const frame = document.querySelector('iframe')!.contentWindow!
    frame.postMessage(
      {
        path: '/',
        debug: false,
        event: {
          name: 'wheel_save',
          entry_count: 1,
          email: 'PRIVATE_EMAIL',
        },
      },
      location.origin,
    )
    frame.postMessage(
      { path: '/PRIVATE_NAME', debug: false, event: { name: 'page_view' } },
      location.origin,
    )
    frame.postMessage(
      { path: '/', debug: false, event: { name: 'wheel_save', entry_count: -1 } },
      location.origin,
    )
  })
  await page.getByRole('button', { name: 'Reject cookies', exact: true }).click()
  await page.getByRole('button', { name: 'Accept cookies', exact: true }).click()
  await page.waitForTimeout(300)
  expect(events).toHaveLength(1)
})

test('cookie choice blocks the tool, survives Escape and works with keyboard on mobile', async ({
  page,
}) => {
  await analyticsBrowser(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('https://wheelero.com/')
  const banner = page.locator('dialog:has(.analytics-settings)')
  await expect(banner).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(banner).toBeVisible()
  await page.mouse.click(2, 2)
  await expect(banner).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const scan = await new AxeBuilder({ page }).include('dialog:has(.analytics-settings)').analyze()
  expect(scan.violations).toEqual([])
  await banner.getByRole('button', { name: 'Reject cookies', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(banner).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
  await page.reload()
  await expect(banner).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Click to spin', exact: true })).toBeEnabled()
})
