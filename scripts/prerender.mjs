// Postbuild DOM snapshot pass.
//
// Boots each static shell in headless Chrome with prefers-reduced-motion
// emulated, then writes the app's own rendered HTML into that shell's
// <noscript id="codevio-static"> block. Raw HTML then carries real content and
// crawlable links for non-JS crawlers and no-JS users, with no runtime cost:
// browsers with scripting enabled never render <noscript>.
//
// #root is deliberately left empty. Snapshotting into it was measured to
// re-arm LCP (3222 -> 3550 ms home, 3135 -> 3326 ms services) and add CLS
// (0 -> 0.022 / 0.041): createRoot() replaces the container, the browser
// discards the replaced element's LCP paint, and teardown re-paints.
//
// Two no-JS-only fixes ride inside the block:
// - the capture walks the page down and back up first, because whileInView
//   reveals (src/lib/motion.js) keep opacity:1 once seen (viewport.once) and
//   would otherwise be frozen at opacity:0 for every below-fold section;
// - a `<style>#root{min-height:0!important}</style>` shim, since the empty
//   #root would otherwise hold its 100svh and push the static copy a full
//   viewport down. CSS inside <noscript> only applies with scripting off.
//
// Fail-soft: a missing/broken Chrome warns and exits 0 so a deploy on a machine
// without a browser is never blocked. Everything else that would leave output
// wrong (missing shell, missing <noscript> marker, empty snapshot, route
// failure) warns, keeps going with the remaining routes, and exits 1 so a broken
// prerender cannot ship silently.

import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTE_META } from '../src/data/seo.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const indexPath = join(distDir, 'index.html');
const SETTLE_MS = 1200;
const LAUNCH_TIMEOUT_MS = 20000;
const NAV_TIMEOUT_MS = 30000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const warn = (message) => console.warn(`prerender: WARNING ${message}`);

// Mirrors scripts/generate-pages.mjs outFileFor, with "/" -> index.html.
const routes = [
  { path: '/', file: 'index.html' },
  ...Object.keys(ROUTE_META)
    .filter((path) => path !== '/')
    .map((path) => ({ path, file: `${path.replace(/^\//, '')}.html` })),
];

if (!existsSync(indexPath)) {
  console.error(`prerender: ${indexPath} not found - run "vite build" first.`);
  process.exit(1);
}

const missing = routes.filter((route) => !existsSync(join(distDir, route.file)));
if (missing.length) {
  console.error(
    `prerender: shell(s) missing: ${missing.map((r) => r.file).join(', ')}` +
      ' - run "node scripts/generate-pages.mjs" first.'
  );
  process.exit(1);
}

const findChrome = () => {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  return [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find(existsSync);
};

const chromePath = findChrome();
if (!chromePath || !existsSync(chromePath)) {
  warn(
    `headless Chrome/Edge not found (CHROME_PATH=${process.env.CHROME_PATH || 'unset'}).` +
      ' Skipping prerender; the shells stay meta-only.'
  );
  process.exit(0);
}

const MIME = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

const isFile = (candidate) => {
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
};

const startStaticServer = () =>
  new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const relative = urlPath.replace(/^\/+/, '');
      let file = relative ? join(distDir, relative) : indexPath;

      // Extensionless route -> "<path>.html"; anything unknown -> index.html so
      // the SPA still boots (BrowserRouter reads the path off the URL).
      if (!file.startsWith(distDir) || !isFile(file)) file = `${file}.html`;
      if (!file.startsWith(distDir) || !isFile(file)) file = indexPath;

      try {
        const body = readFileSync(file);
        const ext = file.slice(file.lastIndexOf('.'));
        res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404).end('not found');
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

// Minimal CDP client over the global WebSocket (Node 22+).
const openCdp = (wsUrl) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    const waiters = new Map();
    let nextId = 0;

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== undefined) {
        const entry = pending.get(message.id);
        pending.delete(message.id);
        if (!entry) return;
        if (message.error) entry.reject(new Error(message.error.message));
        else entry.resolve(message.result);
      } else if (message.method) {
        const waiter = waiters.get(message.method);
        waiters.delete(message.method);
        waiter?.(message.params);
      }
    });
    socket.addEventListener('error', () => reject(new Error(`CDP socket error: ${wsUrl}`)));
    socket.addEventListener('open', () =>
      resolve({
        send: (method, params = {}) =>
          new Promise((res, rej) => {
            const id = ++nextId;
            pending.set(id, { resolve: res, reject: rej });
            socket.send(JSON.stringify({ id, method, params }));
          }),
        once: (method) => new Promise((res) => waiters.set(method, res)),
        close: () => socket.close(),
      })
    );
  });

// Chrome spawns helper processes that hold the profile dir open; on Windows a
// plain child.kill() leaves them behind and leftover temp profiles accumulate.
const killChrome = (child) =>
  new Promise((resolve) => {
    if (process.platform !== 'win32') {
      child.once('exit', resolve);
      child.kill();
      return;
    }
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    killer.once('exit', resolve);
    killer.once('error', resolve);
  });

