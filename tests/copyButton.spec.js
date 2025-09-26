// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CopyButton E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your app - adjust URL as needed
    await page.goto('http://localhost:3000');
  });

  test('copy button appears and is clickable', async ({ page }) => {
    // Wait for the page to load and look for copy button
    await page.waitForLoadState('networkidle');
    
    // Look for copy button by aria-label or role
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    // Check if button exists and is visible
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled();
  });

  test('copy button shows tooltip on hover', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    // Hover over the button
    await copyButton.hover();
    
    // Check if tooltip appears (title attribute)
    await expect(copyButton).toHaveAttribute('title');
  });

  test('copy button changes state when clicked', async ({ page }) => {
    // First, we need to have some feedback data to copy
    // This assumes you have a form filled out or feedback displayed
    await page.waitForLoadState('networkidle');
    
    // Look for the copy button
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    if (await copyButton.count() > 0) {
      // Get the initial SVG path (copy icon)
      const initialIcon = await copyButton.locator('svg path').first().getAttribute('d');
      
      // Click the copy button
      await copyButton.click();
      
      // Wait a moment for state change
      await page.waitForTimeout(100);
      
      // Check if the icon changed (should show checkmark)
      const newIcon = await copyButton.locator('svg path').first().getAttribute('d');
      
      // The SVG path should be different (copy icon vs checkmark icon)
      expect(initialIcon).not.toBe(newIcon);
      
      // Check if the button has green color class for success state
      const svgElement = copyButton.locator('svg');
      await expect(svgElement).toHaveClass(/text-green-500/);
    }
  });

  test('copy button is keyboard accessible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    if (await copyButton.count() > 0) {
      // Focus the button using Tab or direct focus
      await copyButton.focus();
      
      // Check if button is focused
      await expect(copyButton).toBeFocused();
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      // Verify the action was performed (icon should change)
      const svgElement = copyButton.locator('svg');
      await expect(svgElement).toHaveClass(/text-green-500/);
    }
  });

  test('copy button works with Space key', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    if (await copyButton.count() > 0) {
      await copyButton.focus();
      await expect(copyButton).toBeFocused();
      
      // Press Space to activate
      await page.keyboard.press('Space');
      
      // Verify the action was performed
      const svgElement = copyButton.locator('svg');
      await expect(svgElement).toHaveClass(/text-green-500/);
    }
  });

  test('copy functionality works end-to-end', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.waitForLoadState('networkidle');
    
    // First, let's create some feedback data by filling out a form
    // This is a basic test - you might need to adjust based on your actual form
    const nameInput = page.locator('input[placeholder="Enter employee name"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
    }
    
    // Look for any text inputs and fill them with test data
    const textInputs = page.locator('textarea');
    const inputCount = await textInputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      await textInputs.nth(i).fill(`Test answer ${i + 1}`);
    }
    
    // Submit or generate the feedback
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit")');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000); // Wait for feedback to generate
    }
    
    // Now test the copy functionality
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    if (await copyButton.count() > 0) {
      // Click the copy button
      await copyButton.click();
      
      // Wait for the copy action to complete
      await page.waitForTimeout(500);
      
      // Read clipboard content
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      
      // Verify that something was copied to clipboard
      expect(clipboardText).toBeTruthy();
      expect(clipboardText.length).toBeGreaterThan(0);
      
      // Verify it contains expected content
      expect(clipboardText).toMatch(/Test User|Onboarding Feedback/i);
    }
  });

  test('multiple copy buttons work independently', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Get all copy buttons on the page
    const copyButtons = page.locator('button[aria-label="Copy feedback"]');
    const buttonCount = await copyButtons.count();
    
    if (buttonCount > 1) {
      // Click the first button
      await copyButtons.first().click();
      
      // Verify only the first button changed state
      const firstButtonSvg = copyButtons.first().locator('svg');
      await expect(firstButtonSvg).toHaveClass(/text-green-500/);
      
      // Verify other buttons didn't change
      if (buttonCount > 1) {
        const secondButtonSvg = copyButtons.nth(1).locator('svg');
        await expect(secondButtonSvg).not.toHaveClass(/text-green-500/);
      }
    }
  });

  test('copy button handles rapid clicks gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    if (await copyButton.count() > 0) {
      // Click rapidly multiple times
      for (let i = 0; i < 5; i++) {
        await copyButton.click();
        await page.waitForTimeout(50); // Small delay between clicks
      }
      
      // Button should still be responsive and show success state
      const svgElement = copyButton.locator('svg');
      await expect(svgElement).toHaveClass(/text-green-500/);
      await expect(copyButton).toBeEnabled();
    }
  });

  test('copy button maintains accessibility during state changes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const copyButton = page.locator('button[aria-label="Copy feedback"]');
    
    if (await copyButton.count() > 0) {
      // Check initial accessibility attributes
      await expect(copyButton).toHaveAttribute('aria-label', 'Copy feedback');
      await expect(copyButton).toHaveAttribute('type', 'button');
      
      // Click and verify accessibility is maintained
      await copyButton.click();
      await page.waitForTimeout(100);
      
      // Accessibility attributes should remain the same
      await expect(copyButton).toHaveAttribute('aria-label', 'Copy feedback');
      await expect(copyButton).toHaveAttribute('type', 'button');
      
      // Button should still be focusable and clickable
      await expect(copyButton).toBeEnabled();
      await copyButton.focus();
      await expect(copyButton).toBeFocused();
    }
  });
});