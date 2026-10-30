const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5673/login', { waitUntil: 'networkidle' });
  const img = await page.$('img[src*="screenshot-ai-panel"]');
  if (img) {
    const parent = await img.evaluateHandle(el => el.parentElement);
    await parent.asElement().screenshot({ path: 'c:/Users/adity/Projects/SQL-PROJECT/flowmetrics-frontend/public/test-box.png' });
    console.log('Parent screenshot captured');
  }
  await browser.close();
})();
