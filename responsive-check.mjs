import { chromium } from 'playwright-core';

const sizes = [
  [2560, 1440], [1920, 1080], [1600, 900], [1440, 900], [1366, 768],
  [1280, 800], [1024, 768], [820, 1180], [768, 1024], [430, 932],
  [414, 896], [390, 844], [360, 800], [320, 640]
];

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const report = [];
for (const [width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await page.waitForTimeout(900);
  const data = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    heroHeight: Math.round(document.querySelector('.hero')?.getBoundingClientRect().height || 0),
    mascot: !!document.querySelector('.zk-mascot'),
    intro: !!document.querySelector('.zk-intro')
  }));
  const overflow = data.scrollWidth - data.innerWidth;
  report.push({ size: `${width}x${height}`, overflow, heroHeight: data.heroHeight, errors: errors.length, firstError: errors[0] || '' });
  await page.screenshot({ path: `shots/responsive/${width}.png`, fullPage: false });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
