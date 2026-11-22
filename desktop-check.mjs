import { chromium } from 'playwright-core';

const url = 'https://zunka-landing-demo.vercel.app/';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });

const meta = await browser.newPage();
await meta.goto(url, { waitUntil: 'domcontentloaded' });
const og = await meta.evaluate(() => ({
  image: document.querySelector('meta[property="og:image"]')?.content,
  title: document.querySelector('meta[property="og:title"]')?.content,
  url: document.querySelector('meta[property="og:url"]')?.content
}));
await meta.close();

for (const [w, h] of [[1440, 900], [1920, 1080], [1280, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `shots/desktop-live-${w}.png` });
  await page.screenshot({ path: `shots/desktop-live-full-${w}.png`, fullPage: true });
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
await page.goto(url, { waitUntil: 'domcontentloaded' });

const eye = [];
const words = [];
for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(900);
  eye.push(await page.locator('.zk-emoji--eyes').evaluate((el) => el.style.getPropertyValue('--eye-x')));
  words.push(await page.locator('.zk-typed__word').textContent());
}
const caret = await page.locator('.zk-typed__caret').evaluate((el) => getComputedStyle(el).animationDuration);
await browser.close();
console.log(JSON.stringify({ og, eye, words, caret, errors }, null, 2));
