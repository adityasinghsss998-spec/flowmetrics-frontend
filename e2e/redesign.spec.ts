import { test, expect } from '@playwright/test';

test.describe('FlowMetrics Redesign Verification', () => {
  // 1. No em dash in visible text on landing, login, register, and dashboard
  test('no em dash in visible text on landing, sign-in, sign-up and dashboard', async ({ page }) => {
    const urls = ['/', '/login', '/register'];

    for (const url of urls) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const hasEmDash = await page.evaluate(() => {
        // Find visible text containing em dash
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        const violations: string[] = [];
        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!parent) continue;
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
          const text = node.textContent || '';
          if (text.includes('—') || text.includes('–')) {
            violations.push(`${parent.tagName}: "${text.trim()}"`);
          }
        }
        return violations;
      });

      expect(hasEmDash, `Found em/en dash on ${url}: ${hasEmDash.join('; ')}`).toEqual([]);
    }

    // Now test dashboard
    await page.goto('/login');
    await page.locator('#login-email').fill('tester@flowmetrics.dev');
    await page.locator('#login-password').fill('DesignTester123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    const dashboardViolations = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      const violations: string[] = [];
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent) continue;
        const style = window.getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        const text = node.textContent || '';
        if (text.includes('—') || text.includes('–')) {
          violations.push(`${parent.tagName}: "${text.trim()}"`);
        }
      }
      return violations;
    });

    expect(dashboardViolations, `Found em/en dash on /dashboard: ${dashboardViolations.join('; ')}`).toEqual([]);
  });

  // 2. Hero headline words never split across lines
  test('hero headline words never split across lines', async ({ page }) => {
    await page.goto('/');
    const headlineWords = page.locator('#hero h1 span.whitespace-nowrap');
    const count = await headlineWords.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const word = headlineWords.nth(i);
      const isNowrap = await word.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const ws = style.whiteSpace || style.getPropertyValue('white-space') || (el as HTMLElement).style.whiteSpace;
        return ws.includes('nowrap');
      });
      expect(isNowrap).toBe(true);
    }
  });

  // 3. With reduced motion on, buttons change color without any transform
  test('with reduced motion on, buttons change color without transform', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const accentBtn = page.locator('.fm-btn-accent').first();
    await expect(accentBtn).toBeVisible();

    const transform = await accentBtn.evaluate((el) => {
      const beforeStyle = window.getComputedStyle(el, '::before');
      return beforeStyle.transform;
    });
    // With reduced motion, ::before has display: none or transition: none, transform is none
    expect(transform).toBe('none');
  });

  // 4. Signing out lands on the landing page
  test('signing out clears state and lands on landing page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('tester@flowmetrics.dev');
    await page.locator('#login-password').fill('DesignTester123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Open user menu
    const userMenuBtn = page.locator('#desktop-sidebar button[data-slot="dropdown-menu-trigger"]');
    await userMenuBtn.click();

    // Click Sign out (role="menuitem")
    const signOutBtn = page.locator('#sidebar-signout-button, [role="menuitem"]:has-text("Sign out")').first();
    await signOutBtn.click();

    await page.waitForURL('http://localhost:5673/', { timeout: 5000 });
    expect(page.url()).toBe('http://localhost:5673/');

    // Verify localStorage cleared
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });

  // 5. Visiting protected page unauthenticated goes to sign-in and returns after sign-in
  test('visiting protected page while signed out redirects to sign-in and returns', async ({ page }) => {
    // Clear storage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Try to visit /dashboard directly
    await page.goto('/dashboard');
    await page.waitForURL(/.*login.*redirect.*/, { timeout: 5000 });

    // Fill in sign in form
    await page.locator('#login-email').fill('tester@flowmetrics.dev');
    await page.locator('#login-password').fill('DesignTester123!');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect back to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });
});
