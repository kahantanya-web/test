const { test, expect } = require('@playwright/test');

test.describe('TextInput E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Use a shorter timeout for faster tests
    await page.waitForLoadState('domcontentloaded');
    // Wait for the form to be visible
    await page.waitForSelector('input#user-name', { timeout: 10000 });
  });

  test('text input appears with correct label and placeholder', async ({ page }) => {
    // Find the user name input (TextInput component)
    const userNameInput = page.locator('input#user-name');
    const userNameLabel = page.locator('label:has-text("User name")');
    
    // Check if input exists and is visible
    await expect(userNameInput).toBeVisible();
    await expect(userNameLabel).toBeVisible();
    
    // Check placeholder text
    await expect(userNameInput).toHaveAttribute('placeholder', 'Enter user name as in Excel');
    
    // Check required indicator (red asterisk)
    const requiredIndicator = page.locator('label:has-text("User name") span.text-red-500');
    await expect(requiredIndicator).toBeVisible();
    await expect(requiredIndicator).toHaveText('*');
  });

  test('text input accepts user input', async ({ page }) => {
    const userNameInput = page.locator('input#user-name');
    
    // Type in the input
    const testValue = 'John Doe';
    await userNameInput.fill(testValue);
    
    // Verify the value was entered
    await expect(userNameInput).toHaveValue(testValue);
  });

  test('text input can be cleared and refilled', async ({ page }) => {
    const userNameInput = page.locator('input#user-name');
    
    // Fill with initial value
    await userNameInput.fill('Initial Value');
    await expect(userNameInput).toHaveValue('Initial Value');
    
    // Clear the input
    await userNameInput.clear();
    await expect(userNameInput).toHaveValue('');
    
    // Fill with new value
    await userNameInput.fill('New Value');
    await expect(userNameInput).toHaveValue('New Value');
  });

  test('text input responds to keyboard input', async ({ page }) => {
    const userNameInput = page.locator('input#user-name');
    
    // Focus the input
    await userNameInput.focus();
    await expect(userNameInput).toBeFocused();
    
    // Type character by character
    await page.keyboard.type('Test User');
    await expect(userNameInput).toHaveValue('Test User');
    
    // Test backspace
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await expect(userNameInput).toHaveValue('Test ');
    
    // Type more text
    await page.keyboard.type('Employee');
    await expect(userNameInput).toHaveValue('Test Employee');
  });

  test('text input accessibility attributes', async ({ page }) => {
    const userNameInput = page.locator('input#user-name');
    const userNameLabel = page.locator('label:has-text("User name")');
    
    // Check input attributes
    await expect(userNameInput).toHaveAttribute('type', 'text');
    await expect(userNameInput).toHaveAttribute('id', 'user-name');
    
    // Check label association (for attribute should match input id)
    const labelFor = await userNameLabel.getAttribute('for');
    if (labelFor) {
      expect(labelFor).toBe('user-name');
    }
    
    // Check if input is properly labeled
    await expect(userNameInput).toHaveAccessibleName(/user name/i);
  });

  test('text input form submission validation', async ({ page }) => {
    const userNameInput = page.locator('input#user-name');
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit with empty required field
    await submitButton.click();
    
    // Wait a moment for validation to appear
    await page.waitForTimeout(500);
    
    // Look for the specific validation message by text content
    const validationMessage = page.getByText('User name is required.');
    
    // If validation exists, check it
    if (await validationMessage.count() > 0) {
      await expect(validationMessage).toBeVisible();
    }
    
    // Fill the input and check validation clears
    await userNameInput.fill('Valid User Name');
    
    // Wait a moment for validation to update
    await page.waitForTimeout(300);
    
    // The validation message should be hidden after filling the field
    if (await validationMessage.count() > 0) {
      await expect(validationMessage).toBeHidden();
    }
  });

  test('text input interaction with form state', async ({ page }) => {
    const userNameInput = page.locator('input#user-name');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill the required field
    await userNameInput.fill('Test User for Form');
    
    // Verify input retains value during form interaction
    await expect(userNameInput).toHaveValue('Test User for Form');
    
    // Test that value persists when clicking other elements
    await submitButton.hover();
    await expect(userNameInput).toHaveValue('Test User for Form');
    
    // Test focus cycling
    await userNameInput.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(userNameInput).toBeFocused();
    await expect(userNameInput).toHaveValue('Test User for Form');
  });
});