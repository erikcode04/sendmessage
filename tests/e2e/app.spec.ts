import { test, expect } from '@playwright/test';

test('should show auth page initially', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2')).toContainText('Logga in');
});