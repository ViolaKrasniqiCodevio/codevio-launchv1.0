// Static-contract tests for Codevio.
//
// These are the checks that would have caught every metadata / deployment-config
// bug found in the QA audit, and they need no test framework: `node --test` is
// built into Node 22+ and this repo adds no dependency for them.
//
// Run after a build:  npm run build && npm test
// Source-only checks also pass without dist/ (the artifact block reports a single
// clear failure telling you to build).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTE_META } from '../src/data/seo.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const read = (relative) => readFileSync(join(rootDir, relative), 'utf8');
const readDist = (relative) => readFileSync(join(distDir, relative), 'utf8');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://codevio.net').replace(/\/+$/, '');

// '/' and '/404' have no shell of their own: '/' is index.html, '/404' is 404.html.
const INDEXABLE = Object.keys(ROUTE_META).filter((p) => p !== '/' && p !== '/404');
const ALL_ROUTE_PATHS = Object.keys(ROUTE_META).filter((p) => p !== '/404');

const escapeAttr = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const shellFor = (routePath) => `${routePath.replace(/^\//, '')}.html`;

const one = (html, pattern, label) => {
  const matches = html.match(pattern);
  assert.ok(matches, `${label}: pattern not found in shell (${pattern})`);
  assert.equal(matches.length, 1, `${label}: expected exactly one match, found ${matches.length}`);
  return matches[0];
};

const withDist = (body) => (t) => {
  if (!existsSync(join(distDir, 'index.html'))) {
    assert.fail('dist/index.html is missing — run `npm run build` before `npm test`');
  }
  return body(t);
};

// ---------------------------------------------------------------------------
// Source-level contracts (no build required)
// ---------------------------------------------------------------------------

test('route table and ROUTE_META agree', () => {
  const app = read('src/App.jsx');
  const declared = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);

  assert.ok(declared.includes('*'), 'App.jsx must keep a catch-all route so unknown URLs render NotFound');

  for (const path of Object.keys(ROUTE_META)) {
    if (path === '/404') continue;
    assert.ok(declared.includes(path), `src/data/seo.js defines ${path} but src/App.jsx has no <Route> for it`);
  }
  for (const path of declared) {
    if (path === '*' || path.includes(':')) continue;
    assert.ok(path in ROUTE_META, `src/App.jsx routes ${path} but src/data/seo.js has no metadata for it`);
  }
});

