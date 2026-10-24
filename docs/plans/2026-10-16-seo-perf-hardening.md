# SEO & Performance Hardening — Implementation Plan

Date: 2026-10-16
Status: All workstreams (A–F) implemented + verified. See per-workstream status lines below.

## Goal

Make the Codevio marketing site crawlable, fast on first paint, accessible, and
form-reliable without changing its visual identity. Six independent workstreams
(A–F) address configuration hygiene, font payload, the home 3D scene, SEO
architecture, accessibility/contrast, and the contact-form state bug. Each
workstream is shippable on its own and verified with the same order:
`npm run lint` then `npm run build`.

## Architecture

Single-page Vite app with client-side routing (`react-router-dom`). All routes
share a React entrypoint (`src/main.jsx` -> `src/App.jsx`), which renders a
route table for `/`, `/mission`, `/services`, `/work`, `/about`, `/contact`.
Because the app renders entirely on the client, raw HTML served for deep links
contains only the generic shell. Two architectural gaps follow:

1. **No static per-route HTML.** Crawlers and link unfurlers that do not execute
   JavaScript see empty/generic metadata for every route.
2. **A single monolithic entry chunk pulls the home 3D scene.** The
   three/rapier/drei stack (`three-vendor`, ~1.13 MB gzip) blocks first paint
   for every visitor, including those on non-home routes.

The plan keeps the SPA runtime but layers in (a) a single source of truth for
route metadata consumed by both the React pages and a postbuild static-shell
generator, and (b) code-splitting of the 3D scene behind `React.lazy`, with the
2D background/menu/decorative text staying eager.

Deployment target is a static host that honors a `_redirects` file (Netlify-style
200 rewrites plus a final 404 catch-all). Canonical host is `https://codevio.net`,
overridable via `VITE_SITE_URL`.

## Tech stack

- Vite 8 (rolldown-backed), React 19, JSX (no TypeScript).
- Tailwind CSS 4 via `@tailwindcss/vite`; global styles in `src/index.css` and
  `src/App.css`, component CSS beside components.
- `react-router-dom` 6 for routing; `framer-motion`, `gsap` for motion;
  `@react-three/fiber` + `@react-three/drei` + `@react-three/rapier` + `three` +
  `meshline` for the home lanyard scene; `ogl` for the Grainient background.
- `@fontsource*` self-hosted fonts.
- `@formspree/react` for the contact form.
- Verification scripts: `npm run lint` (eslint) then `npm run build` (vite build).
  No test/typecheck/CI scripts exist.

---

## Workstream A — Config & cleanup

**Status. implemented + verified** — `npm run lint` exit 0; the five unused deps (`@gsap/react`, `clsx`, `tailwind-merge`, `sass`, `sass-embedded`) are gone from `package.json`; `assetsInclude: ["**/*.glb"]` sits at the top level of `vite.config.js`; `SafeImage` tracks the failed `src` (not a bare boolean); `StaggeredMenu` defaults `logoUrl` to the imported `src/assets/logo.png`; `dist/assets/card-*.glb` is still emitted.

**Problem.** A stale lint failure (4 `no-undef` for the browser global `gsap`
inside `promo-video/*/timeline.js`) keeps `npm run lint` red. Five dependencies
(`@gsap/react`, `clsx`, `tailwind-merge`, `sass`, `sass-embedded`) are installed
but unused in `src/`. `vite.config.js` nests `assetsInclude` inside `resolve`,
where Vite does not read it. `StaggeredMenu.jsx` defaults `logoUrl` to a
nonexistent path (`/src/assets/logos/reactbits-gh-white.svg`) and exports an
unreferenced named `StaggeredMenu`. `SafeImage.jsx` never clears its `failed`
state when `src` changes, so a broken image stays broken after a new URL. The
optional `VITE_SITE_URL` override is undocumented.

**Files.**
- `eslint.config.js`
- `package.json`, `package-lock.json`
- `vite.config.js`
- `.env.example`
- `src/components/StaggeredMenu.jsx`
- `src/components/SafeImage.jsx`

**Steps.**
1. Add `'promo-video'` to `globalIgnores` in `eslint.config.js`.
2. Confirm zero usage in `src/` of `@gsap/react`, `useGSAP`, `clsx`,
   `tailwind-merge`, `.scss`, `.sass`.
