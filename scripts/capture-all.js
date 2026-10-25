const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VERIF_DIR = path.resolve('C:/Users/adity/.gemini/antigravity-ide/brain/6956db0b-e6ce-4369-8a60-97ccd9046b37/verification');

if (!fs.existsSync(VERIF_DIR)) {
  fs.mkdirSync(VERIF_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  console.log('=== PHASE 1: LOGIN AS DESIGN TESTER & CAPTURE POPULATED DATA (2x) ===');
  // Context with 2x pixel density, 1440x900 viewport
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // Log in
  await page.goto('http://localhost:5673/login');
  await page.fill('#login-email', 'tester@flowmetrics.dev');
  await page.fill('#login-password', 'DesignTester123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('Logged in to dashboard successfully.');

  // Go to repo 15 with 90 days period (longest period, fully populated)
  await page.goto('http://localhost:5673/repos/15?days=90');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 1. Capture Hero Dashboard screenshot: populated repo overview with 90d metrics
  console.log('Capturing screenshot-dashboard.png (2x)...');
  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'screenshot-dashboard.png'),
    clip: { x: 260, y: 70, width: 1160, height: 780 },
  });

  // 2. Capture DORA overview: DORA scorecards and metrics
  console.log('Capturing screenshot-dora.png (2x)...');
  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'screenshot-dora.png'),
    clip: { x: 260, y: 120, width: 1160, height: 620 },
  });

  // 3. Capture Cycle Time Trend & PR size chart
  console.log('Capturing screenshot-cycle-time.png (2x)...');
  const cycleTimeSection = page.locator('div.grid.gap-5.lg\\:grid-cols-2').first();
  if (await cycleTimeSection.count()) {
    await cycleTimeSection.screenshot({ path: path.join(PUBLIC_DIR, 'screenshot-cycle-time.png') });
  }

  // 4. Capture Contributors page: Leaderboard & Heatmap
  console.log('Capturing screenshot-contributors.png (2x)...');
  await page.goto('http://localhost:5673/repos/15/contributors?days=90');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'screenshot-contributors.png'),
    clip: { x: 260, y: 70, width: 1160, height: 600 },
  });

  // 5. Capture Open PRs page: Summary & PR Queue
  console.log('Capturing screenshot-prs.png (2x)...');
  await page.goto('http://localhost:5673/repos/15/prs');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'screenshot-prs.png'),
    clip: { x: 260, y: 70, width: 1160, height: 600 },
  });

  console.log('=== PHASE 2: CAPTURE VERIFICATION SCREENSHOTS AT 1440 & 390 ===');

  // Helper for viewport screenshots
  async function capturePair(name, setupFn) {
    // 1440px
    const ctx1440 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const p1440 = await ctx1440.newPage();
    await setupFn(p1440, 1440);
    await ctx1440.close();

    // 390px
    const ctx390 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const p390 = await ctx390.newPage();
    await setupFn(p390, 390);
    await ctx390.close();
  }

  // 1. Landing Hero (1440 & 390)
  await capturePair('landing_hero', async (p, width) => {
    await p.goto('http://localhost:5673/');
    await p.waitForTimeout(1500); // Wait for typing animation to complete
    await p.screenshot({
      path: path.join(VERIF_DIR, `landing_hero_${width}.png`),
    });
    console.log(`Saved landing_hero_${width}.png`);
  });

  // 2. Panel scene end state (1440 & 390)
  await capturePair('panel_scene_end', async (p, width) => {
    await p.goto('http://localhost:5673/');
    await p.waitForTimeout(1200);
    // Scroll into the panel scene so panels straighten
    const scene = p.locator('#features');
    if (await scene.count()) {
      await scene.scrollIntoViewIfNeeded();
      // Scroll a bit more to ensure halfway through viewport so panels are completely straight
      await p.mouse.wheel(0, 400);
      await p.waitForTimeout(800);
      await p.screenshot({
        path: path.join(VERIF_DIR, `panel_scene_end_${width}.png`),
      });
      console.log(`Saved panel_scene_end_${width}.png`);
    }
  });

  // 3. Sign in with error shown (1440 & 390)
  await capturePair('signin_error', async (p, width) => {
    await p.goto('http://localhost:5673/login');
    await p.fill('#login-email', 'wrong@example.com');
    await p.fill('#login-password', 'wrongpassword');
    await p.click('button[type="submit"]');
    await p.waitForSelector('#login-error-alert', { timeout: 8000 });
    await p.waitForSelector('button[type="submit"]:not([aria-busy="true"])', { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(300);
    await p.screenshot({
      path: path.join(VERIF_DIR, `signin_error_${width}.png`),
    });
    console.log(`Saved signin_error_${width}.png`);
  });

  // 4. Sign in in loading state (1440 & 390)
  await capturePair('signin_loading', async (p, width) => {
    await p.goto('http://localhost:5673/login');
    await p.fill('#login-email', 'tester@flowmetrics.dev');
    await p.fill('#login-password', 'DesignTester123!');
    // Delay network so we can capture loading state
    await p.route('**/api/v1/auth/login', async (route) => {
      await new Promise(r => setTimeout(r, 3000));
      await route.continue();
    });
    await p.click('button[type="submit"]');
    await p.waitForTimeout(300);
    await p.screenshot({
      path: path.join(VERIF_DIR, `signin_loading_${width}.png`),
    });
    console.log(`Saved signin_loading_${width}.png`);
  });

  // 5. Sign up (1440 & 390)
  await capturePair('signup', async (p, width) => {
    await p.goto('http://localhost:5673/register');
    await p.waitForTimeout(500);
    await p.screenshot({
      path: path.join(VERIF_DIR, `signup_${width}.png`),
    });
    console.log(`Saved signup_${width}.png`);
  });

  // 6. Dashboard with user menu open (1440 & 390)
  await capturePair('dashboard_usermenu', async (p, width) => {
    await p.goto('http://localhost:5673/login');
    await p.fill('#login-email', 'tester@flowmetrics.dev');
    await p.fill('#login-password', 'DesignTester123!');
    await p.click('button[type="submit"]');
    await p.waitForURL('**/dashboard', { timeout: 10000 });
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(600);

    if (width === 390) {
      // Open mobile sidebar first
      const toggle = p.locator('#sidebar-mobile-toggle');
      if (await toggle.count()) {
        await toggle.click();
        await p.waitForTimeout(500);
      }
      const mobileUserBtn = p.locator('#mobile-sidebar button[data-slot="dropdown-menu-trigger"]');
      if (await mobileUserBtn.count()) {
        await mobileUserBtn.click();
        await p.waitForSelector('#sidebar-signout-button', { timeout: 3000 }).catch(() => {});
        await p.waitForTimeout(300);
      }
    } else {
      const desktopUserBtn = p.locator('#desktop-sidebar button[data-slot="dropdown-menu-trigger"]');
      if (await desktopUserBtn.count()) {
        await desktopUserBtn.click();
        await p.waitForSelector('#sidebar-signout-button', { timeout: 3000 }).catch(() => {});
        await p.waitForTimeout(300);
      }
    }
    await p.screenshot({
      path: path.join(VERIF_DIR, `dashboard_usermenu_${width}.png`),
    });
    console.log(`Saved dashboard_usermenu_${width}.png`);
  });

  // 7. Hover states on 1440
  console.log('=== PHASE 3: CAPTURE HOVER STATES ===');
  const hoverCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    hasTouch: false,
  });
  const hoverPage = await hoverCtx.newPage();
  await hoverPage.goto('http://localhost:5673/');
  await hoverPage.waitForTimeout(1000);

  // Hover accent button (Continue with GitHub in Hero)
  const heroBtn = hoverPage.locator('.fm-btn-accent').first();
  await heroBtn.hover();
  await hoverPage.waitForTimeout(250);
  await heroBtn.screenshot({ path: path.join(VERIF_DIR, 'hover_accent_button.png') });
  console.log('Saved hover_accent_button.png');

  // Hover nav link (Features)
  const navLink = hoverPage.locator('.fm-nav-link:has-text("Features")');
  await navLink.hover();
  await hoverPage.waitForTimeout(250);
  await navLink.screenshot({ path: path.join(VERIF_DIR, 'hover_nav_link.png') });
  console.log('Saved hover_nav_link.png');

  // Hover wordmark
  const wordmark = hoverPage.locator('.fm-wordmark-link').first();
  await wordmark.hover();
  await hoverPage.waitForTimeout(250);
  await wordmark.screenshot({ path: path.join(VERIF_DIR, 'hover_wordmark.png') });
  console.log('Saved hover_wordmark.png');

  // Measure LCP
  console.log('=== PHASE 4: MEASURE LCP ===');
  const lcpPage = await hoverCtx.newPage();
  await lcpPage.goto('http://localhost:5673/');
  const lcp = await lcpPage.evaluate(() => {
    return new Promise((resolve) => {
      let lcpValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          lcpValue = entry.startTime;
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(lcpValue);
      }, 2500);
    });
  });
  console.log(`MEASURED LCP: ${lcp.toFixed(2)} ms (${(lcp / 1000).toFixed(2)}s)`);

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch(console.error);
