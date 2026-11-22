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

// Autonomous eye scan (no pointer movement)
const eyeSamples = [];
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(320);
  eyeSamples.push(await page.locator('.zk-emoji--eyes').evaluate((el) => parseFloat(el.style.getPropertyValue('--eye-x')) || 0));
}
const scanMoved = Math.max(...eyeSamples) - Math.min(...eyeSamples) > 1.5;

// Mascot tap -> bubble text
await page.locator('.zk-mascot').click();
await page.waitForTimeout(700);
const bubble = (await page.locator('.zk-mascot__bubble').textContent() || '').trim();

// Button stays visible
const buttonOpacity = await page.locator('.zk-band__btn').evaluate((el) => getComputedStyle(el).opacity);

// Reduced motion
const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rpage = await reduced.newPage();
await rpage.goto('http://localhost:5173/');
await rpage.waitForTimeout(600);
const reducedState = await rpage.evaluate(() => ({
  mascotHidden: getComputedStyle(document.querySelector('.zk-mascot')).display === 'none',
  introHidden: !document.querySelector('.zk-intro') || document.querySelector('.zk-intro').hidden
}));
await reduced.close();

await browser.close();
console.log(JSON.stringify({ introGone, scanMoved, eyeSamples, bubble, buttonOpacity, reducedState, errors }, null, 2));