3. `npm uninstall @gsap/react clsx tailwind-merge sass sass-embedded` and keep
   the lockfile in sync.
4. Move `assetsInclude: ["**/*.glb"]` to the top level of the Vite config,
   leaving `resolve.alias` untouched.
5. Document `VITE_SITE_URL` in `.env.example` (optional; default
   `https://codevio.net`; used for canonical + OG URLs).
6. Point `StaggeredMenu`'s default `logoUrl` at the real `src/assets/logo.png`
   (imported) and remove the unreferenced named export.
7. Add a `useEffect(() => setFailed(false), [src])` reset to `SafeImage.jsx`.

**Verification.** `npm run lint` exits 0 with zero errors/warnings. `npm run
build` exits 0 and still emits `dist/assets/card-*.glb`. Before/after headless
Chrome screenshots of `/` and `/services` at 1440x900 show no visual
regression.

**Success metric.** Lint clean (0 problems); five fewer direct dependencies;
`.glb` still bundled as an asset; home + services screenshots byte-comparable
in layout.

---

## Workstream B — Font subsetting

**Status. implemented + verified** — `main.jsx` imports `latin-400.css` for Dela Gothic One and Bebas Neue, and `index.css` hand-declares the Geist latin subset; the build emits exactly **3** `.woff2` files (latin only) and `vendor-*.css` is 0.47 kB (down from 153.8 kB raw / 70.4 kB gzip).

**Problem.** `src/main.jsx` imports the *entire* `@fontsource*` packages, which
ship every language subset. The build emits the full `vendor` CSS at 153.8 kB
raw / 70.4 kB gzip and hundreds of unused `woff`/`woff2` subset files
(cyrillic, greek, vietnamese, and ~100 Dela Gothic One glyph-range slices).

**Files.**
- `src/main.jsx`
- (output) `dist/assets/*.woff2`, `dist/assets/vendor-*.css`

**Steps.**
1. Inspect `node_modules/@fontsource*/` to confirm the exact per-subset entry
   filenames (e.g. `latin.css`, `latin-400.css`).
2. Replace the bare package imports with the latin-only entries for
   `@fontsource/dela-gothic-one`, `@fontsource/bebas-neue`, and
   `@fontsource-variable/geist`.
3. Rebuild and confirm unused subset files stop being emitted.

**Verification.** `npm run lint` and `npm run build` pass. The build size table
shows `vendor-*.css` substantially smaller and the font asset count reduced to
the latin subsets only. Screenshots of hero/body text unchanged.

**Success metric.** Vendor CSS well under 70 kB gzip and font emission reduced
from hundreds of files to a handful, with zero visual text change.

---

## Workstream C — Home performance (3D scene split)

**Status. implemented + verified** — the 3D scene lives in `src/components/LanyardScene.jsx` (verbatim move; physics untouched) and `Lanyard.jsx` lazy-loads it via `React.lazy` + `Suspense` with offscreen/visibility pausing; the built home entry chunk (`index-*.js`) has **0** references to `three-vendor`, so the ~1.13 MB gzip three/rapier/drei stack is off the first-paint graph for every route.

**Problem.** The home route eagerly imports the entire lanyard scene
(`Canvas`/`Physics`/band rope/meshline/`useGLTF`/`useTexture`/`useFrame`),
pulling the ~1.13 MB gzip `three-vendor` chunk into the critical path and
blocking first paint for every route.

**Files.**
- `src/components/Lanyard.jsx` (untouched in its physics/kinematics logic)
- `src/components/LanyardScene.jsx` (new)

**Steps.**
1. Extract the 3D scene (`Canvas`/`Physics`/rope mesh/`GLTF`/texture/`useFrame`)
   **verbatim** into `src/components/LanyardScene.jsx`; no math changes.
2. Lazy-load it with `React.lazy` + `Suspense` from `Lanyard.jsx`. Keep the
   Grainient background, `StaggeredMenu`, and decorative text eager.
3. Add offscreen pause: an `IntersectionObserver` plus
   `document.visibilitychange` handler that sets `frameloop` to `'never'`/`'always'`
   with **zero** changes to physics, drag, or kinematics.

