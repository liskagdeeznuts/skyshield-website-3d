// Screenshot a URL with Puppeteer and save to ./temporary_screenshots/.
//
// Usage:
//   node screenshot.mjs <url> <name> [--section]
//
// Examples:
//   node screenshot.mjs http://localhost:3000 home_pass1_hero --section
//   node screenshot.mjs http://localhost:3000 home_pass1_full
//
// <name>      Output filename (without extension). Use a clear, sortable
//             convention like: home_pass1_hero, home_pass1_section2, etc.
//             so passes and sections are easy to tell apart.
// --section   Capture only the viewport (above the fold). Default is a
//             full-page screenshot of the entire scrollable page.
//
// Files are saved to ./temporary_screenshots/<name>.png. If a file with
// that name already exists it is suffixed with -2, -3, ... so nothing is
// ever overwritten.
import puppeteer from 'puppeteer';
import { mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = join(ROOT, 'temporary_screenshots');

const url = process.argv[2];
let name = process.argv[3];
const sectionOnly = process.argv.includes('--section');

if (!url || !name) {
  console.error('Usage: node screenshot.mjs <url> <name> [--section]');
  console.error('  e.g. node screenshot.mjs http://localhost:3000 home_pass1_hero --section');
  process.exit(1);
}

name = name.replace(/\.png$/i, '');

async function uniquePath(dir, base) {
  let candidate = join(dir, `${base}.png`);
  let n = 2;
  // Avoid overwriting an existing screenshot.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await access(candidate);
      candidate = join(dir, `${base}-${n}.png`);
      n += 1;
    } catch {
      return candidate;
    }
  }
}

await mkdir(OUT_DIR, { recursive: true });
const outPath = await uniquePath(OUT_DIR, name);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  // Give fonts/lazy content a beat to settle.
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: outPath, fullPage: !sectionOnly });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
