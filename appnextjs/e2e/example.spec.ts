import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Flexcoz/);
});

test('redirects to login if not authenticated', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Should redirect to /login
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByText('Sign in to your account')).toBeVisible();
});