**Verification.** `npm run lint` and `npm run build` pass. The `three-vendor`
chunk is no longer referenced by the initial route graph (home's entry chunk
should not statically import it). Screenshots confirm the scene still renders
and drags.

**Success metric.** three/rapier/drei no longer blocks first paint on non-home
routes; scene remains visually and interactively identical when visible.

---

## Workstream D — SEO architecture

**Status. implemented + verified** — `src/data/seo.js` is the single metadata source consumed by the pages; the postbuild generator emits per-route shells (`index`, `about`, `contact`, `mission`, `services`, `work` `.html` plus `work/*.html`), `404.html`, and `dist/_redirects`; `dist/404.html` carries **0** `rel="canonical"` tags.

**Prerender follow-up (2026-10-17).** `scripts/prerender.mjs` boots each shell in
headless Chrome (reduced-motion emulated, 1440x900, `document.fonts.ready` +
settle), strips canvases and writes the app's own rendered DOM into the shell.

- **Rejected: snapshot into `<div id="root">`.** Measured LCP re-arm — home
  3222 -> 3550 ms, services 3135 -> 3326 ms, CLS 0 -> 0.022 / 0.041 — against a
  real FCP win (2585 -> 2260 ms). `createRoot()` replaces the container, so the
  browser discards the replaced element's LCP paint and re-arms LCP after the
  React re-render, plus DOM-teardown cost.
- **Final design: `<noscript>` static content + meta shells.** The snapshot is
  written into `<noscript id="codevio-static">` (tolerant replace of the block
  `generate-pages.mjs` copies from `index.html`, regex fallback, warn + non-zero
  exit if the marker is missing) followed by a short mailto paragraph; `#root`
  is left empty. Real content and crawlable links stay in the raw HTML for
  non-JS consumers, and a browser with scripting on gives the block a **0x0**
  layout box: no requests, no CLS, no console errors.
- **Revert path (one line).** In `replaceNoscript()`, emit
  `<div id="root">${snapshot}</div>` instead of the `<noscript>` block and anchor
  the match on the empty `#root` div. Nothing else changes — `generate-pages.mjs`,
  the route list and the `package.json` build wiring stay as they are.
- **Runtime cost A/B (settled 2026-10-17).** Does the 151 KB snapshot cost
  anything at runtime? Measured sequentially in one session: one preview server,
  one Chrome at a time, 5 s between runs, warm-up run discarded, Lighthouse
  mobile with the same command as the earlier batches
  (`npx lighthouse <url> --quiet --chrome-flags="--headless=new --no-sandbox
  --disable-gpu" --only-categories=performance,accessibility,seo,best-practices
  --output=json`). A = dist as built (snapshot present); B = the
  `codevio-static` block replaced with the original short `<noscript>`
  paragraph in `dist/index.html` + `dist/services.html` only (no source change,
  `#root` still empty, meta intact), restored with a fresh `npm run build`.

  | config | perf | LCP ms | TBT ms | FCP ms | CLS |
  |---|---|---|---|---|---|
  | A home (snapshot), n=3 | 0.54 | **3374** (3370-3375) | 4117 (4064-4175) | 2734 (2732-2735) | 0 |
  | B home (stripped), n=3 | 0.55 | **3221** (3183-3233) | 4169 (4110-4238) | 2585 (2583-2586) | 0 |
  | A services, n=2 | 0.89 | **3140** (3138-3143) | 102 (96-108) | 2584 (2583-2585) | 0 |
  | B services, n=2 | 0.89 | **3140** (3138-3141) | 89 (82-97) | 2583 | 0 |

  - **Rule fired: KEEP.** Median home LCP(A) − LCP(B) = **153 ms**, under the
    300 ms drop threshold, so `scripts/prerender.mjs` and the
    `vite build && generate-pages.mjs && prerender.mjs` wiring stay.
  - **Known accepted cost.** The block does move simulated mobile LCP on `/` by
    ~150 ms (FCP likewise ~150 ms, TBT and CLS flat) and services by 0 ms. The
    delta is a Lantern (simulate) effect of the extra 151 KB of HTML: the
    observed, unthrottled `lcp-breakdown-insight` numbers put the same element
    first either way — home `div.lanyard-textbox` at 7 ms TTFB + 506 ms render
    delay (~512 ms, A) vs ~502 ms (B); services `p.mx-auto` ~993 ms (A) vs
    ~972 ms (B). Drop/revert path stays the one-liner documented above
    (`replaceNoscript()` -> `<div id="root">`).
  - **Order control.** A re-measure of A after the restore (`n=3`, last group of
    the same session) reproduced 3371-3372 ms LCP / 2732-2734 ms FCP, so the
    ~150 ms is a config effect, not run order or machine drift. Load samples
    (`Get-CimInstance Win32_Processor` LoadPercentage) stayed at 8-12%.
  - The 8674-8681 ms home readings in the previous batch were not reproduced in
    this controlled session (A measured 3373 ms median across the two A groups);
    they are treated as unstable group measurements, superseded by the table.
