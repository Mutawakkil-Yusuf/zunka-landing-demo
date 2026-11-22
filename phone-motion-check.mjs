import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });

for (const mode of ['no-preference', 'reduce']) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    reducedMotion: mode
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  await page.goto('https://zunka-landing-demo.vercel.app/', { waitUntil: 'domcontentloaded' });
  const samples = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(450);
    samples.push(await page.locator('.zk-emoji--eyes').evaluate((el) => el.style.getPropertyValue('--eye-x')));
  }
  const state = await page.evaluate(() => ({
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    mascot: getComputedStyle(document.querySelector('.zk-mascot')).display,
    word: document.querySelector('.zk-typed__word')?.textContent,
    bg: getComputedStyle(document.querySelector('.zk-emoji--eyes')).backgroundImage.slice(0, 60)
  }));
  console.log(JSON.stringify({ mode, state, samples, errors }, null, 2));
  await context.close();
}
await browser.close();
