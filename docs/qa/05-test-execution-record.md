# Deliverable F — Test Execution Record

Codevio QA audit · 2026-10-17

Every command below was run in this session. Exit codes are the real ones. No result is
reported from memory or from an earlier run.

---

## F.1 Commands actually executed

### Environment and reconnaissance

| # | Command | Result |
|---|---|---|
| 1 | `Get-Location`, `Get-ChildItem -Force` | Workspace root is `C:\Users\Admin\Downloads\Codevio-Website-staging`; the app is one level down in `Codevio-Website-staging\` |
| 2 | `node -v`, `npm -v` | v24.16.0 / 12.0.2 |
| 3 | `Get-ChildItem env: \| Where-Object DSH*` | `DSH_HOME`, `DSH_PROFILE=web`, `DSH_SESSION_ID`, `DSH_WEB_URL=http://127.0.0.1:3080`. **No model variable is exposed**; the model is known only from the harness transcript |
| 4 | `git status --porcelain`, `git log`, `git cat-file -e HEAD:<file>` ×10, `git log --diff-filter=A -- <file>` | 41 modified, 106 untracked; `HEAD = bc6e77d = upstream/staging`; six build-critical files untracked; `public/_headers` and `public/robots.txt` added in `854f09a` |
| 5 | Font/asset/config reads (`package.json`, `vite.config.js`, `index.html`, `eslint.config.js`, `jsconfig.json`, `.env.example`, `public/*`, `scripts/*.mjs`, `src/**`) | Route table, build pipeline, header/redirect policy, CSP, metadata source |
| 6 | Directory sizing of `promo-video/` | 65.6 MB, 79 files, untracked, eslint-ignored, not part of the build — left untouched |

### Baseline verification

| # | Command | Before the fixes | After the fixes |
|---|---|---|---|
| 7 | `npm run lint` | **exit 0**, no findings | **exit 0**, no findings |
| 8 | `npm run build` | **exit 1** — `failed to load config from vite.config.js` / `[plugin externalize-deps] Error: spawn EPERM` | **exit 1**, identical |
| 9 | `node node_modules/vite/bin/vite.js build` (with `NODE_OPTIONS=--require %TEMP%\dsh-netuse-shim.cjs`) | **exit 0**, 2,829 modules, `✓ built in 4.66s` | **exit 0**, `✓ built in 1.35s` |
| 10 | `node scripts/generate-pages.mjs` | **exit 0**, wrote 10 shells (`/` was skipped) | **exit 0**, wrote **11** shells (`/` now included — fix 15) |
| 11 | `node scripts/prerender.mjs` | **exit 1** — `prerender: WARNING browser setup failed (spawn EPERM)` → `1 route(s) not prerendered - failing the build` | **exit 1**, identical |

### Sandbox capability probes (these decide what "verified" can mean)

| # | Probe | Result |
|---|---|---|
| 12 | `Set-Content C:\Users\Admin\dsh-qa-probe.txt` and `C:\Windows\Temp\…` | **Access denied** — file policy is `workspace-write`; a second attempt late in the session was still denied |
| 13 | `node -e "require('child_process').exec('net use', cb)"` | **`EPERM` thrown synchronously** |
| 14 | `node -e` spawn matrix: `spawnSync('cmd', …, {pipe})` / `spawn('cmd', …, {stdio:'inherit'})` / `spawn('cmd', …, {stdio:['ignore','pipe','pipe']})` / `execFile('cmd', …)` | ok / ok / **EPERM** / **EPERM** — the denial is specific to piped stdio |
| 15 | `Start-Process chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<workspace>` | process **exits immediately**, `exited=True`, no `DevToolsActivePort` file, no CDP endpoint on 9333 |
| 16 | `spawnSync(chromePath, ['--dump-dom','about:blank'])` | `error = spawnSync … EPERM` — control: the same call with `cmd` succeeds |
| 17 | `agent-browser open http://127.0.0.1:4173/` | `✗ Socket directory 'C:\Users\Admin\.agent-browser' is not writable: Access is denied. (os error 5)`; `USERPROFILE`/`HOME` overrides ignored |
| 18 | `curl.exe -sI https://codevio-dev.netlify.app/` | `curl: (35) schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS` — plain HTTP works (301 → HTTPS) |
| 19 | Python `fontTools 4.62.1`, `brotli` | available (used for the unicase proof) |

### Local serving and probing

