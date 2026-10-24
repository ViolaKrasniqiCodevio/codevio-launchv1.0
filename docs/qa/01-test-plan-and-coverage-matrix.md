# Deliverable B — Route, Feature and Test-Coverage Matrix

Codevio QA audit · 2026-10-17 · scope: `C:\Users\Admin\Downloads\Codevio-Website-staging\Codevio-Website-staging`

Everything below was produced by inspecting the code, the generated `dist/` artifact, or
both. **"Verified" always names the method.** No browser was available (see Deliverable A,
§A.7), so every browser-dependent row is marked `BLOCKED`, never `PASS`.

---

## B.1 What the site is

A single-page marketing site for a small launch studio. One Vite + React 19 app, six static
routes plus four case-study pages plus a catch-all. The home page is a bespoke composition
(physics "lanyard" badge, shader background, tech marquee, positioning hero, pricing
teaser); every other route renders a shared `PageShell` (same shader background, GSAP
burger menu, framer-motion reveals, footer). Content, navigation and route metadata are
data-driven from `src/data/site.js` and `src/data/seo.js`. The contact form posts to
Formspree with a no-JS `<form action>` fallback. A postbuild script writes one HTML shell
per route for crawlers.

Load assumed: a public marketing site with a low request rate, no accounts, no sessions, no
server-side state, no user-generated content. Nothing here is judged against a
high-concurrency load.

---

## B.2 Route inventory

| Route | Component | Shell file | One `<main id="main">` | `<h1>` | Notes |
|---|---|---|---|---|---|
| `/` | `src/pages/Home.jsx` | `dist/index.html` | yes (`Home.jsx:74`) | `PositioningStrip.jsx:20` | splash + 3D hero + marquee |
| `/mission` | `src/pages/Mission.jsx` | `dist/mission.html` | yes (PageShell) | `Mission.jsx:28` | |
| `/services` | `src/pages/Services.jsx` | `dist/services.html` | yes (PageShell) | `Services.jsx:38` | pricing grid |
| `/work` | `src/pages/Work.jsx` | `dist/work.html` | yes (PageShell) | `Work.jsx:28` | case-study grid |
| `/work/:slug` | `src/pages/CaseStudy.jsx` | `dist/work/<slug>.html` ×4 | yes (PageShell) | `CaseStudy.jsx:33` | dynamic |
| `/about` | `src/pages/About.jsx` | `dist/about.html` | yes (`About.jsx:270`) | `About.jsx:322` | inline shell |
| `/contact` | `src/pages/Contact.jsx` | `dist/contact.html` | yes (`Contact.jsx:21`) | `Contact.jsx:71` | inline shell + form |
| `*` | `src/pages/NotFound.jsx` | `dist/404.html` | yes (PageShell) | `NotFound.jsx:35` | catch-all |

The four case-study slugs are `tara-jewellery`, `saas-waitlist-launch`, `marketplace-mvp`,
`rebrand-and-relaunch`.

---

## B.3 Component and feature inventory

| Feature | Where | Interactive? | States present |
|---|---|---|---|
| Burger menu | `src/components/StaggeredMenu.jsx` (1026 lines) | yes | closed / open / scrolled, focus-trapped, Escape-to-close |
| Shader background | `src/components/Grainient.jsx` (`ogl`) | no | animated, reduced-motion static frame, offscreen-paused |
| Tech marquee | `src/components/LogoLoop.jsx` | yes (links) | hover-paused, focus-paused (added), duplicate clones aria-hidden |
| Route transition | `src/components/StackCard/PageTransition.jsx` | no | fade + 12px rise, keyed on pathname |
| Scroll indicator | `src/App.jsx:21-90` | no | hidden when there is nothing to scroll |
| Splash screen | `src/components/SplashScreen.jsx` | no | once per session, skipped under reduced motion |
| Contact form | `src/components/ContactForm.jsx` | yes | idle / submitting / success / error, per-field validation, honeypot |
| Specular buttons | `src/components/SpecularButton.jsx` (`ogl` shader) | yes | enabled / disabled / focus-visible |
| 3D lanyard badge | `src/components/Lanyard.jsx`, `LanyardScene.jsx` | yes (drag, desktop) | loading / active / offscreen-paused / reduced-motion static (added) |
| Safe image fallback | `src/components/SafeImage.jsx` | no | ok / failed → gradient block |
| Error boundary | `src/components/ErrorBoundary.jsx` | no | ok / `StaticFallback` |
| Footer | `src/components/Footer.jsx` | yes | nav + contact + socials |

