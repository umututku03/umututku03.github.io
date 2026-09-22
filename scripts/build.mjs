import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await Promise.all([
  copyFile('index.html', 'dist/index.html'),
  cp('src', 'dist/src', { recursive: true }),
  cp('public', 'dist/public', { recursive: true }),
]);
console.log('Built static website in dist/');