| # | Command | Result |
|---|---|---|
| 20 | `node node_modules/vite/bin/vite.js preview --port 4173 --strictPort` (background job, with the shim) | running; `curl.exe` → `status=200 size=4017` |
| 21 | `curl.exe -s -o NUL -w "%{http_code}"` for `/`, `/work/tara-jewellery`, `/nope` | 200 / 200 / **200** — confirms `vite preview` **ignores `_redirects`**, so real 404 behaviour could not be observed locally |

### Live-site comparison (read-only, GET only)

| # | Command | Result |
|---|---|---|
| 22 | Node `fetch` across `/`, `/robots.txt`, `/sitemap.xml`, `/services`, `/work/tara-jewellery`, `/definitely-not-a-page` | 200, 404, 404, 404, 404, 404 |
| 23 | Node `fetch` and header dump of `/` | No CSP / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy. HSTS present at Netlify's default `max-age=31536000`. 2,165 B of HTML containing `fonts.googleapis.com`, `fonts.gstatic.com`; no `og:image`, no JSON-LD, no prerendered block |
| 24 | `web_fetch` on the live `/` and `/services` | Independently reproduced the 404 on `/services` |

### Font forensics

| # | Command | Result |
|---|---|---|
| 25 | `fontTools` cmap + bounds comparison across Bebas Neue, Geist, Dela Gothic One | Bebas Neue: lowercase == uppercase outlines (`A` and `a` both `(12,0,389,700)` w `401`; same for B, X, O, E, G). Geist and Dela have distinct lowercase |
| 26 | Inspect the built `dist/assets/index-*.css` | Pre-fix: `--sans:"Bebas Neue"…; font:18px/145% var(--sans)`. Post-fix: `--sans:"Geist Variable", system-ui, "Segoe UI", Roboto, sans-serif` |

### Regression suite

