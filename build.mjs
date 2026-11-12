// Builds the deployable site into dist/.
//
// Ships ONLY the public pages, the root SEO files, and the assets those pages actually
// reference. Internal notes (*.md), source art in the repo root, drafts/, unused images,
// old roof frames and dev scripts never reach the public site.
//
// Netlify runs this on every deploy (see netlify.toml). Locally:
//   node build.mjs            then   ROOT=dist PORT=4000 node serve.mjs
//
// The build FAILS if a page references a file that does not exist, so a broken image or
// video path can never go live.
import { rm, mkdir, cp, readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');

const PAGES = ['index.html', 'insurance.html', 'shingles.html', 'privacy.html', '404.html'];
const ROOT_FILES = ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest', 'favicon.ico', 'apple-touch-icon.png'];
// roof-system.js builds frame URLs by number, so the whole frame folder ships.
const WHOLE_DIRS = ['assets/roof-system'];

const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };
const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };
const refsIn = (text) => {
  const out = new Set();
  for (const m of text.matchAll(/(?:^|["'(\s,=])\/?((?:assets)\/[A-Za-z0-9_\-./]+)/g)) out.add(m[1].replace(/[.,]+$/, ''));
  return out;
};
const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}

const errors = [], warnings = [];
const ship = new Set();

// 1. Pages + root files must exist.
for (const f of [...PAGES, ...ROOT_FILES]) {
  if (!(await exists(join(ROOT, f)))) errors.push(`missing ${f}`); else ship.add(f);
}

// 2. Collect asset references from pages (comments ignored), then from the CSS/JS they load.
const queue = [];
for (const page of PAGES) {
  if (!(await exists(join(ROOT, page)))) continue;
  const html = stripHtmlComments(await readFile(join(ROOT, page), 'utf8'));
  for (const r of refsIn(html)) queue.push({ ref: r, from: page, strict: true });
}
const manifest = await readFile(join(ROOT, 'site.webmanifest'), 'utf8').catch(() => '');
for (const r of refsIn(manifest)) queue.push({ ref: r, from: 'site.webmanifest', strict: true });

const seen = new Set();
while (queue.length) {
  const { ref, from, strict } = queue.shift();
  if (seen.has(ref)) continue;
  seen.add(ref);
  if (WHOLE_DIRS.some((d) => ref.startsWith(d))) continue;
  if (!extname(ref)) continue;                       // a folder prefix like "assets/video/", not a file
  const abs = join(ROOT, ref);
  if (!(await isFile(abs))) { (strict ? errors : warnings).push(`${from} references missing ${ref}`); continue; }
  ship.add(ref);
  if (/\.(css|js)$/.test(ref)) {                     // follow references inside CSS/JS too
    for (const r of refsIn(await readFile(abs, 'utf8'))) queue.push({ ref: r, from: ref, strict: false });
  }
}

if (errors.length) {
  console.error('BUILD FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}

// 3. Write dist/.
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const f of ship) {
  await mkdir(dirname(join(OUT, f)), { recursive: true });
  await cp(join(ROOT, f), join(OUT, f));
}
for (const d of WHOLE_DIRS) await cp(join(ROOT, d), join(OUT, d), { recursive: true });

// 4. Report.
const shipped = await walk(OUT);
let bytes = 0;
for (const f of shipped) bytes += (await stat(f)).size;
const allAssets = await walk(join(ROOT, 'assets'));
const left = allAssets.filter((f) => !shipped.includes(join(OUT, f.slice(ROOT.length + 1))));
console.log(`Built dist/: ${shipped.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`Left out ${left.length} unused files from assets/ (old frames, source images, unused scripts).`);
if (warnings.length) console.log('Warnings (comments or code mention files that do not exist):\n  ' + warnings.join('\n  '));
