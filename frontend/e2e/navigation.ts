import { expect, type Page } from '@playwright/test'

export async function showScreen(page: Page, screen: 'wheel' | 'options') {
  const panel = screen === 'wheel' ? '.spinner-panel' : '.editor-column'
  // Template selection navigates after its local write; wait for that operation first.
  await expect(page.getByRole('button', { name: 'Wheel', exact: true })).toBeEnabled()
  if (!(await page.locator(panel).isVisible()))
    await page
      .getByRole('button', { name: screen === 'wheel' ? 'Wheel' : 'More options', exact: true })
      .click()
  await expect(page.locator(panel)).toBeVisible()
}