No search, no filtering, no sorting, no pagination, no auth, no API beyond the Formspree
POST. Nothing was invented to fill a row.

---

## B.4 Test matrix

Methods used:

- **TEST-SUITE** — `node --test --test-isolation=none "tests/**/*.test.mjs"` (18 assertions/
  contracts, new in this audit)
- **BUILD-INSPECT** — reading the generated `dist/` artifact byte counts and tags
- **SOURCE-READ** — reading the component and tracing the code path
- **CLI-PROBE** — `curl.exe` against the local preview server, or Node `fetch` against the
  live staging host
- **FONT-TOOL** — Python `fontTools` against the shipped `.woff2`
- **GIT** — read-only git plumbing

| Test ID | Route / component | Feature tested | Method | Expected | Actual | Result | Issue |
|---|---|---|---|---|---|---|---|
| R-01 | all 8 | route table and `ROUTE_META` agree; catch-all present | TEST-SUITE | no orphan route | all 7 metadata paths routed, `*` present, `/work/:slug` present | **PASS** | — |
| R-02 | all | every `NAV_ITEMS` link resolves to a route | TEST-SUITE | 6/6 resolve | 6/6 resolve | **PASS** | — |
| R-03 | `/work/:slug` | `CASE_STUDIES` slugs == `CASE_STUDY_META` slugs | TEST-SUITE | identical, ordered | identical, 4/4 | **PASS** | — |
| R-04 | `/work/:slug` | unknown slug reaches a 404 experience | SOURCE-READ | 404 shown at the requested URL | was `<Navigate to="/work">` (soft 404, URL rewritten) | **FAIL → FIXED** | FUN-04 |
| R-05 | all | one `<main id="main">` per route, `#main` present | SOURCE-READ | exactly one | exactly one on all 8 | **PASS** | — |
| R-06 | all | exactly one `<h1>` per route, no skipped heading levels | SOURCE-READ | 1 `h1`, no gaps | 1 `h1` on all 8; `/mission`, `/services`, `/work`, `/contact`, `/work/:slug` are h1→h2→h3 | **PASS** | SEO-08, SEO-07 |
| R-07 | `/` | `h1` is in the first viewport | SOURCE-READ | h1 above the fold | h1 sits below a `min-height:115vh` hero | **FAIL (reported)** | SEO-07 |
| R-08 | all | back/forward does not force scroll-to-top | SOURCE-READ | POP left to the browser | `ScrollToTop` returns early on POP | **PASS** | — |
| R-09 | all | focus moves to the new page on internal navigation | SOURCE-READ | focus on `#main` | focus fell back to `<body>` | **FAIL → FIXED** | A11Y-01 |
| R-10 | all | internal links resolve (24 link expressions) | SOURCE-READ | 0 broken | 0 broken; `tarajewellery.org` → HTTP 200 | **PASS** | — |
| R-11 | all | `/work/` and `/work/<slug>/` trailing-slash variants covered | TEST-SUITE | rule for each variant | rule for every route ×2 variants | **PASS** | — |
| R-12 | all | direct load / refresh of nested routes | CLI-PROBE (`vite preview`) | own shell served | own shell served per path | **PARTIAL** — `vite preview` ignores `_redirects`, so the real Netlify 404 status is unverified | SEO-04 |
| R-13 | menu | clicking the current page's entry closes the panel | SOURCE-READ | closes | was a dead click, panel stayed open | **FAIL → FIXED** | FUN-03 |
| R-14 | menu | Escape closes and returns focus to the toggle | SOURCE-READ | yes | yes (`StaggeredMenu.jsx:416-422`) | **PASS** | — |
| R-15 | menu | closed panel is out of the tab order and out of the a11y tree | SOURCE-READ | hidden | `aria-hidden={!open}` + `inert={!open}` | **PASS** | — |
| R-16 | menu | focus trap wraps at both ends | SOURCE-READ | wraps | wraps (`:426-441`) | **PASS** | — |
| R-17 | menu + keyboard | focus is **visible** while the marquee moves under it | SOURCE-READ | focus stays on screen | focused link drifted out of the clipped track | **FAIL → FIXED** | A11Y-03 |
| R-18 | form | empty submit → inline errors, focus first invalid | SOURCE-READ | 4 errors, focus first | 4 errors raised, only the first is focused and only it is announced | **PARTIAL → FIXED** | A11Y-06 |
| R-19 | form | double submit impossible | SOURCE-READ | guarded | `submittingRef` + disabled button | **PASS** | — |
| R-20 | form | a real submission reaches Formspree | **NOT TESTED** | a POST leaves the browser | no submission was made — a real lead would have been created | **BLOCKED** | FUN-02 |
| R-21 | form | success is shown **only** when the request succeeded | SOURCE-READ | never false | two client heuristics fake success and skip the request | **FAIL (reported)** | FUN-02 |
| R-22 | form | offline / network failure message | SOURCE-READ | reachable branch | `catch` is unreachable (`@formspree/core` returns errors, does not throw) | **FAIL (reported)** | FUN-08 |
| R-23 | form | honeypot is not reachable or announced | SOURCE-READ | hidden from AT | label exposed, input `aria-hidden` → focusable dead end | **FAIL → FIXED** | A11Y-07 |
| R-24 | `/` | splash shows once per session and skips reduced motion | SOURCE-READ | yes | `sessionStorage` gate + `matchMedia` guard | **PASS** | — |
| R-25 | `/` | 3D scene honours `prefers-reduced-motion` | SOURCE-READ | no motion | physics kept swinging and spinning | **FAIL → FIXED** | A11Y-05 |
| R-26 | `/` | 3D scene is off the non-home critical path | BUILD-INSPECT | not preloaded elsewhere | no shell preloads `three-vendor`; only `/` reaches it | **PASS** | — |
| R-27 | all | WebGL contexts are released on unmount | SOURCE-READ | released | `Grainient` never called `loseContext` | **FAIL → FIXED** | FUN-06 |
| R-28 | all | images have `alt`; content images are lazy with `srcset`/`sizes` | SOURCE-READ | yes | yes; `sizes` within 0.6 % on `/work`, one step of over-fetch on case studies | **PASS** | PERF-10 |
| R-29 | all | no horizontal overflow at 7 viewports | SOURCE-READ | none | no overflow source found; three near-misses documented | **PASS (source-level only)** | A11Y-11 |
| R-30 | all | 320/360/390/768/1024/1366/1440 layout | **BLOCKED** | no clipping/overlap | not observed | **BLOCKED** | — |
| R-31 | `/work/:slug` | sticky sidebar is not covered by the fixed header | SOURCE-READ | not covered | 40px sticky under a 77–96px blurred backdrop | **FAIL → FIXED** | A11Y-10 |
| R-32 | all | keyboard-only walkthrough | **BLOCKED** | full reachability | not observed | **BLOCKED** | — |
| R-33 | all | axe-core automated scan | **BLOCKED** | 0 violations | not run | **BLOCKED** | — |
| R-34 | all | WCAG contrast of every text pair | SOURCE-READ + computed | ≥4.5:1 / ≥3:1 | 3 confirmed failures; the rest pass | **FAIL ×3 → 2 FIXED, 1 reported** | A11Y-04, A11Y-08, A11Y-09 |
| R-35 | all | `forced-colors` / `prefers-contrast` handling | SOURCE-READ | handled | not handled anywhere | **UNCONFIRMED RISK** | A11Y-18 |
| R-36 | all | every literal `htmlFor` / `aria-describedby` / `aria-controls` / `aria-labelledby` / `aria-owns` / `aria-activedescendant` resolves to an id that exists | TEST-SUITE | 0 broken | 0 broken (7 literal ids, 4 literal refs) | **PASS** | A11Y-19 |
| R-37 | all | every `<img>` carries `alt`; no id but `#main` is declared in two files | TEST-SUITE | 0 missing | 0 missing across 5+ images; only `#main` is cross-file | **PASS** | A11Y-19 |
| R-38 | all | accessible name on every interactive element | SOURCE-READ (script, not mechanized) | every control named | 23 elements checked, 2 heuristic hits both verified false positives | **PASS** | A11Y-19 |
| R-39 | all | every non-ASCII glyph the site shows is covered by the shipped font subsets | FONT-TOOL (`fontTools` cmap) | full coverage | `→` (U+2192) missing from all three subsets, used in 10 visible strings | **FAIL (reported)** | TA-02 |
| R-40 | `/`, `/services` | every price and timeline shared between `HOME_OFFERS` and `OFFERS` agrees | SOURCE-READ (script parsing both array literals) | identical | 4/4 shared tiers identical on price and timeline; only the presentational `priceNote` differs | **PASS** | DATA-01 |
| R-41 | `index.html` | `Organization` JSON-LD email / telephone / `sameAs` / url match `site.js` and the canonical origin | TEST-SUITE | identical | identical | **PASS** | SEO-11 (adjacent) |
| R-42 | `index.html` | `Organization.logo` is a logo, not the 1200×630 social banner | BUILD-INSPECT | a logo image | points at `og-image.png`; no logo file is published | **FAIL (reported)** | SEO-11 |

