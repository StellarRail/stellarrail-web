import { test, expect } from '@playwright/test'

test('visual: login + dashboard snapshots', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveScreenshot({ maxDiffPixels: 5000 })
  await page.goto('/')
  await expect(page).toHaveScreenshot({ maxDiffPixels: 5000 })
})
