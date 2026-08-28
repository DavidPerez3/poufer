import { access, readFile } from 'node:fs/promises';

const base = '/poufer/';
const requiredFiles = [
  'dist/index.html',
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'dist/icons/icon-192.png',
  'dist/icons/icon-512.png',
  'dist/icons/maskable-512.png',
  'dist/icons/apple-touch-icon.png',
];

await Promise.all(requiredFiles.map((file) => access(file)));

const html = await readFile('dist/index.html', 'utf8');
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));

if (!html.includes('src="/poufer/_expo/')) {
  throw new Error('El bundle web no utiliza el base path /poufer/.');
}

if (!html.includes('href="/poufer/manifest.webmanifest"')) {
  throw new Error('El manifest no está enlazado bajo /poufer/.');
}

if (manifest.start_url !== base || manifest.scope !== base || manifest.display !== 'standalone') {
  throw new Error('La configuración instalable del manifest no es válida para GitHub Pages.');
}

if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) {
  throw new Error('Faltan iconos PWA raster y maskable.');
}

console.log('Export web verificado para /poufer/ y PWA standalone.');