### SEO and deployment

| Test ID | Target | Feature tested | Method | Expected | Actual | Result | Issue |
|---|---|---|---|---|---|---|---|
| S-01 | 11 shells | every indexable route has a generated shell | TEST-SUITE | 11 shells | 11 shells | **PASS** | — |
| S-02 | 11 shells | title/description/canonical match the metadata source | TEST-SUITE | exact match | exact match on all 11 | **PASS** | — |
| S-03 | `dist/index.html` | static OG description == meta description | TEST-SUITE | equal | were different strings | **FAIL → FIXED** | SEO-05 |
| S-04 | `dist/404.html` | no canonical, exactly one `noindex` | TEST-SUITE | 0 canonical, 1 noindex | 0 canonical, 1 noindex | **PASS** | — |
| S-05 | `src/pages/NotFound.jsx` | a soft 404 does not leave a second robots tag or a stale canonical | SOURCE-READ | one tag, no stale canonical | appended a second tag; left the previous canonical | **FAIL → FIXED** | SEO-09 |
| S-06 | `sitemap.xml` | `<loc>` set == declared routes, no duplicates | TEST-SUITE | exact set | 10 locs, exact set, no duplicates | **PASS** | — |
| S-07 | `sitemap.xml` | `lastmod` not in the future | TEST-SUITE | ≤ today | `2026-10-16` ≤ `2026-10-17` | **PASS** | — |
| S-08 | `robots.txt` | wildcard allow + absolute sitemap on the canonical origin | TEST-SUITE | present | present | **PASS** | — |
| S-09 | `public/_headers` | required security headers present and CSP not weakened | TEST-SUITE | present | present; `script-src` has no `unsafe-inline`/`unsafe-eval` | **PASS** | — |
| S-10 | `public/_redirects` | every route reachable, catch-all last and unique | TEST-SUITE | rule per route ×2 | 20 route rules + one final `/* /404.html 404` | **PASS** | SEO-04 |
| S-11 | `index.html` | JSON-LD parses; no invented ratings/reviews/pricing | TEST-SUITE | 2+ blocks, valid | `Organization` + `WebSite`, valid, no invented fields | **PASS** | — |
| S-12 | case studies | `BreadcrumbList` on case-study shells only | TEST-SUITE | 4 yes, others no | 4 yes, `services.html` no | **PASS** | — |
| S-13 | `index.html` | JSON-LD `<`-escaping prevents `</script>` breakout | SOURCE-READ | escaped | `serializeJsonLd` escapes `<` → `\u003c` | **PASS** | — |
| S-14 | all | `og:image:alt`, `og:type`, `twitter:image:alt` are per-route | BUILD-INSPECT | per-route | identical home tagline on all 11; no `twitter:image:alt` | **FAIL (reported)** | SEO-06 |
| S-15 | all | prerender produces crawlable body content | **BLOCKED** | ≈151 KB of DOM per shell | shells are meta-only here (4,017 B) | **BLOCKED** | SEO-01 |
| S-16 | `scripts/prerender.mjs` | a machine without a browser cannot ship meta-only shells silently | SOURCE-READ | fails the build | `warn(); process.exit(0)` | **FAIL (reported)** | SEO-02 |
| S-17 | all | `VITE_SITE_URL` override reaches every absolute URL | SOURCE-READ | all | reaches per-route shells only, not sitemap/robots/JSON-LD/`og:image` | **FAIL (reported)** | SEO-10 |
| S-18 | live host | deployed metadata, robots, sitemap, deep links, headers | CLI-PROBE (Node `fetch`) | hardened | pre-`854f09a` build: no CSP/XFO/nosniff/Referrer-Policy/Permissions-Policy, `/robots.txt` 404, `/sitemap.xml` 404, `/services` 404, Google Fonts hotlinked | **FAIL** | DEP-01 |