const launchChrome = async () => {
  // Prefer the sanctioned scratch dir when it exists, else the OS temp dir.
  const scratch = join(tmpdir(), 'opencode');
  const profileDir = mkdtempSync(join(existsSync(scratch) ? scratch : tmpdir(), 'codevio-prerender-'));
  const child = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  let stderr = '';
  let wsUrl = null;
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
    wsUrl ??= stderr.match(/DevTools listening on (ws:\/\/\S+)/)?.[1] ?? null;
  });

  const deadline = Date.now() + LAUNCH_TIMEOUT_MS;
  let port = wsUrl ? new URL(wsUrl).port : null;
  while (!port && Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Chrome exited early (${child.exitCode})`);
    try {
      const [activePort] = readFileSync(join(profileDir, 'DevToolsActivePort'), 'utf8').split('\n');
      if (activePort) port = activePort.trim();
    } catch {
      /* DevToolsActivePort not written yet */
    }
    if (!port) await sleep(200);
  }
  if (!port) throw new Error('Chrome DevTools endpoint did not appear');

  return { child, profileDir, endpoint: `http://127.0.0.1:${port}` };
};

// The root div still holds the live React DOM; the snapshot goes to <noscript>.
// Walks the page down in ~8 stops (150 ms each) then back to the top so
// viewport.once reveals below the fold are captured in their revealed state.
const SNAPSHOT_EXPR = `document.fonts.ready.then(async () => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const step = Math.max(1, Math.ceil(document.documentElement.scrollHeight / 8));
  for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await wait(150);
  }
  window.scrollTo(0, 0);
  await wait(300);
  document.querySelectorAll('canvas').forEach((el) => el.remove());
  return document.getElementById('root').innerHTML;
})`;

// Inert with scripting on; collapses the empty #root so the static copy starts
// in the first viewport instead of one 100svh below it.
const NOJS_FOLD_SHIM = '<style>#root{min-height:0!important}</style>';

// generate-pages.mjs copies index.html's <noscript> block into every shell, so
// the marker is a constant string; the regex is only a fallback for a shell
// whose block gained attributes (e.g. a re-run over output that already has one).
const NOSCRIPT_RE = /<noscript\b[^>]*>[\s\S]*?<\/noscript>/i;

const CONTACT =
  '<p>Codevio is a small launch studio — brand, website, and product ' +
  'shipped in fixed sprints, from blank page to paying customers. Email ' +
  '<a href="mailto:info.codevio@gmail.com">info.codevio@gmail.com</a>.</p>';

// Returns the rewritten shell, or null when no <noscript> marker was found.
const replaceNoscript = (html, snapshot) => {
  const block = `<noscript id="codevio-static">${NOJS_FOLD_SHIM}${snapshot}\n${CONTACT}\n</noscript>`;
  const start = html.indexOf('<noscript>');
  const end = start === -1 ? -1 : html.indexOf('</noscript>', start);
  if (start !== -1 && end !== -1) {
    return html.slice(0, start) + block + html.slice(end + '</noscript>'.length);
  }
  if (NOSCRIPT_RE.test(html)) return html.replace(NOSCRIPT_RE, () => block);
  return null;
};

const prerenderRoute = async (cdpEndpoint, pageBase, route) => {
  const target = await fetch(`${cdpEndpoint}/json/new?url=about:blank`, { method: 'PUT' }).then(
    (response) => response.json()
  );
  const cdp = await openCdp(target.webSocketDebuggerUrl);

  try {
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send('Page.enable');

    const loaded = cdp.once('Page.loadEventFired');
    await cdp.send('Page.navigate', { url: `${pageBase}${route.path}` });
    await Promise.race([loaded, sleep(NAV_TIMEOUT_MS)]);
    await sleep(SETTLE_MS);

    const response = await cdp.send('Runtime.evaluate', {
      expression: SNAPSHOT_EXPR,
      awaitPromise: true,
      returnByValue: true,
    });
    const snapshot = response.result.value;
    if (typeof snapshot !== 'string' || !snapshot) {
      throw new Error(response.exceptionDetails?.text || `empty snapshot for ${route.path}`);
    }

    const file = join(distDir, route.file);
    const html = readFileSync(file, 'utf8');
    const output = replaceNoscript(html, snapshot);
    if (!output) throw new Error(`no <noscript> marker in ${route.file}`);

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, output);
    console.log(
      `prerender: ${route.path} -> ${route.file} (${Buffer.byteLength(snapshot)} bytes)`
    );
  } finally {
    cdp.close();
    await fetch(`${cdpEndpoint}/json/close/${target.id}`).catch(() => {});
  }
};

const server = await startStaticServer();
const base = `http://127.0.0.1:${server.address().port}`;
console.log(`prerender: serving dist/ at ${base}`);

let chrome;
let failures = 0;
try {
  chrome = await launchChrome();
  for (const route of routes) {
    try {
      await prerenderRoute(chrome.endpoint, base, route);
    } catch (error) {
      failures += 1;
      warn(`${route.path} failed (${error.message}); ${route.file} stays meta-only`);
    }
  }
} catch (error) {
  failures += 1;
  warn(`browser setup failed (${error.message}); all shells stay meta-only`);
} finally {
  server.close();
  if (chrome) {
    await killChrome(chrome.child);
    await sleep(200);
    try {
      rmSync(chrome.profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
    } catch (error) {
      warn(`could not remove ${chrome.profileDir} (${error.message})`);
    }
  }
}

if (failures) {
  console.error(`prerender: ${failures} route(s) not prerendered - failing the build.`);
  process.exit(1);
}
console.log(`prerender: rendered ${routes.length} routes.`);
