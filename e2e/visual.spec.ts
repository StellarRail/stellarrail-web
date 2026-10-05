import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Block webfonts so snapshots are deterministic with/without network
  await page.route('**/fonts.googleapis.com/**', (r) => r.abort())
  await page.route('**/fonts.gstatic.com/**', (r) => r.abort())
})

test('visual: login + dashboard snapshots', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveScreenshot({ maxDiffPixels: 5000 })
  await page.goto('/')
  await expect(page).toHaveScreenshot({ maxDiffPixels: 5000 })
})