### Performance

| Test ID | Target | Feature tested | Method | Expected | Actual | Result | Issue |
|---|---|---|---|---|---|---|---|
| P-01 | `dist/` | asset sizes and totals | BUILD-INSPECT | — | 67 files, 5,499,411 B; 3D stack is 65.1 % of it | measured | PERF-01/02 |
| P-02 | `dist/assets/*.js` | Rapier WASM is not base64-inlined | BUILD-INSPECT | separate `.wasm` | 2,092,530-char base64 literal → 1,569,397 B of WASM inside a 3.29 MB chunk | **FAIL (reported)** | PERF-01 |
| P-03 | `/` | first-paint graph excludes the 3D stack | BUILD-INSPECT | excluded | excluded from preload/entry, but requested ~2 frames after paint (3.82 MB) | **PARTIAL (reported)** | PERF-02 |
| P-04 | non-home routes | chrome-only libs are not on every route | BUILD-INSPECT | route-scoped | gsap + ogl + framer-motion on every route (233 KB raw / 72 KB br extra) | **FAIL (reported)** | PERF-03 |
| P-05 | all | `_headers` caches fingerprinted assets immutably | TEST-SUITE | rule present | no `Cache-Control` at all | **FAIL → FIXED** | PERF-06 |
| P-06 | all | HTML is not cached immutably | TEST-SUITE | no rule | no `Cache-Control` before `/assets/*` | **PASS** | — |
| P-07 | all | fonts are used and preloaded | BUILD-INSPECT | no dead font | Geist (29,400 B) was shipped and never applied; no `rel=preload` for any font | **FAIL → PARTIALLY FIXED** (Geist now used) | PERF-07, TA-01 |
| P-08 | all | background shader does not run forever at unbounded DPR | SOURCE-READ | bounded | full-viewport `position:fixed` canvas, no DPR cap, paused only by visibility | **FAIL (reported)** | PERF-08 |
| P-09 | all | first paint is not a full-screen black overlay | SOURCE-READ | content or a skeleton | `RouteFallback` is `fixed inset-0 z-[9998] bg-black` | **FAIL (reported)** | PERF-09 |
| P-10 | `/work`, `/work/:slug` | image bytes match the display box | BUILD-INSPECT | close match | two heroes keep ~31–37 % of their downloaded pixels; one is ~1.9× upscaled at DPR 2 | **FAIL (reported)** | PERF-10 |
| P-11 | all | LCP / INP / CLS / TBT / Lighthouse | **BLOCKED** | within CWV thresholds | not measured | **BLOCKED** | — |