- **No-JS visibility design (2026-10-17).** Two fixes, both inside the
  `<noscript>` block and therefore inert whenever scripting is on:
  1. *Fold position.* The empty `#root` keeps `min-height:100svh`
     (`src/index.css`), which pushed the static copy one full viewport down.
     The block now opens with `<style>#root{min-height:0!important}</style>`.
  2. *Reveal state.* `reveal()` (`src/lib/motion.js`) uses
     `viewport:{once:true}`, so revealed state persists. The capture now walks
     the page down in ~8 steps (150 ms each) and back to the top before reading
     `#root`, instead of snapshotting at scroll 0 where every below-fold section
     was frozen at `opacity:0` / `translateY(20px)`.

  Verified with `Emulation.setScriptExecutionDisabled` at 412x823 and 1440x900:
  h1 in the first viewport on `/` (top 401 / 519 px) and `/services` (top
  144 / 197 px); `#root` measures 0 px tall; 19 and 15 in-page links present;
  snapshot `translateY` count 0 (was 11 home / 33 services) and **0**
  element-level `opacity: 0` (the only matches left are a CSS rule inside the
  StaggeredMenu `<style>` and the `--sb-tint-opacity` custom property); across
  `/`, `/services`, `/about`, `/work`, `/mission`, `/contact` **0** elements are
  left with computed opacity 0 or `visibility:hidden` while carrying text. With
  scripting on the app renders normally, `noscript#codevio-static` is 0x0 and
  there are **0** console errors/exceptions at both widths. Snapshots are
  idempotent: `dist/index.html` is byte-identical (155150 B) across three
  consecutive builds.
- **Baseline attribution (corrected).** `lh-after/home-mobile-defer-{1,2,3}.json`
  (perf 0.55 / LCP ~3222 ms / TBT 4051-6144 / FCP ~2585 / CLS 0) is the
  **pre-prerender** baseline — same app code (post-paint scene mount) with
  meta-only shells, and the reference the A/B table uses. `lh-after/home-mobile.json`
  (LCP 10105 ms / perf 0.37) is the **pre-defer** artifact, *not* the
  pre-prerender baseline. Services baseline: 0.89 / 3135 ms / 87 ms / 2582 ms / 0.

**Problem.** Client-only rendering yields generic metadata for every route; no
`robots`/`sitemap` lastmod refresh, no `404.html`, no explicit rewrite table,
no structured data, and canonicals are not normalized to a trailing slash.

**Files.**
- `src/data/seo.js` (new single source of route metadata)
- `src/pages/*.jsx` (consume metadata)
- `index.html`, `public/_redirects`, `public/favicon.svg`
- `scripts/` postbuild generator (static shells + `404.html` + sitemap)

**Steps.**
1. Define one metadata map in `src/data/seo.js` consumed by pages.
2. Generate static per-route HTML shells with correct
   `title`/`description`/`canonical`/OG in the raw HTML.
3. Emit `dist/404.html` that must **not** carry a canonical to an invalid URL.
4. Write `public/_redirects` with explicit 200 rewrites per route plus a final
   `/* /404.html 404`.
5. Add `WebSite` JSON-LD site-wide and `BreadcrumbList` on case-study shells.
6. Normalize canonicals to a trailing slash; add `favicon.svg` link; refresh
   `sitemap` `lastmod`.

