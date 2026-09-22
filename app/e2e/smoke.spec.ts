import { expect, test } from '@playwright/test'

test('first run shows onboarding and reaches an empty home', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Give anything a voice.' })).toBeVisible()
  await page.screenshot({ path: 'e2e/__screenshots__/welcome-1.png' })
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible()
  await page.getByRole('button', { name: 'Skip' }).isVisible().catch(() => false)
  await page.goto('/tags')
  await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible()
  await page.screenshot({ path: 'e2e/__screenshots__/home-empty.png' })
})
