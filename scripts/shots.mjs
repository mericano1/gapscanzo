// Dev helper: screenshots of key routes at desktop + mobile widths. Usage: node scripts/shots.mjs <outDir> [route...]
import { chromium } from 'playwright';
import path from 'node:path';

const [out, ...routes] = process.argv.slice(2);
const targets = routes.length ? routes : ['/'];
const sizes = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch();
for (const [name, viewport] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport });
  for (const route of targets) {
    await page.goto(`http://localhost:3100${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const file = path.join(out, `${route === '/' ? 'home' : route.replace(/\W+/g, '-').replace(/^-|-$/g, '')}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
}
await browser.close();
