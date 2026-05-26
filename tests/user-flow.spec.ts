import { test, expect } from '@playwright/test';

/**
 * 🎭 AKSHARA WORLD — USER FLOW E2E AUTOMATED TESTS
 * 📁 tests/user-flow.spec.ts
 */
test.describe('Akshara World Dashboard Sandbox E2E User Flow Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the local Next.js server instance
    await page.goto('/');
  });

  test('should load the dashboard and verify key branding elements', async ({ page }) => {
    // 1. Verify page title or shell branding nodes are visible
    const brandLogo = page.locator('.brand-logo');
    await expect(brandLogo).toBeVisible();
    await expect(brandLogo).toContainText('Akshara World');

    // 2. Check that the active tab is Business KPIs and key KPI elements are present
    const topbarTitle = page.locator('.topbar-title');
    await expect(topbarTitle).toContainText('Business KPIs');

    // Verify key KPI nodes like "Uptime" and "AI Departments" are present
    await expect(page.getByText('Uptime')).toBeVisible();
    await expect(page.getByText('AI Departments')).toBeVisible();
  });

  test('should navigate to different departments and verify elements', async ({ page }) => {
    // Navigate to "Departments" tab via the sidebar
    const deptNav = page.getByText('Departments');
    await expect(deptNav).toBeVisible();
    await deptNav.click();

    // Verify that the departments container grid and specific departments (like Tech_Core) are displayed
    await expect(page.locator('.topbar-title')).toContainText('Departments');
    await expect(page.getByText('Tech_Core')).toBeVisible();
    await expect(page.getByText('Guardian_Ops')).toBeVisible();
  });

  test('should execute full agentic chat flow with Sam CEO', async ({ page }) => {
    // 1. Navigate to the "Chat with Sam" view
    const chatNav = page.getByText('Chat with Sam');
    await expect(chatNav).toBeVisible();
    await chatNav.click();

    // Verify chat view is active
    await expect(page.locator('.topbar-title')).toContainText('Chat with Sam');

    // 2. Locate the chat input node
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toHaveAttribute('placeholder', 'Message Sam...');

    // 3. Simulate message submission typing "Automated Sandbox test query"
    const testMessage = 'Verify sandbox loop integration';
    await chatInput.fill(testMessage);
    
    // Press 'Enter' or click send button
    const sendBtn = page.locator('.chat-send');
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // 4. Verify message injection into DOM
    const userMsgBubble = page.locator('.msg.user .msg-bubble').last();
    await expect(userMsgBubble).toBeVisible();
    await expect(userMsgBubble).toContainText(testMessage);
  });
});
