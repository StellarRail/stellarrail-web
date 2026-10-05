import { test, expect } from '@playwright/test'

test('auth: login page validates', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
})

test('operator: dashboard + new payment', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('StellarRail')).toBeVisible()
  await page.goto('/payments/new')
  await expect(page.getByRole('heading', { name: 'New Payment' })).toBeVisible()
})

test('approver: queue renders', async ({ page }) => {
  await page.goto('/approvals')
  await expect(page.getByRole('heading', { name: 'Pending Queue' })).toBeVisible()
})

test('admin: users guarded render', async ({ page }) => {
  await page.goto('/admin/users')
  await expect(page.getByText(/Users|Forbidden|Please log in/)).toBeVisible()
})

test('mfa: challenge renders', async ({ page }) => {
  await page.goto('/mfa')
  await expect(page.getByText(/Two-factor/)).toBeVisible()
})

test('audit: page renders', async ({ page }) => {
  await page.goto('/admin/audit')
  await expect(page.getByText(/Audit|Forbidden|Please log in/)).toBeVisible()
})

test('payment detail renders', async ({ page }) => {
  await page.goto('/payments/pay_004')
  await expect(page.getByRole('heading', { name: /Payment REF-/ })).toBeVisible()
})
