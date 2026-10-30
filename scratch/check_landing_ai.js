const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5673', { waitUntil: 'networkidle' });
  const askAi = await page.$('#ask-ai');
  if (askAi) {
    await askAi.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await askAi.screenshot({ path: 'c:/Users/adity/Projects/SQL-PROJECT/flowmetrics-frontend/public/landing-ask-ai-updated.png' });
    console.log('Ask AI landing section screenshot captured');
  }
  await browser.close();
})();
