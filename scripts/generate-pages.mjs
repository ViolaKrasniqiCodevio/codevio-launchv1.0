// Postbuild static-shell generator.
//
// Reads the built dist/index.html and writes one HTML shell per indexable route
// (dist/<path>.html) plus dist/404.html, with the correct title, description,
// canonical and OG/Twitter tags baked into the raw HTML. Everything else in the
// document (scripts, modulepreloads, JSON-LD) is preserved byte-for-byte.
//
// Zero dependencies. Idempotent: always reads a fresh dist/index.html.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTE_META } from '../src/data/seo.js';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://codevio.net').replace(/\/+$/, '');

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error(`generate-pages: ${indexPath} not found — run "vite build" first.`);
  process.exit(1);
}

const indexHtml = readFileSync(indexPath, 'utf8');

const escapeAttr = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const TAG = {
  title: /<title>[\s\S]*?<\/title>/,
  description: /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
  canonical: /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
  ogTitle: /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
  ogDescription: /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
  ogUrl: /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
  twitterTitle: /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
  twitterDescription: /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
};

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) {
    throw new Error(`generate-pages: expected tag not found in index.html: ${pattern}`);
  }
  return html.replace(pattern, () => replacement);
};

const buildShell = (path, meta) => {
  const canonical = `${SITE_URL}${path}`;
  const title = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);

  let html = indexHtml;
  html = replaceTag(html, TAG.title, `<title>${title}</title>`);
  html = replaceTag(html, TAG.description, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, TAG.canonical, `<link rel="canonical" href="${escapeAttr(canonical)}" />`);
  html = replaceTag(html, TAG.ogTitle, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, TAG.ogDescription, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, TAG.ogUrl, `<meta property="og:url" content="${escapeAttr(canonical)}" />`);
  html = replaceTag(html, TAG.twitterTitle, `<meta name="twitter:title" content="${title}" />`);
  html = replaceTag(html, TAG.twitterDescription, `<meta name="twitter:description" content="${description}" />`);
  return html;
};

const injectBeforeHeadEnd = (html, snippet) => {
  const marker = '</head>';
  const index = html.indexOf(marker);
  if (index === -1) throw new Error('generate-pages: </head> not found in index.html');
  return html.slice(0, index) + snippet + html.slice(index);
};

// '/' is served as index.html; every other route is <path>.html.
const outFileFor = (path) =>
  path === '/' ? join(distDir, 'index.html') : join(distDir, `${path.replace(/^\//, '')}.html`);

const writeShell = (path, html) => {
  const file = outFileFor(path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`generate-pages: wrote ${file}`);
};

// '/' is regenerated through the same path as every other shell instead of
// being trusted as-is: index.html used to ship a shorter og:description than
// its own meta description, so a non-JS unfurler and a JS crawler disagreed
// about the one page that gets shared most.
for (const [path, meta] of Object.entries(ROUTE_META)) {
  if (path === '/404') continue;
  writeShell(path, buildShell(path, meta));
}

// 404 shell: correct title/description, no canonical, noindex.
// og:url points at the site root — never at the invalid /404 URL.
let html404 = buildShell('/404', ROUTE_META['/404']);
html404 = replaceTag(html404, TAG.ogUrl, `<meta property="og:url" content="${escapeAttr(`${SITE_URL}/`)}" />`);
html404 = html404.replace(/[ \t]*<link\s+rel="canonical"[^>]*>\r?\n?/, '');
html404 = injectBeforeHeadEnd(html404, '    <meta name="robots" content="noindex" />\n');
writeShell('/404', html404);