| # | Command | Result |
|---|---|---|
| 27 | `node --test tests/` | **exit 1** — `Error: spawn EPERM` (per-file isolation spawns a child) |
| 28 | `node --test --test-isolation=none tests/` | **exit 1** — `ERR_UNSUPPORTED_DIR_IMPORT` (a directory cannot be imported as a module in this mode) |
| 29 | `node --test --test-isolation=none "tests/**/*.test.mjs"` | **exit 0** — the form now wired into `npm test` |
| 30 | Suite against the **pre-fix** tree | **16 pass / 2 fail over 18 checks**, failures = the two typography contracts (the suite grew to 20 checks later — see #40) |
| 31 | Suite against the **post-fix** tree | **20 pass / 0 fail** at that point; **21 pass / 0 fail** once the round-2 contract was added, and **22 pass / 0 fail** after round 3 (see #50 and #53) |

### Independent review round

| # | Command | Result |
|---|---|---|
| 39 | `read_image` on `src/assets/sidescroll3.jpg` | Confirmed: a photograph of a printed poster carrying "óscar raña", "yo sí: yo no", "último mono ediciones" and "2024" — a third party's artwork, with credit visible, used as the "Rebrand & relaunch" case-study hero (FUN-07). `sidescroll1.jpg` and `sidescroll2.jpg` were described by agent A and **not** re-opened by me |
| 40 | Red-green probe of the four new/widened guards (`%TEMP%\redgreen.cjs`) | For each of the four: break the thing the guard protects → suite **exit 1**; restore the file and verify its sha256 matches the backup → suite **exit 0**. All four fired. `All guards fired red on a real break and green after restore.` |
| 41 | `npm run lint` with `var unusedThing = 1;` in `scripts/__lintprobe.mjs` | **exit 0 before the eslint fix** (the gap), **exit 1 after it** with `no-unused-vars`; control: the identical content in `scripts/__lintprobe.js` gave exit 1 both times. Both probes deleted; lint re-run **exit 0** |
| 42 | `npm run lint` after widening the config to `scripts/**/*.mjs` and `tests/**/*.mjs` | First run **exit 1 with 13 real errors** (11 × `process`/`Buffer` `no-undef`, 1 × `no-regex-spaces` in the new suite) → added Node globals for those paths and fixed the regex → **exit 0** |
| 43 | Built-CSS inspection after the review round | `--sans:"Geist Variable"` present, `--mono` absent, `#main:focus-visible` present |
| 44 | `npm run build` + `generate-pages.mjs` + `npm test` after every review-round edit | build **exit 0** (1.05 s, 2,829 modules); generator **exit 0**, 11 shells; tests **20 pass / 0 fail** |

### Round-2 static accessibility and font-coverage audit

| # | Command | Result |
|---|---|---|
| 45 | Red-green probe of the round-2 contract (`%TEMP%\redgreen2.cjs`), 4 cases | Rename the id a `htmlFor` points at → **exit 1**; break an `aria-labelledby` target → **exit 1**; drop `alt` from the footer logo → **exit 1**; declare an id twice in one file → **exit 1**. Every case restored byte-identically (sha256 checked) and the suite returned to **exit 0**. `All guards fired red on a real break and green after restore.` |
| 46 | ID / ARIA reference audit over all 31 JSX+JS files (`%TEMP%\idaudit.mjs`) | **0 broken references**; 7 literal ids; 4 literal references; 2 template ids and 3 template references reported as unverifiable statically. The only id in more than one file is `#main` (5 route owners, never twice in one render) |
| 47 | Accessible-name / `alt` audit (`%TEMP%\nameaudit.mjs`) | 23 interactive elements; **0 `<img>` without `alt`**; 2 hits both verified as false positives — `Footer.jsx:72`'s `<Link>` is named by its nested `<img alt="Codevio">`, and `ContactForm.jsx:281`'s `<input>` uses a template id |
| 48 | Glyph-coverage audit (`%TEMP%\glyphaudit.py`, `fontTools` over the 3 shipped latin subsets) | 10 non-ASCII codepoints used in `src/`. All subsets cover ©, ·, –, —, ’, “, ”, €. **All three lack U+2192 →**, used in 10 visible strings; U+2500 ─ is also "missing" but appears only in comments |
| 49 | Built-CSS check of the display-face utilities | `.font-['Bebas_Neue']{font-family:Bebas Neue}` — **no fallback list**, unlike `--sans`/`--heading`. This is what makes TA-02 more than cosmetic |
| 50 | Final chain after the round-2 edits | lint **exit 0**, `vite build` **exit 0**, `generate-pages.mjs` **exit 0** (11 shells), `npm test` **21 pass / 0 fail** (exit 0) |
| 51 | Precise double-encoding check across all 9 `docs/qa` files | **all 9 clean** (encode to CP1252, decode as UTF-8; corruption would show changed output with 0 replacement characters). An earlier, narrower check had reported clean for the wrong reason |

### Round-3 pricing and structured-data integrity

| # | Command | Result |
|---|---|---|
| 52 | Pricing cross-check (`%TEMP%\priceaudit.mjs`) — parse `HOME_OFFERS` and `OFFERS` out of `src/data/site.js` and match by title | 4 home tiers vs 15 services packages. **All 4 shared tiers agree exactly on price and timeline.** The only delta is `priceNote` ("one-time" on `/`, blank on `/services`) — presentational, and `/services` uses that field to mean "bundle" on two other tiers, so it is deliberate. **No contradiction** (DATA-01) |
| 53 | Red-green probe of the structured-data contract (`%TEMP%\redgreen3.cjs`), 3 cases against the **built** `dist/index.html` | Drift the phone → **exit 1**; drift the email → **exit 1**; drop one `sameAs` profile → **exit 1**. All restored byte-identically (sha256 checked) and back to **exit 0**. The first run of this probe mutated `index.html` instead of `dist/index.html` and correctly did **not** fire — which is itself evidence the contract tests the artifact, not the source |
| 54 | Final chain after the round-3 edit | lint **exit 0**, `vite build` **exit 0**, `generate-pages.mjs` **exit 0** (11 shells), `npm test` **22 pass / 0 fail** (exit 0) |

### Blast-radius and artifact verification

| # | Command | Result |
|---|---|---|
| 32 | Multi-line JSX `className` sweep for uppercase labels that inherit their face | 10 candidates → resolved by hand to 6 affected (5 eyebrows + footer social labels) and 4 unaffected (2 price notes nested in a Bebas parent, 2 menu items under `.lanyard-nav`'s Dela). The review later showed the sweep keyed too narrowly on `uppercase`, which is how REV-02 was missed |
| 33 | `select-string` for residual `text-white/30`, `text-white/40`, `inert`, `role="alert"`, `<nav`, `onClick={closeMenu}` | All present as intended; no residual failing tokens |
| 34 | `select-string` for a stray `</aside>` in `StaggeredMenu.jsx` and a tag-balance read | **none**; the panel `<nav>` opens at 543 and closes at 612, the socials `<nav>` at 588/609 |
| 35 | Built-artifact inspection of `dist/index.html` | `meta description`, `og:description`, `twitter:description` now byte-identical |
| 36 | `dist/_headers` tail | `/assets/*` + `Cache-Control: public, max-age=31536000, immutable` present |
| 37 | Node `zlib` measurement of `dist/` | 66 files, 5,500,378 B; 23 JS chunks, 3,984,738 B; 4 CSS, 53,687 B; 11 HTML, 44,917 B |
| 38 | `select-string` for `ROUTE_META` strings in `dist/assets/*.js` | found in `Lanyard-C-9ryaXw.js` (explains the 24 → 23 chunk change) |

---

## F.2 Passed checks

- `npm run lint` — **exit 0**, no output (before and after)
- `vite build` with the shim — **exit 0** (before and after)
- `generate-pages.mjs` — **exit 0**, 11 shells (10 before fix 15)
- **22/22** contracts in `tests/site-contracts.test.mjs`
- Route table ⟷ `ROUTE_META` ⟷ `App.jsx` `<Route>` agreement, including the `*` catch-all and `/work/:slug`
- All 6 `NAV_ITEMS` links resolve; all 24 internal link expressions resolve; all 4 case-study slugs agree across `site.js`, `seo.js`, `sitemap.xml`, `_redirects` and the shells
- Exactly one `<main id="main">` and exactly one `<h1>` on all 8 routes; no skipped heading levels on `/mission`, `/services`, `/work`, `/contact`, `/work/:slug`
- `sitemap.xml`: 10 `<loc>`, exact set, no duplicates, `lastmod` `2026-10-16` not in the future
- `robots.txt`: wildcard allow + absolute sitemap on the canonical origin
- `_headers`: all six security headers present, `script-src` free of `unsafe-inline`/`unsafe-eval`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`
- `_redirects`: 20 route rewrites covering both slash variants, catch-all `/* /404.html 404` present exactly once and last
- `404.html`: one `noindex`, zero canonicals
- JSON-LD parses; `Organization` + `WebSite`; canonical origin; no invented ratings/reviews/pricing; `BreadcrumbList` on case studies only; `<`-escaping prevents `</script>` breakout
- Every shell's title/description/canonical/`og:url` matches `src/data/seo.js` exactly
- `public/` → `dist/` copy integrity for `_headers` and `_redirects`
- The 3D stack is absent from the preload set and the entry graph of every route
- Menu keyboard contract: `aria-controls`/`aria-expanded` on a 44×44 toggle, focus moved in, trap wraps both ways, Escape returns focus, closed panel `aria-hidden` + `inert`, `aria-current="page"` on the active item
- Security: no credentials in the repo; `.env*` ignored with only the template tracked and both its values empty; no XSS sinks; no open redirect; no user-derived navigation target; `target="_blank"` ×4 all carry `rel`; the CSP matches the real resource set
- `npm audit`: 2 moderate, 0 high, 0 critical, both advisories unreachable (documented in INFO-02)

## F.3 Failed checks

| Check | Result | Disposition |
|---|---|---|
| `npm run build` (full chain) | exit 1 | Environment. Shimmed stages verified separately; prerender blocked |
| `node scripts/prerender.mjs` | exit 1 | Environment (SEO-01). The fail-open behaviour is SEO-02 |
| Typography contracts (pre-fix) | 2 failures | Both fixed; now green (TA-01) |
| A11Y-01…A11Y-10, A11Y-13, A11Y-15 | 12 findings | 10 fixed, 1 partial, 1 open |
| SEO-05, SEO-09 | 2 findings | Both fixed |
| FUN-03, FUN-04, FUN-06 | 3 findings | All fixed |
| PERF-06, PERF-10 (partial) | 2 findings | Caching fixed; footer logo lazy; hero derivatives open |
| Live site: headers, robots, sitemap, deep links | 4 failures | DEP-01, open — needs a deploy |

## F.4 Blocked checks

| Blocked | Why | What was done instead |
|---|---|---|
| Any browser rendering: screenshots, visual diff, layout at 7 viewports | Chrome cannot start in this sandbox (probes 15, 16) | Source-level responsive analysis; three near-misses documented as A11Y-11 and UNC-09 |
| Keyboard walkthrough, focus order, reduced-motion behaviour | No browser, and `agent-browser` cannot create its socket dir (probe 17) | Code-traced review; the two keyboard defects found (A11Y-01, A11Y-03) were fixed and their DOM mechanism is stated |
| `axe-core` scan | No browser | Manual WCAG checklist per success criterion |
| Lighthouse, LCP, INP, CLS, TBT, Speed Index | No browser | Measured byte sizes only; no metric was invented |
| Multi-engine (Firefox, WebKit) testing | Playwright browsers are installed but unreachable (the driver needs a piped child process) | Not attempted; nothing is claimed about Firefox or WebKit |
| Real form submission to Formspree | Would create a real lead; explicitly out of scope | Code-path analysis; the false-success path is FUN-02 |
| `semgrep` / `codeql` | Tools not installed | Manual source review + `npm audit` |
| Netlify `_redirects` runtime behaviour | `vite preview` ignores it (probe 21) and the live host serves a pre-`854f09a` build (probe 22) | Rules verified by reading; the contract is now guarded by test |
| HTTrack/HTML validation service, Search Console, CrUX | No access | Not attempted |

## F.5 Pre-existing problems (present before any change, and still present)

1. The full `npm run build` cannot run in this environment (sandbox), and `prerender.mjs` fails without a browser.
2. The deployed staging site is ≥12 days stale and carries none of the hardening (DEP-01).
3. The hardening is uncommitted; `HEAD` cannot build the site (DEP-02).
4. `--sans` was the unicase display face (TA-01, now fixed).
5. Three of four case studies are undisclosed mock work (FUN-01).
6. The contact form can fake success (FUN-02).
7. 11 performance findings and 7 SEO findings remain open, the largest being 1.57 MB of base64-inlined WASM and 3.82 MB fetched after first paint on `/`.
8. `npm audit` reports 2 moderate unfixable `react-router` advisories; neither is reachable.

## F.6 Regressions introduced during this audit, and their resolution

| Regression | Cause | Resolution |
|---|---|---|
| `dist/index.html` shrank from 151.5 KB to ~4 KB during the session | Running `vite build` in a Chrome-less environment replaces a previously prerendered build with a meta-only one | **Not a code regression and not repairable here.** Recorded in Deliverable E §E.1/E.3 and raised as SEO-02 so it cannot ship silently in CI |
| `outFileFor('/')` initially wrote `dist/.html` | The literal `path.replace(/^\//,'')` mapping applied to `/` | Caught before commit by re-reading the generator; the fix special-cases `/` to `index.html`. Confirmed by the generator writing 11 shells and by the new shell tests |
| `--sans` → Geist silently changed 6 label elements | Labels relied on the inherited face | Found by the sweep in F.1 #32 and pinned; a test now guards the eyebrow pattern |
| The `seo` chunk was merged into `Lanyard`, removing one request and adding 405 B | Importing `NotFound` into `CaseStudy` changed chunk grouping | Verified benign — `ROUTE_META` strings confirmed present in the built chunk |

No regression was found that changed user-visible behaviour, and none was left unresolved.

## F.7 Remaining manual verification (for a machine with a browser)

1. `npm run build` end-to-end, then confirm `dist/index.html` contains `id="codevio-static"` and exceeds 50 KB.
2. Visual pass on the typography change (TA-01) — specifically prose on `/mission`, `/services`, `/work`, `/work/:slug`, `/about`, `/contact`, and the five eyebrow labels plus the footer socials that were pinned.
3. Keyboard-only pass: Tab from load, open the menu, activate a link, confirm focus lands on the new page (A11Y-01); Tab into the tech strip and confirm it holds still (A11Y-03).
4. Force `prefers-reduced-motion: reduce` and confirm the home hero is static (A11Y-05).
5. `axe-core` run on all 8 routes.
6. Lighthouse mobile + desktop on `/`, `/services`, `/work` and one case study; record LCP, INP/TBT, CLS separately.
7. 7 viewports × the routes above; the specific things to look for are listed in A11Y-11 (URL-bar clipping) and UNC-09 (footer headline).
8. Submit the contact form once with a real address to confirm delivery, then re-test the two false-success triggers in FUN-02.
9. Mobile Safari for `wasm-unsafe-eval` (Safari <16.4 blocks the WASM and the 3D scene degrades through its `ErrorBoundary`).
10. Deploy to a staging URL and re-run the header/robots/sitemap/deep-link probe from F.1 #22–23 (closes DEP-01).
