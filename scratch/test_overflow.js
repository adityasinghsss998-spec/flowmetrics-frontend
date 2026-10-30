const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [1920, 1080]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://localhost:5673/login', { waitUntil: 'networkidle' });
    const overflowInfo = await page.evaluate(() => {
      return {
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        bodyScrollHeight: document.body.scrollHeight,
        bodyClientHeight: document.body.clientHeight,
        hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
        hasVerticalScroll: document.body.scrollHeight > window.innerHeight,
        leftColWidth: document.querySelector('.flex.flex-1.flex-col')?.getBoundingClientRect()?.width,
        rightColWidth: document.querySelector('.hidden.lg\\:flex')?.getBoundingClientRect()?.width,
        imgRect: document.querySelector('img[src*="screenshot-ai-panel"]')?.getBoundingClientRect()
      };
    });
    console.log(`Viewport ${w}x${h}:`, JSON.stringify(overflowInfo, null, 2));
    await page.screenshot({ path: `c:/Users/adity/Projects/SQL-PROJECT/flowmetrics-frontend/scratch/overflow_${w}x${h}.png` });
    await page.close();
  }
  await browser.close();
})();
