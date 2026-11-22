import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'connection', { get: () => ({ effectiveType: '4g', downlink: 10, rtt: 20 }) });
});
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

// Intro frames
const shots = [100, 500, 1100, 1600, 2600];
let previous = 0;
for (const t of shots) {
  await page.waitForTimeout(t - previous);
  previous = t;
  await page.screenshot({ path: `shots/animation/intro-${t}.png` });
}
const introGone = await page.locator('.zk-intro').count() === 0;

// Autonomous eye scan: sample during a gap between words, when no caret is tracked.
const eyeSamples = [];
for (let i = 0; i < 90; i++) {
  const s = await page.evaluate(() => ({
    empty: (document.querySelector('.zk-typed__word')?.textContent || '').length === 0,
    x: parseFloat(document.querySelector('.zk-emoji--eyes')?.style.getPropertyValue('--eye-x')) || 0
  }));
  if (s.empty) {
    eyeSamples.push(s.x);
    if (eyeSamples.length >= 7) break;
  } else {
    eyeSamples.length = 0;
  }
  await page.waitForTimeout(80);
}
const scanMoved = eyeSamples.length >= 3 && Math.max(...eyeSamples) - Math.min(...eyeSamples) > 1.5;

// The headline eye follows the typed word: pupils shift right as letters appear.
const tracked = [];
let lastLen = -1;
for (let i = 0; i < 90; i++) {
  const s = await page.evaluate(() => ({
    len: (document.querySelector('.zk-typed__word')?.textContent || '').length,
    x: parseFloat(document.querySelector('.zk-emoji--eyes')?.style.getPropertyValue('--eye-x')) || 0
  }));
  if (s.len > lastLen && s.len >= 1 && s.len <= 8) tracked.push(s);
  lastLen = s.len;
  if (tracked.length >= 6) break;
  await page.waitForTimeout(60);
}
const corr = (pts) => {
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.len, 0) / n;
  const my = pts.reduce((a, p) => a + p.x, 0) / n;
  const num = pts.reduce((a, p) => a + (p.len - mx) * (p.x - my), 0);
  const dx = Math.sqrt(pts.reduce((a, p) => a + (p.len - mx) ** 2, 0));
  const dy = Math.sqrt(pts.reduce((a, p) => a + (p.x - my) ** 2, 0));
  return dx && dy ? +(num / (dx * dy)).toFixed(3) : 0;
};
const trackingCorr = corr(tracked);
const wordTracked = tracked.length >= 6 && trackingCorr > 0.8;

// Mascot tap -> bubble text
await page.locator('.zk-mascot').click();
await page.waitForTimeout(700);
const bubble = (await page.locator('.zk-mascot__bubble').textContent() || '').trim();

// Button stays visible
const buttonOpacity = await page.locator('.zk-band__btn').evaluate((el) => getComputedStyle(el).opacity);

// Reduced motion
const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rpage = await reduced.newPage();
await rpage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await rpage.waitForTimeout(600);
const reducedState = await rpage.evaluate(() => ({
  mascotHidden: getComputedStyle(document.querySelector('.zk-mascot')).display === 'none',
  introHidden: !document.querySelector('.zk-intro') || document.querySelector('.zk-intro').hidden
}));
await reduced.close();

await browser.close();
console.log(JSON.stringify({ introGone, scanMoved, eyeSamples, wordTracked, trackingCorr, tracked, bubble, buttonOpacity, reducedState, errors }, null, 2));
