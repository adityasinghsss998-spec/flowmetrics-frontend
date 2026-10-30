const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5673/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'c:/Users/adity/Projects/SQL-PROJECT/flowmetrics-frontend/public/login-updated-1440.png' });
  console.log('Login screenshot updated successfully');
  await browser.close();
})();