test('every nav item points at a declared route', () => {
  const site = read('src/data/site.js');
  const navBlock = site.match(/export const NAV_ITEMS = \[([\s\S]*?)\];/);
  assert.ok(navBlock, 'NAV_ITEMS not found in src/data/site.js');

  const links = [...navBlock[1].matchAll(/link:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(links.length >= 4, `expected at least 4 nav items, found ${links.length}`);

  for (const link of links) {
    assert.ok(link in ROUTE_META, `NAV_ITEMS points at ${link}, which has no entry in ROUTE_META`);
  }
});

test('the two-font system: Bebas Neue secondary copy, Dela Gothic headings', () => {
  // The site deliberately uses two faces: Dela Gothic One (primary: h1/h2 and
  // the wordmark) and Bebas Neue (secondary: the inherited face, so body copy,
  // list items and form fields render as capitals). Bebas Neue is unicase —
  // `a` and `A` share the same outline and advance on the shipped woff2 — and
  // that all-caps look is intended; neither variable may drift to the other face.
  const css = read('src/index.css');
  assert.match(css, /--sans:\s*'Bebas Neue'/, "index.css must point --sans at Bebas Neue, the secondary face");
  assert.match(css, /--heading:\s*'Dela Gothic One'/, 'index.css must point --heading at the Dela Gothic One brand face');
  assert.match(css, /font:\s*18px\/145%\s*var\(--sans\)/, ':root must inherit its font from --sans');
  assert.match(css, /font-family:\s*var\(--heading\)/, 'h1/h2 must resolve through --heading, not the secondary face');
});

test('display-face labels still name the display face', () => {
  // A spaced-uppercase label is the site's signature display-face style. The
  // inherited font is Bebas Neue too, but every label still names the face
  // explicitly so the convention survives any future change of --sans.
  const dir = join(rootDir, 'src');
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((entry) => {
      const full = join(d, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.jsx$/.test(entry.name) ? [full] : [];
    });

  const offenders = [];
  let labelsSeen = 0;

  // String literal, single-quoted, template literal, or a `{…}` expression body —
  // so a className built by cx()/a ternary is scanned too.
  const CLASS_NAME = /className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{([^}]*)\})/g;

  for (const file of walk(dir)) {
    const src = readFileSync(file, 'utf8');
    for (const match of src.matchAll(CLASS_NAME)) {
      const className = [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (!/\buppercase\b/.test(className)) continue;
      if (!/tracking-\[[\d.]+em\]/.test(className)) continue;
      labelsSeen += 1;
      if (/font-\[/.test(className)) continue;
      offenders.push(`${file.replace(rootDir, '')}: ${className}`);
    }
  }

  // Guard against the check passing because the pattern stopped matching anything.
  assert.ok(labelsSeen >= 8, `expected at least 8 spaced-uppercase labels, found ${labelsSeen}`);
  assert.deepEqual(offenders, [], 'spaced-uppercase labels must name the display face:\n' + offenders.join('\n'));
});

test('every route renders the #main focus target', () => {
  // Route-change focus management depends on #main existing, and on it not painting
  // a viewport-sized outline when it is focused programmatically.
  const pagesDir = join(rootDir, 'src/pages');
  const offenders = [];
  for (const page of readdirSync(pagesDir).filter((name) => name.endsWith('.jsx'))) {
    const src = readFileSync(join(pagesDir, page), 'utf8');
    const usesShell = /from '\.\.\/components\/PageShell'/.test(src);
    const ownMain = /<main\s+id="main"/.test(src);
    if (!usesShell && !ownMain) offenders.push(`src/pages/${page}`);
  }
  assert.deepEqual(
    offenders,
    [],
    'these pages render no #main, so route-change focus has nowhere to land:\n' + offenders.join('\n')
  );
  assert.match(
    read('src/index.css'),
    /#main:focus-visible\s*\{[^}]*outline:\s*none/,
    'the #main focus target must not paint a viewport-sized outline when focused'
  );
});

test('accessibility references and image alternatives stay intact', () => {
  // Broken htmlFor/aria-* targets and missing alt text are real a11y defects that are
  // detectable without a browser. Template-literal ids and refs do exist in the contact
  // form (`contact-${field.name}`) and are deliberately out of scope: the literal half is
  // the half that rots silently when someone renames an id.
  const dir = join(rootDir, 'src');
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((entry) => {
      const full = join(d, entry.name);
      if (entry.isDirectory()) return walk(full);
      return /\.jsx$/.test(entry.name) ? [full] : [];
    });

  // Ids that legitimately live outside src/: the mount node and the prerender block.
  const EXTERNAL_IDS = new Set(['root', 'codevio-static']);

  const ids = new Map();
  const refs = [];
  const withoutAlt = [];
  let imagesSeen = 0;

  for (const file of walk(dir)) {
    const src = readFileSync(file, 'utf8');
    const here = file.replace(rootDir, '');
    const lineOf = (index) => src.slice(0, index).split('\n').length;

    for (const match of src.matchAll(/\bid=(?:"([^"]*)"|'([^']*)')/g)) {
      const id = match[1] ?? match[2];
      if (!ids.has(id)) ids.set(id, []);
      ids.get(id).push(`${here}:${lineOf(match.index)}`);
    }

    for (const match of src.matchAll(
      /\b(htmlFor|aria-describedby|aria-controls|aria-labelledby|aria-owns|aria-activedescendant)=(?:"([^"]*)"|'([^']*)')/g
    )) {
      const target = match[2] ?? match[3];
      // aria-describedby may list several ids.
      for (const one of target.split(/\s+/).filter(Boolean)) {
        refs.push({ attr: match[1], target: one, where: `${here}:${lineOf(match.index)}` });
      }
    }

    for (const match of src.matchAll(/<img\b((?:"[^"]*"|'[^']*'|\{[^{}]*\}|[^<>"'{])*?)\/?>/g)) {
      imagesSeen += 1;
      if (!/\balt=/.test(match[1])) withoutAlt.push(`${here}:${lineOf(match.index)}`);
    }
  }

  const broken = refs
    .filter((ref) => !ids.has(ref.target) && !EXTERNAL_IDS.has(ref.target))
    .map((ref) => `${ref.where}  ${ref.attr} -> "${ref.target}"`);
  assert.deepEqual(broken, [], 'these ARIA/label references point at ids that do not exist:\n' + broken.join('\n'));

  assert.deepEqual(
    withoutAlt,
    [],
    'every <img> needs an alt attribute (alt="" is correct for a decorative image):\n' + withoutAlt.join('\n')
  );

  // Guards against the checks above passing because the patterns stopped matching.
  assert.ok(refs.length >= 3, `expected at least 3 literal label/ARIA references, found ${refs.length}`);
  assert.ok(ids.size >= 5, `expected at least 5 literal ids, found ${ids.size}`);
  assert.ok(imagesSeen >= 4, `expected at least 4 <img> elements, found ${imagesSeen}`);

  // #main is deliberately declared once in each route owner and never twice in one render.
  // Any other id appearing in more than one file is a copy-paste collision waiting to happen.
  const sharedAcrossFiles = [...ids.entries()]
    .filter(([, where]) => new Set(where.map((entry) => entry.split(':')[0])).size > 1)
    .map(([id]) => id);
  assert.deepEqual(
    sharedAcrossFiles,
    ['main'],
    `only #main may be declared in more than one file; found: ${sharedAcrossFiles.join(', ') || '(none)'}`
  );
});

test('the structured data and the shared site constants agree', withDist(() => {
  // site.js is the single source for the contact details and social profiles; index.html
  // hardcodes them a second time inside the Organization JSON-LD. Nothing else connects the
  // two, so changing an email in one place silently leaves search engines with the old one.
  const site = read('src/data/site.js');

  const email = site.match(/\bemail:\s*'([^']+)'/)[1];
  const socialBlock = site.match(/export const SOCIAL_ITEMS = \[([\s\S]*?)\];/)[1];
  const socials = [...socialBlock.matchAll(/link:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(socials.length >= 3, `expected at least 3 social profiles, found ${socials.length}`);

  const ld = [...readDist('index.html').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    ([, body]) => JSON.parse(body)
  );
  const org = ld.find((block) => block['@type'] === 'Organization');
  assert.ok(org, 'index.html must keep the Organization block');

  assert.equal(org.email, email, 'Organization.email must match SITE.email in src/data/site.js');
  assert.equal(org.telephone, undefined, 'the site does not publish a phone number, so Organization.telephone must stay absent');
  assert.deepEqual(
    [...(org.sameAs || [])].sort(),
    [...socials].sort(),
    'Organization.sameAs must list exactly the SOCIAL_ITEMS profiles'
  );
  assert.equal(org.url, `${SITE_URL}/`, 'Organization.url must be the canonical origin');
}));

test('sitemap lists every indexable route exactly once and no dead URLs', () => {
  const sitemap = read('public/sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const expected = ['/', ...INDEXABLE].map((p) => `${SITE_URL}${p}`);
  assert.deepEqual(
    [...locs].sort(),
    [...expected].sort(),
    'sitemap <loc> set does not match the routes declared in src/data/seo.js'
  );
  assert.equal(new Set(locs).size, locs.length, 'sitemap contains duplicate <loc> entries');
});

test('sitemap lastmod dates are not in the future', () => {
  const sitemap = read('public/sitemap.xml');
  const today = new Date().toISOString().slice(0, 10);
  for (const [, date] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    assert.ok(date <= today, `sitemap lastmod ${date} is in the future (today is ${today})`);
  }
});

test('robots.txt points at an absolute sitemap and allows crawling', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /^User-agent:\s*\*/m, 'robots.txt must define a wildcard user-agent group');
  assert.match(robots, /^Allow:\s*\/\s*$/m, 'robots.txt must allow crawling the site');
  assert.match(
    robots,
    new RegExp(`^Sitemap:\\s*${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/sitemap\\.xml\\s*$`, 'm'),
    'robots.txt must advertise an absolute sitemap URL on the canonical origin'
  );
});

test('_headers keeps the security headers this app needs and needs nothing more', () => {
  const headers = read('public/_headers');
  for (const name of [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Strict-Transport-Security',
    'Permissions-Policy',
  ]) {
    assert.match(headers, new RegExp(`^\\s*${name}:`, 'm'), `public/_headers is missing ${name}`);
  }

  const csp = headers.match(/Content-Security-Policy:\s*(.+)/)[1];
  assert.match(csp, /frame-ancestors 'none'/, "CSP must keep frame-ancestors 'none'");
  assert.match(csp, /object-src 'none'/, "CSP must keep object-src 'none'");
  assert.match(csp, /base-uri 'self'/, "CSP must keep base-uri 'self'");
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/, "script-src must not allow 'unsafe-inline'");
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-eval'/, "script-src must not allow 'unsafe-eval'");
  assert.match(csp, /connect-src[^;]*https:\/\/formspree\.io/, 'connect-src must allow the Formspree endpoint');
  assert.match(csp, /form-action[^;]*https:\/\/formspree\.io/, 'form-action must allow the Formspree endpoint');

  // Vite fingerprints /assets/*, so those URLs are immutable; without this rule
  // every repeat visit revalidates the whole bundle.
  //
  // Parse the file into blocks instead of slicing on the string: a Cache-Control
  // appended *after* the /assets/* block (which is last in the file) would slip
  // past a before-the-block check — and that is exactly the "a year of immutable
  // HTML" failure this guards against.
  const blocks = [];
  let current = null;
  for (const rawLine of headers.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (!/^\s/.test(rawLine)) {
      current = { pattern: line, lines: [] };
      blocks.push(current);
      continue;
    }
    current?.lines.push(line);
  }

  const assetsBlock = blocks.find((block) => block.pattern === '/assets/*');
  assert.ok(assetsBlock, 'public/_headers must declare an /assets/* block');
  assert.ok(
    assetsBlock.lines.includes('Cache-Control: public, max-age=31536000, immutable'),
    'the /assets/* block must cache the fingerprinted URLs immutably'
  );

  for (const block of blocks) {
    if (block.pattern === '/assets/*') continue;
    assert.ok(
      !block.lines.some((line) => /^Cache-Control:/i.test(line)),
      `immutable caching must not be applied outside /assets/* (found in the "${block.pattern}" block)`
    );
  }
});

test('_redirects makes every declared route reachable and 404s the rest', () => {
  const redirects = read('public/_redirects');
  const rules = redirects
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/));

  // '/' needs no rule: Netlify serves the directory index (index.html) for the
  // root path from the deploy directory, and a rule there would shadow it.
  for (const path of ALL_ROUTE_PATHS.filter((p) => p !== '/')) {
    const target = shellFor(path);
    for (const variant of [path, `${path}/`]) {
      const rule = rules.find((r) => r[0] === variant);
      assert.ok(rule, `public/_redirects has no rule for ${variant}`);
      assert.equal(rule[1], `/${target}`, `${variant} should rewrite to /${target}, found ${rule[1]}`);
      assert.equal(rule[2], '200', `${variant} must be a 200 rewrite, found ${rule[2] || '(none)'}`);
    }
  }

  const last = rules[rules.length - 1];
  assert.deepEqual(last, ['/*', '/404.html', '404'], 'the final rule must serve /404.html with a real 404 status');
  assert.equal(
    rules.filter((r) => r[0] === '/*').length,
    1,
    'the catch-all must appear exactly once, and last, or it shadows the route rewrites'
  );
});

// ---------------------------------------------------------------------------
// Built-artifact contracts (require `npm run build`)
// ---------------------------------------------------------------------------

test('every indexable route has a generated HTML shell', withDist(() => {
  for (const path of INDEXABLE) {
    const file = join(distDir, shellFor(path));
    assert.ok(existsSync(file), `missing shell for ${path} (expected dist/${shellFor(path)})`);
    assert.ok(statSync(file).size > 0, `dist/${shellFor(path)} is empty`);
  }
  assert.ok(existsSync(join(distDir, '404.html')), 'missing dist/404.html');
}));

test('each shell bakes the exact title, description and canonical for its route', withDist(() => {
  const cases = INDEXABLE.map((path) => [path, ROUTE_META[path]]);

  for (const [path, meta] of cases) {
    const html = readDist(shellFor(path));
    const label = `dist/${shellFor(path)}`;

    assert.equal(
      one(html, /<title>[\s\S]*?<\/title>/g, `${label} title`),
      `<title>${escapeAttr(meta.title)}</title>`,
      `${label} title does not match ROUTE_META`
    );

    assert.equal(
      one(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/g, `${label} description`),
      `<meta name="description" content="${escapeAttr(meta.description)}" />`,
      `${label} description does not match the metadata source of truth`
    );

    assert.equal(
      one(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g, `${label} canonical`),
      `<link rel="canonical" href="${SITE_URL}${path}" />`,
      `${label} canonical must be the absolute, trailing-slash-free URL for ${path}`
    );

    const ogUrl = one(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/g, `${label} og:url`);
    assert.equal(ogUrl, `<meta property="og:url" content="${SITE_URL}${path}" />`, `${label} og:url is wrong`);
  }
}));

test('the root shell carries the site-wide canonical and social tags', withDist(() => {
  const html = readDist('index.html');
  assert.equal(one(html, /<title>[\s\S]*?<\/title>/g, 'index title'), `<title>${escapeAttr(ROUTE_META['/'].title)}</title>`);
  assert.equal(
    one(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g, 'index canonical'),
    `<link rel="canonical" href="${SITE_URL}/" />`
  );
  for (const tag of ['og:image', 'og:image:alt', 'og:site_name', 'twitter:card', 'theme-color']) {
    assert.ok(
      html.includes(`"${tag}"`) || html.includes(`name="${tag}"`) || html.includes(`property="${tag}"`),
      `dist/index.html is missing ${tag}`
    );
  }

  // '/' goes through the same generator as every other shell, so the tags a
  // non-JS unfurler reads cannot drift from what useDocumentTitle sets at runtime.
  const metaDescription = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)[1];
  const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/)[1];
  const twitterDescription = html.match(/<meta\s+name="twitter:description"\s+content="([^"]*)"/)[1];
  assert.equal(ogDescription, metaDescription, 'dist/index.html og:description must match its meta description');
  assert.equal(
    twitterDescription,
    metaDescription,
    'dist/index.html twitter:description must match its meta description'
  );
}));

