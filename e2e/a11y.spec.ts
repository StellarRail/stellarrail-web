import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const route of ['/login', '/', '/payments/new']) {
  test(`a11y: ${route} has no critical violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical).toEqual([])
  })
}
