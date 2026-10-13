// Section-by-section screenshot capture for the SkyShield site.
// Usage: node capture.mjs <pass>     e.g. node capture.mjs pass1
// Saves temporary_screenshots/<page>_<pass>_<section>.png and a *_mobile.png per page.
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT = join(ROOT, 'temporary_screenshots');
const BASE = 'http://localhost:3000';
const pass = process.argv[2] || 'pass1';

const PAGES = [
  {
    page: 'home', url: `${BASE}/index.html`,
    sections: [
      ['hero', 'section.hero'],
      ['roofsystem', '#roof-system'],
      ['trust', 'section.trust'],
      ['stats', '[aria-labelledby="stats-h"]'],
      ['features', '#why'],
      ['map', '#map'],
      ['testimonials', '#reviews'],
      ['thankyou', '[aria-labelledby="thanks-h"]'],
      ['finalcta', '#contact'],
      ['footer', 'footer.footer'],
    ],
  },
  {
    page: 'shingles', url: `${BASE}/shingles.html`,
    sections: [
      ['header', '[aria-labelledby="page-h"]'],
      ['compare', '[aria-labelledby="compare-h"]'],
      ['colors', '[aria-labelledby="colors-h"]'],
      ['whytamko', '[aria-labelledby="why-h"]'],
      ['cta', '#shingles-cta'],
      ['footer', 'footer.footer'],
    ],
  },
  {
    page: 'insurance', url: `${BASE}/insurance.html`,
    sections: [
      ['wind', '[aria-labelledby="wind-h"]'],
      ['law', '[aria-labelledby="law-h"]'],
      ['process', '[aria-labelledby="proc-h"]'],
      ['cta', '#ins-cta'],
      ['footer', 'footer.footer'],
    ],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
try {
  for (const { page: pg, url, sections } of PAGES) {
    const page = await browser.newPage();

    // ---- Desktop section captures ----
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // Force scroll-reveal content visible so static element captures aren't faded.
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
    await sleep(500);
    for (const [name, sel] of sections) {
      const el = await page.$(sel);
      if (!el) { console.log(`  ! missing ${pg} ${sel}`); continue; }
      await el.evaluate((n) => n.scrollIntoView({ block: 'center' }));
      await sleep(450); // let reveal/IO animations settle
      const file = join(OUT, `${pg}_${pass}_${name}.png`);
      await el.screenshot({ path: file });
      console.log(`  saved ${pg}_${pass}_${name}.png`);
    }

    // ---- Mobile full-page ----
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
    await sleep(600);
    // Mobile: capture the first section as a readable element shot (full-page mobile
    // is many thousands of px tall and unreadable; sections tell the responsive story).
    for (const [name, sel] of sections.slice(0, 1)) {
      const el = await page.$(sel);
      if (el) { await el.screenshot({ path: join(OUT, `${pg}_${pass}_mobile_${name}.png`) }); console.log(`  saved ${pg}_${pass}_mobile_${name}.png`); }
    }
    // Plus a top-of-page viewport shot for the mobile nav/hero.
    await page.screenshot({ path: join(OUT, `${pg}_${pass}_mobile_top.png`) });
    console.log(`  saved ${pg}_${pass}_mobile_top.png`);

    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Capture complete:', pass);