**Verification.** `npm run lint` and `npm run build` pass; inspect generated
`dist/*.html` for correct tags; verify 404 has no bogus canonical; validate
JSON-LD.

**Success metric.** Every route returns correct metadata in raw HTML, `404.html`
exists without an invalid canonical, and structured data validates.

---

## Workstream E — Accessibility / contrast

**Status. implemented + verified** — axe-core reports **0** violations on `/`, `/services`, `/work`, `/mission`, `/about`, `/contact` (the `scrollable-region-focusable` About `<pre>` and the `/work` `label-content-name-mismatch` are cleared); `SpecularButton --sm` is ≥44px with a `rgba(10,10,15,0.55)` base fill; the shader scrim + darker `liquid-glass` base lift every sampled text/eyebrow to ≥4.5:1 (before/after table in the session report); `npm run lint` + `npm run build` exit 0; 12 before/after screenshots (1440×900, 390×844) show no layout regression. `#root { text-align: center }` was **kept** — removing it left-aligned card text across Services/Work/Offers/Mission (a visual-identity change), so it was reverted per the plan's condition.

**Problem.** `SpecularButton` `--sm` can render below the 44px touch target and
lacks a base fill under its FX layer. The About `<pre>` is not keyboard
focusable. Logo `alt` text is inconsistent. The hero "desktop drag" note is
low-contrast. Several `text-white/45|/50|/60` alphas fall below AA. `index.css`
breakpoints (`min-width:1025px` and two `max-width:1024px`) leave a 1px dead band
against Tailwind's `lg` (1024px). `#root { text-align:center }` can leak
centering into Mission bullets/timeline.

**Files.** `src/components/SpecularButton*`, `src/pages/About.jsx`,
logo `alt` sites, hero note, `src/index.css` (and affected components).

**Steps.**
1. `SpecularButton`: `--sm` `min-height: 44px` + base fill beneath the FX layer.
2. Make the About `<pre>` focusable (`tabindex`/`role`) and keyboard-scrollable.
3. Unify logo `alt` text.
4. Raise the hero "desktop drag" note contrast.
5. Replace `text-white/45|/50|/60` with AA-passing values; add liquid-glass base
   fill + shader scrim.
6. Align `index.css` breakpoints: `min-width:1025px` -> `1024px`, the two
   `max-width:1024px` -> `1023.98px`.
7. Remove `#root` `text-align:center` **only** if a before/after screenshot diff
   shows the center-leak fix with no layout regression.

**Verification.** `npm run lint` and `npm run build` pass; screenshots at
desktop + mobile widths; pixel sampling to confirm contrast ratios meet 3:1
(large) / 4.5:1 (body).

**Success metric.** All touched text meets WCAG AA, touch targets >= 44px, no
1px dead band, and no layout regressions in screenshots.

---

## Workstream F — ContactForm P0 (@formspree/react stale state)

**Status. implemented + verified** — `ContactForm.handleSubmit` calls `resetFormspree()` before every submission (so the new submit can never observe the previous run's flags) and `reset()` calls it too (so "Send another" starts clean); `npm run lint` + `npm run build` exit 0.

**Problem.** `@formspree/react` keeps previous submission state. After a failure
then a retry, or after a success followed by a failed submit, stale
error/success state can surface (false error, or false success).

**Files.** `src/components/ContactForm.jsx`

**Steps.**
1. Reset form state at the start of every submit.
2. Reset state when "Send another message" is clicked.

**Verification.** `npm run lint` and `npm run build` pass; manual flow — force a
failure, retry successfully (no stale error); succeed then force a failure (no
false success).

**Success metric.** No stale error after a successful retry; no false success
after a failed submit.

---

## Known constraints

- The Lanyard physics/drag/meshline/strap logic is untouchable; only a
  **verbatim** move into a new module is permitted (workstream C).
- No new dependencies may be added.
- Preserve the visual identity: no intentional visual redesign.
- Do not commit to git as part of this work.
- Do not deploy.
- `src/components/Lanyard.jsx` (all of it, for now), `promo-video/`, and `dist/`
  must not be manually edited.