### Security

| Test ID | Target | Feature tested | Method | Expected | Actual | Result | Issue |
|---|---|---|---|---|---|---|---|
| X-01 | repo | no hardcoded credentials | SOURCE-READ (grep sweep) | none | none; only comments warning against `VITE_*` secrets | **PASS** | — |
| X-02 | repo | `.env*` ignored, only the template tracked | GIT | ignored | `.env`, `.env.local`, `.env.production` ignored; only `.env.example` tracked; both its values empty | **PASS** | — |
| X-03 | `src/` | no XSS sinks | SOURCE-READ | none | no `dangerouslySetInnerHTML`/`eval`/`document.write`/`innerHTML` write; the one `innerHTML` is a build-time read | **PASS** | — |
| X-04 | `src/` | no open redirect from URL input | SOURCE-READ | none | no `useSearchParams`/`location.search`/`returnTo`; navigations use static targets | **PASS** | — |
| X-05 | `_redirects` | no external or interpolated redirect target | SOURCE-READ | same-origin only | 20 same-origin `.html` rewrites + one 404; no `:splat` | **PASS** | — |
| X-06 | external links | `target="_blank"` has `rel` | SOURCE-READ | 4/4 | 4/4 have `noopener noreferrer` | **PASS** | — |
| X-07 | CSP | directives match the real resource set | SOURCE-READ | exact | `script-src 'self' 'wasm-unsafe-eval'` correct; `connect-src`/`form-action` match the single Formspree endpoint; `img-src`/`font-src` self+data | **PASS** | SEC-09 |
| X-08 | deps | `npm audit` | CLI | documented | 2 moderate, 0 high, 0 critical; both `react-router` advisories **not reachable** (no user-derived navigation target, no SSR) | **PASS (documented)** | SEC-03/04 |
| X-09 | live host | security headers are actually served | CLI-PROBE | served | none served (except Netlify's default HSTS) | **FAIL** | DEP-01 |
| X-10 | SAST (`semgrep`/`codeql`) | scanner findings | **BLOCKED** | — | tools not installed | **BLOCKED** | — |
| X-11 | form | anti-bot controls are enforceable | SOURCE-READ | server-side | client-side only; the endpoint is directly POSTable | **FAIL (reported)** | SEC-05 |

---

## B.5 Coverage summary

| Area | Verified by execution | Verified by reading only | Blocked |
|---|---|---|---|
| Routing / links / metadata plumbing | 12 checks | 6 | 1 |
| Interactive components | 3 | 9 | 2 |
| Contact form | 0 | 7 | 1 (no real submission made) |
| Accessibility | 1 (contrast arithmetic) | 16 | 4 |
| Responsive | 0 | 1 | 1 (all 7 viewports) |
| SEO | 12 | 5 | 1 |
| Performance | 0 | 10 | 1 (all field/lab metrics) |
| Security | 6 | 5 | 1 (scanners) |
| Live comparison | 3 | 0 | 1 (HTTPS headers via curl) |

**Totals: 41 checks executed and passed, 13 executed and failed (10 of them now fixed), 12 blocked.**
Nothing in the "blocked" column is reported as passing anywhere in these deliverables.