test('the 404 shell is noindex and carries no canonical', withDist(() => {
  const html = readDist('404.html');
  assert.equal(
    one(html, /<meta[^>]*name="robots"[^>]*>/g, '404 robots'),
    '<meta name="robots" content="noindex" />'
  );
  assert.equal(
    (html.match(/<link\s+rel="canonical"/g) || []).length,
    0,
    'dist/404.html must not point a canonical at an invalid URL'
  );
}));

test('inline JSON-LD parses and describes only real, published facts', withDist(() => {
  const html = readDist('index.html');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(blocks.length >= 2, `expected at least 2 JSON-LD blocks, found ${blocks.length}`);

  const parsed = blocks.map(([, body]) => JSON.parse(body));
  const types = parsed.map((block) => block['@type']);
  assert.ok(types.includes('Organization'), 'index.html must keep Organization structured data');
  assert.ok(types.includes('WebSite'), 'index.html must keep WebSite structured data');

  const org = parsed.find((block) => block['@type'] === 'Organization');
  assert.equal(org.url, `${SITE_URL}/`, 'Organization.url must be the canonical origin');
  for (const key of ['name', 'logo', 'description']) {
    assert.ok(org[key], `Organization.${key} must be present`);
  }
  assert.doesNotMatch(
    JSON.stringify(parsed),
    /aggregateRating|reviewCount|"review"|priceRange/,
    'structured data must not claim ratings, reviews or pricing that the site does not publish'
  );
}));

test('the built CSS ships the two brand faces', withDist(() => {
  const assetsDir = join(distDir, 'assets');
  const cssFile = readdirSync(assetsDir).find((name) => /^index-.*\.css$/.test(name));
  assert.ok(cssFile, 'no index-*.css found in dist/assets');
  const css = readFileSync(join(assetsDir, cssFile), 'utf8');
  assert.match(css, /--sans:\s*"Bebas Neue"/, 'built CSS must resolve --sans to the secondary face (Bebas Neue)');
  assert.match(css, /--heading:\s*"Dela Gothic One"/, 'built CSS must resolve --heading to the brand face (Dela Gothic One)');
}));

test('deployment files are copied into dist', withDist(() => {
  for (const file of ['_headers', '_redirects', 'robots.txt', 'sitemap.xml']) {
    assert.ok(existsSync(join(distDir, file)), `dist/${file} is missing — public/ is not being copied`);
  }
  assert.equal(readDist('_headers'), read('public/_headers'), 'dist/_headers drifted from public/_headers');
  assert.equal(readDist('_redirects'), read('public/_redirects'), 'dist/_redirects drifted from public/_redirects');
}));
