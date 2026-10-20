import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root } from './build.mjs';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

export function createPreviewServer({ directory = root, basePath = '' } = {}) {
  return createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
      let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (basePath) {
        if (!path.startsWith(basePath)) { response.writeHead(404); response.end('Not found'); return; }
        path = path.slice(basePath.length);
      }
      path = path.replace(/^\/+/, '') || 'index.html';
      // A local preview exposes the public site, never .git, dependencies, or source.
      if (!['index.html', 'about.html', 'math-atlas-github-pages/index.html'].includes(path) && !path.startsWith('assets/')) { response.writeHead(404); response.end('Not found'); return; }
      const target = resolve(directory, path);
      if (!target.startsWith(resolve(directory) + sep)) { response.writeHead(403); response.end(); return; }
      const body = await readFile(target);
      response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 400); response.end('Not found');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080), host = process.env.HOST || '127.0.0.1';
  const server = createPreviewServer();
  server.listen(port, host, () => console.log(`Math Atlas: http://${host}:${port}/`));
}
