import { mkdir, copyFile, readFile, rm, writeFile } from 'node:fs/promises';
import { renderPage } from '../src/page.js';

const homepage = renderPage(await readFile('index.html', 'utf8'));
await rm('dist', { recursive: true, force: true });
await Promise.all([
  mkdir('dist/src', { recursive: true }),
  mkdir('dist/public', { recursive: true }),
]);
await Promise.all([
  writeFile('dist/index.html', homepage),
  copyFile('src/style.css', 'dist/src/style.css'),
  copyFile('public/favicon.svg', 'dist/public/favicon.svg'),
  copyFile('public/resume.pdf', 'dist/public/resume.pdf'),
]);
console.log('Built static website in dist/');
