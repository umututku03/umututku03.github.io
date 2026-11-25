import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderPage } from '../src/page.js';

const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 5173);
const root = process.cwd();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.md': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.json': 'application/json', '.txt': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.split('/').some(part => part.startsWith('.') && part !== '.')) throw new Error('Not found');
    const isHomepage = pathname === '/' || pathname === '/index.html';
    const file = path.resolve(root, '.' + (isHomepage ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) throw new Error('Not found');
    const content = isHomepage ? renderPage(await readFile(file, 'utf8')) : await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Website running at http://localhost:${port}`));
