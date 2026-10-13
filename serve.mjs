// Minimal static dev server for the SkyShield website.
// Serves the project root at http://localhost:3000.
// Usage: node serve.mjs   (optionally PORT=4000 node serve.mjs)
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
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

    const data = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error\n' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT} (root: ${ROOT})`);
});
