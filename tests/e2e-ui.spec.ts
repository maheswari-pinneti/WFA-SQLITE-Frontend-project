import { test, expect } from '@playwright/test';

test.describe('Workforce Analytics Dashboard - E2E UI Flow', () => {
  test('should load login page, enter corporate email, and navigate through the MFA flow', async ({ page }) => {
    // 1. Visit Login screen
    await page.goto('http://localhost:3000/login');
    await expect(page).toHaveTitle(/Workforce Analytics/i);

    // 2. Locate and enter corporate email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('employee@thestackly.com');

    // 3. Click Login / Submit button
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // 4. Assert transition to MFA Challenge screen (OTP digit inputs exist)
    const otpInputs = page.locator('input[type="text"][maxlength="1"]');
    await expect(otpInputs.first()).toBeVisible({ timeout: 5000 });

    // Wait for the developer auto-fill helper to populate the code
    await page.waitForTimeout(1000);

    const verifyButton = page.locator('button:has-text("Sign In with OTP")');
    await verifyButton.click();

    // 6. Verify employee dashboard welcomes page load
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
