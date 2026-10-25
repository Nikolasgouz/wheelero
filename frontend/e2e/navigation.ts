import type { Page } from '@playwright/test'

export async function showScreen(page: Page, screen: 'wheel' | 'options') {
  const panel = screen === 'wheel' ? '.spinner-panel' : '.editor-column'
  if (!(await page.locator(panel).isVisible()))
    await page
      .getByRole('button', { name: screen === 'wheel' ? 'Wheel' : 'Entries', exact: true })
      .click()
}
