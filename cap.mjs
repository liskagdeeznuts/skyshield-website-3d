import puppeteer from 'puppeteer';
const url = process.argv[2], name = process.argv[3];
const section = process.argv.includes('--section');
const mobile = process.argv.includes('--mobile');

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setRequestInterception(true);
p.on('request', r => {
  if (r.url().includes('maps.google')) r.abort().catch(() => {});
  else r.continue().catch(() => {});
});
await p.setViewport(mobile
  ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { width: 1440, height: 900, deviceScaleFactor: 2 });

try { await p.goto(url, { waitUntil: 'load', timeout: 20000 }); }
catch (e) { console.log('goto:', e.message); }

// Bounded scroll so lazy images fetch. Hard cap on steps; no unbounded waits.
const H = await p.evaluate(() => document.body.scrollHeight);
const steps = Math.min(Math.ceil(H / 600) + 2, 60);
for (let i = 0; i <= steps; i++) {
  await p.evaluate(y => window.scrollTo(0, y), i * 600);
  await new Promise(r => setTimeout(r, 90));
}
await p.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 1500));

const broken = await p.evaluate(() =>
  Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'))
);
const total = await p.evaluate(() => document.images.length);
console.log(broken.length ? 'BROKEN: ' + JSON.stringify(broken) : `all ${total} images OK`);

await p.screenshot({ path: `temporary_screenshots/${name}.png`, fullPage: !section });
console.log('SAVED', name);
await b.close();
process.exit(0);
