import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { pages, publicPath, toolPaths } from '../src/site'

test('six distinct tools preserve useful initial HTML, headings, metadata and links', async ({
  browser,
  page,
  request,
}) => {
  const staticContext = await browser.newContext({ javaScriptEnabled: false, locale: 'en-US' })
  const staticPage = await staticContext.newPage()
  const titles = new Set<string>()
  const descriptions = new Set<string>()
  for (const path of toolPaths) {
    await staticPage.goto(path)
    await expect(staticPage.locator('h1')).toHaveCount(1)
    await expect(staticPage.locator('h1')).toHaveText(pages[path].heading)
    await expect(staticPage.locator('h1')).toBeVisible()
    expect(await staticPage.title()).toBe(pages[path].title)
    titles.add(await staticPage.title())
    descriptions.add((await staticPage.locator('meta[name=description]').getAttribute('content'))!)
    const canonical = (await staticPage.locator('link[rel=canonical]').getAttribute('href'))!
    expect(canonical).toBe('https://wheelero.com' + publicPath(path))
    await expect(staticPage.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      canonical,
    )
    await expect(staticPage.locator('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      pages[path].title,
    )
    await expect(staticPage.locator('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      pages[path].description,
    )
    await expect(staticPage.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://wheelero.com/social.png',
    )
    const schema = JSON.parse(
      (await staticPage.locator('script[type="application/ld+json"]').textContent())!,
    )
    expect(schema['@type']).toBe('WebApplication')
    expect(schema).not.toHaveProperty('aggregateRating')
    const content = path === '/' ? '.home-info' : '.tool-guide'
    const before = await staticPage.locator(content).textContent()
    await page.goto(path)
    await expect(page.locator('.tool-loading')).toHaveCount(0)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(pages[path].heading)
    expect(await page.locator(content).textContent()).toBe(before)
    if (path === '/') {
      await expect(page.locator('.tool-guide')).toHaveCount(0)
      await expect(page.locator('.home-info')).toContainText('Save updates a wheel with the same name.')
      await expect(page.locator('.home-info')).toContainText('the next task on your list')
      await expect(page.locator('.info-how')).toHaveCount(1)
    }
    await expect(page.locator('.footer-tools, .tool-links')).toHaveCount(0)
    await expect(page.locator('.site-links .footer-group a')).toHaveCount(6)
    for (const href of await page
      .locator('.site-links .footer-group a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) {
      expect((await request.get(href)).status()).toBe(200)
    }
  }
  expect(titles.size).toBe(6)
  expect(descriptions.size).toBe(6)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of toolPaths)
    expect(sitemap).toContain(`<loc>https://wheelero.com${publicPath(path)}</loc>`)
  expect(sitemap).not.toContain('/404')
  expect(sitemap).not.toContain('lastmod')
  expect(await (await request.get('/robots.txt')).text()).toContain(
    'Sitemap: https://wheelero.com/sitemap.xml',
  )
  const missing = await staticPage.goto('/missing-seo-page')
  expect(missing!.status()).toBe(404)
  await expect(staticPage.locator('meta[name=robots]')).toHaveAttribute(
    'content',
    'noindex,nofollow',
  )
  await expect(staticPage.locator('link[rel=canonical]')).toHaveCount(0)
  await staticContext.close()
})

test('number generator validates ranges, copies unique batches and works offline', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/random-number-generator')
  await page.getByLabel('Minimum', { exact: true }).fill('-2')
  await page.getByLabel('Maximum', { exact: true }).fill('2')
  await page.getByLabel('Quantity', { exact: true }).fill('6')
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('not enough')
  await page.getByLabel('Quantity', { exact: true }).fill('5')
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
  const results = page.getByLabel('Generated numbers', { exact: true })
  expect(
    (await results.inputValue())
      .split('\n')
      .map(Number)
      .sort((a, b) => a - b),
  ).toEqual([-2, -1, 0, 1, 2])
  await page.getByRole('button', { name: 'Copy results', exact: true }).click()
  expect((await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n')).toBe(
    await results.inputValue(),
  )
  await page.getByLabel('Minimum', { exact: true }).fill('7')
  await page.getByLabel('Maximum', { exact: true }).fill('7')
  await page.getByLabel('Allow repeats', { exact: true }).check()
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
  await expect(results).toHaveValue('7\n7\n7\n7\n7')
  await page.getByLabel('Minimum', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('whole numbers')
  await page.getByLabel('Minimum', { exact: true }).fill('8')
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Minimum')
  await page.getByLabel('Minimum', { exact: true }).fill('1')
  await page.getByLabel('Quantity', { exact: true }).fill('1001')
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('quantity')
  await page.evaluate(async () => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await page.getByLabel('Minimum', { exact: true }).fill('-1')
  await page.getByLabel('Maximum', { exact: true }).fill('-1')
  await page.getByRole('button', { name: 'Generate numbers', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(results).toHaveValue('-1')
})

test('number generator is accessible on mobile in light and dark themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await page.goto('/random-number-generator')
    // The first visit saves light mode. Change that preference through React's control,
    // rather than racing the app's theme effect with a direct DOM attribute mutation.
    if (theme === 'dark') await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    await page.getByRole('button', { name: 'Generate numbers', exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).include('#main-content').analyze()).violations).toEqual(
      [],
    )
  }
})
