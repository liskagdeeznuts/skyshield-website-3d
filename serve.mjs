// Minimal static dev server for the SkyShield website.
// Serves the project root at http://localhost:3000.
// Usage: node serve.mjs   (optionally PORT=4000 node serve.mjs)
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
    // Prevent path traversal
    let rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(ROOT, rel);

    let info;
    try {
      info = await stat(filePath);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    if (info.isDirectory()) {
      const indexPath = join(filePath, 'index.html');
      try {
        await stat(indexPath);
        filePath = indexPath;
      } catch {
        // No index.html — render a simple directory listing so the
        // screenshot pipeline still has something to render.
        const entries = await readdir(filePath, { withFileTypes: true });
        const items = entries
          .map((e) => `<li>${e.name}${e.isDirectory() ? '/' : ''}</li>`)
          .join('');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          `<!doctype html><meta charset="utf-8"><title>Index of ${rel || '/'}</title>` +
            `<body style="font-family:system-ui;padding:2rem"><h1>Index of /${rel}</h1><ul>${items}</ul>` +
            `<p style="color:#888">No index.html yet — server is running and ready for screenshots.</p></body>`
        );
        return;
      }
    }

    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    // Byte-range support so <video> can seek (Safari refuses to play without it).
    const range = req.headers.range;
    if (range && info.isFile()) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (m) {
        const size = info.size;
        let start = m[1] ? Number(m[1]) : 0;
        let end = m[2] ? Number(m[2]) : size - 1;
        if (!m[1] && m[2]) { start = Math.max(0, size - Number(m[2])); end = size - 1; }
        if (start >= size || end >= size || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` });
          res.end();
          return;
        }
        res.writeHead(206, {
          'Content-Type': type,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
        });
        createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': data.length });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error\n' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT} (root: ${ROOT})`);
});
