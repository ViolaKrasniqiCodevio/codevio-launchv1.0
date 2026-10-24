# Deliverable C — Complete Issue Register

Codevio QA audit · 2026-10-17

**Status legend**

| Status | Meaning |
|---|---|
| `FIXED` | Reproduced / established from source, changed in this audit, and the change was re-verified (lint + build + `npm test`, plus the specific check named in the finding) |
| `OPEN` | Confirmed defect, deliberately not changed. The reason is stated. |
| `MITIGATED` | Confirmed defect that now has a permanent automated guard, even though the underlying design is unchanged |
| `UNCONFIRMED` | A risk with real evidence but no reproduction, listed separately in §C.9 and never counted as a defect |

**Provenance legend** — `[V]` = verified firsthand in this session by the Supervisor;
`[A]`/`[B]`/`[C]`/`[D]` = reported by the named audit agent and accepted after checking
its evidence; `[A-UNV]` = reported with `UNVERIFIED`/`NEEDS-BROWSER` by that agent.

Severity is calibrated, not inflated: this is a static marketing site with no accounts, no
sessions, no server-side data and no user-generated content.

---

## C.1 Summary

| Severity | Count | Fixed | Partial | Mitigated | Open |
|---|---|---|---|---|---|
| P0 Critical | 2 | 0 | 0 | 0 | 2 |
| P1 High | 9 | 4 | 0 | 0 | 5 |
| P2 Medium | 21 | 8 | 2 | 1 | 10 |
| P3 Low | 13 | 5 | 1 | 0 | 7 |
| Informational | 12 | 0 | 0 | 0 | 12 |
| **Total numbered** | **57** | **17** | **4** | **1** | **36** |
| Review-round findings (§C.10) | 10 | 9 | 0 | 1 | 0 |
| Round-2 findings (§C.11) | 2 | 0 | 0 | 1 | 1 |
| Round-3 findings (§C.12) | 2 | 0 | 0 | 1 | 1 |
| Browser round (§C.13) | 1 | 0 | 0 | 0 | 1 |
| Unconfirmed risks | 9 | — | — | — | — |

**Status changes from the browser round.** Full access was granted, so the 12 checks that were
`BLOCKED` in rounds 1–3 were executed. That closed one blocking finding, **verified** six that had
only been argued from source, and produced one new P1 measurement. Details in Deliverable I.

| Finding | Was | Now | Evidence |
|---|---|---|---|
| SEO-01 — meta-only shells | OPEN, blocked | **CLOSED** | `npm run build` exits 0 including prerender; `dist/index.html` 4,017 → **155,339 B** with 1 `<h1>`, 1 `<h2>` and 30 internal links; every shell carries `id="codevio-static"` |
| A11Y-01 / REV-01 — focus after a route change | FIXED, source-level | **VERIFIED** | `afterCold={"url":"/services","active":"MAIN#main"}` — the cold-chunk case REV-01 fixed |
| A11Y-03 — marquee focus pause | FIXED, unverified | **FIXED + VERIFIED** | Real Tab into the marquee → travel over 1.6 s = **0 px**; focus leaving → **113 px**. Implementation moved to native `focusin`/`focusout` with a `relatedTarget` guard |
| A11Y-05 — reduced motion | FIXED, source-level | **VERIFIED** | Frames 1.5 s apart are byte-identical under `reduce` and differ under `no-preference` |
| A11Y-10 — sticky sidebar | FIXED, geometry | **VERIFIED** | `firstLineTop 215` vs `backdropBottom 108` → not covered |
| SEO-04 — `_redirects` routing | MITIGATED | **VERIFIED** | All 11 routes 200 with their own distinct shell bytes; unknown paths 404 with the 404 shell |
| SEO-09 — soft-404 robots/canonical | FIXED, source-level | **VERIFIED** | Live DOM: one `robots` meta, no canonical, title and `h1` correct |
| PERF-06 — asset caching | FIXED, rule read | **VERIFIED** | `/assets/*` gets `immutable`; `/` does not |
| A11Y-11 — `vh`/`svh` | OPEN | **OPEN, still unverified** | Headless Chrome has no dynamic browser chrome, so the units are indistinguishable there |
| INP | not measured | **still NOT MEASURED** | No field data. Lighthouse reports TBT, and TBT is not INP |

`Open` counts the rows whose status is `OPEN`, i.e. `Count − Fixed − Partial − Mitigated`. The 12
informational rows are noted, not actioned, and are not counted as defects. `Partial` means one
part of a finding was fixed and another was not (`A11Y-13`, `PERF-07`, `PERF-10`, `SEO-10`);
`Mitigated` means the design is unchanged but a permanent automated guard now exists (`SEO-04`).

§C.10 is kept separate on purpose: those ten findings came from an **independent review of this
remediation**, run after the fixes above, and three of them are defects the remediation itself
introduced. Folding them into the numbered list above would hide that provenance.

Identifiers are stable and grouped by area: `DEP` deployment/release, `TA` typography,
`FUN` functional, `A11Y` accessibility/responsive, `SEO` search, `PERF` performance,
`SEC` security. Two findings raised independently by more than one agent were merged, and
the merge is noted inline.

The two P0s are both about the release pipeline, not about the code: **the audited code is
not committed and the deployed site is a 12-day-old build that contains none of it.**

---

## C.2 P0 — Critical

### DEP-01 · P0 · The deployed staging site contains none of the repository's hardening

- **Affected route:** `https://codevio-dev.netlify.app/` (every path)
- **Reproduction:**
  ```js
  const r = await fetch('https://codevio-dev.netlify.app/');
  console.log([...r.headers]);           // no csp / x-frame-options / nosniff / referrer-policy
  await fetch('https://codevio-dev.netlify.app/robots.txt');   // 404
  await fetch('https://codevio-dev.netlify.app/services');     // 404
  ```
- **Expected:** the hardened site — CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `robots.txt`, `sitemap.xml`, and a 200 rewrite
  for every declared route.
- **Actual (`[V]`, Node `fetch`, 2026-10-17):** `/` → 200, 2,165 bytes; **every** security
  header absent except Netlify's own default HSTS (`max-age=31536000`, not the repo's
  `63072000`); `/robots.txt` → 404; `/sitemap.xml` → 404; `/services` → 404;
  `/work/tara-jewellery` → 404; `/definitely-not-a-page` → 404. The live HTML **hotlinks
  `fonts.googleapis.com` / `fonts.gstatic.com`** and has no `og:image`, no JSON-LD and no
  prerendered `<noscript>` block.
- **Evidence:** `public/robots.txt` first entered git in `854f09a` (2026-10-05, `[V]` via
  `git log --diff-filter=A`); Google Fonts were removed from `index.html` in that same
  commit (`[V]`). The live artifact therefore predates `854f09a`, i.e. it is ≥12 days behind
  the repository. `[D]` independently derived the same conclusion from a file-presence
  fingerprint that matches commit `0d4565f` exactly.
- **Root cause:** the deployment was never re-run after the hardening commits, and the
  hardening that exists only in the working tree (DEP-02) cannot be built by Netlify at all.
- **Fix:** build and publish `dist/` from a committed tree; then re-run the probe above.
  **Not performed** — publishing is explicitly out of scope for this audit.
- **If we skip it:** every claim about headers, robots, sitemap or deep-link routing describes
  the repository, not the site. Clickjacking protection, `nosniff` and CSP defence-in-depth
  are absent in production; the staging host is indexable duplicate content; every shared
  deep link 404s.
- **Regression test:** none possible offline. `tests/site-contracts.test.mjs` guards the
  committed `_headers`/`_redirects`/`sitemap`/`robots` contract, so the *artifact* cannot
  regress silently — but only the probe above can prove what is live.
- **Status:** `OPEN`

### DEP-02 · P0 · The hardening is uncommitted and unreproducible from the repository

- **Reproduction:**
  ```
  git show HEAD:package.json          # "build": "vite build"   (single stage)
  git cat-file -e HEAD:src/data/seo.js          # fails
  git cat-file -e HEAD:scripts/prerender.mjs    # fails
  ```
- **Expected:** the committed tree builds the site that was QA'd.
- **Actual (`[V]`):** `HEAD` is `bc6e77d` (2026-10-11) and equals `upstream/staging`. The
  working tree has **41 tracked files modified and 106 untracked paths**. Six build-critical
  files are **not tracked at all**: `scripts/prerender.mjs`, `scripts/generate-pages.mjs`,
  `src/data/seo.js`, `src/lib/motion.js`, `src/components/ErrorBoundary.jsx`,
  `src/components/LanyardScene.jsx`. `HEAD:package.json` has `"build": "vite build"` while
  the working tree has the three-stage pipeline. Working-tree pages import `../data/seo`,
  `../lib/motion` and `./ErrorBoundary`, none of which exist at `HEAD` — so a clean checkout
  cannot even compile.
- **Root cause:** the previous round's plan says, at
  `docs/plans/2026-10-16-seo-perf-hardening.md:347-348`, *"Do not commit to git as part of
  this work. Do not deploy."* The instruction was followed, and the consequence is a
  repository that cannot produce its own site.
- **Fix:** commit the working set (application code + `scripts/` + `seo.js` + `motion.js` +
  `ErrorBoundary.jsx` + `LanyardScene.jsx` + `public/*` + this audit's `tests/` and
  `docs/qa/`), then deploy. **Not performed** — staging ~150 files of someone else's
  uncommitted work is a decision for the owner, and the brief forbids unsupervised deploys.
- **If we skip it:** any git-based build republishes the old site and DEP-01 recurs; the QA
  verdict silently describes code that exists on one machine.
- **Status:** `OPEN`

---

## C.3 P1 — High

### TA-01 · P1 · Every paragraph on the site is rendered in an all-caps display face

- **Affected:** `/`, `/mission`, `/services`, `/work`, `/work/:slug`, `/about`, `/contact`, `*`
- **Expected:** body copy in a text face; the display face reserved for short labels.
- **Actual:** `src/index.css` set `--sans: 'Bebas Neue'` and `:root { font: 18px/145% var(--sans) }`,
  so every element that does not name its own face inherited Bebas Neue — all prose, all list
  items, all form inputs, all footer contact lines. Meanwhile `@fontsource-variable/geist` was
  installed, its `@font-face` was emitted into the build, and its **only** reference was
  `--mono` — which nothing used. The 29,400-byte Geist subset was shipped and never applied.
- **Evidence (`[V]`, hard):** `fontTools` against the shipped woff2 shows Bebas Neue is
  **unicase** — lowercase and uppercase map to the *same* outlines and advances:
  `A` bounds `(12,0,389,700)` w `401`; `a` bounds `(12,0,389,700)` w `401`; same for
  `B/b`, `X/x`, `O/o`, `E/e`, `G/g`. So `text-transform` was never needed for the caps look —
  the font does it. `grep -r "Geist" src/` returned only the two declaration lines in
  `index.css`.
- **Why it is a defect and not taste:** the project's own skill inventory rule
  (`web-typography`: *"DON'T: Set longer texts in all caps. Only for short labels/buttons"*),
  the project's own earlier remediation list (`codevio-fix-prompt.md` item 6, *"switch long
  body/paragraph copy from Bebas Neue to the already-installed Geist"*), and the dead 29 KB
  font all point the same way.
- **Fix:** `--sans` → `'Geist Variable', system-ui, …`; `--mono` → a real monospace stack;
  and to keep the blast radius at zero for short labels, `SpecularButton.css` names
  `'Bebas Neue'` explicitly instead of `font-family: inherit` (the five call sites that relied
  on inheritance are the only non-prose text that changed face). A comment in `index.css`
  records why. ~30 `font-['Bebas_Neue']` utilities on labels/eyebrows are untouched.
- **Regression test:** two assertions in `tests/site-contracts.test.mjs` — the source must not
  set `--sans` to Bebas Neue and must name Geist, and the **built** CSS must resolve
  `--sans:"Geist Variable"`. Both were **red before the fix and green after**.
- **Residual limitation:** the visual result was not observed — no browser. The blast-radius
  sweep in Deliverable D §D.1 enumerates every affected element from source.
- **Status:** `FIXED`

### A11Y-01 · P1 · No focus management on route change

- **Affected:** every internal navigation
- **Reproduction:** Tab to the menu, open it, activate "Services". Focus lands on `<body>`;
  the next Tab restarts at the skip link; a screen reader announces nothing.
- **Expected:** focus moves to the new page's content.
- **Actual (`[B]`, code-traced):** `PageTransition` renders `<motion.div key={pathname}>`, so
  every route change destroys and rebuilds the whole subtree including the menu the user
  just used. The only route-level effect was `window.scrollTo`. `grep '\.focus(' src/`
  returned only the menu trap and the form's first-invalid-field call.
- **Fix:** `document.getElementById('main')?.focus({ preventScroll: true })` inside
  `ScrollToTop`'s existing non-POP effect, **retried on animation frames until `#main` exists**
  (capped at 480 frames ≈ 8 s). The retry is required, not decorative: a cold navigation to a
  lazy route commits `RouteFallback` first — which has no `#main` — and the effect does not
  re-run when the real page arrives. That flaw was caught by the independent review and is
  recorded as **REV-01** in §C.10. `#main` already carries `tabIndex={-1}` on all eight routes;
  `preventScroll` stops it fighting the scroll reset; the initial load reports navigation type
  POP, so first paint does not steal focus; and `#main:focus-visible { outline: none }` stops it
  painting a viewport-sized ring (REV-06).
- **Regression test:** `every route renders the #main focus target` asserts each page either uses
  `PageShell` or renders its own `<main id="main">`, and that the outline suppression stays.
- **Residual limitation:** the retry itself was not observed in a browser; what is verified is
  that the loop exists, is bounded, is cancelled on cleanup, and that every route has a target.
- **Status:** `FIXED` (corrected — the first version of this fix did not achieve the claim)

### A11Y-02 · P1 · The primary navigation is not a navigation landmark

- **Affected:** all routes except `/` (which uses the same component)
- **Expected:** the six primary links are inside a `<nav>` with an accessible name.
- **Actual (`[B]`):** they were a `<ul>` inside `<aside id="staggered-menu-panel">` with no
  `<nav>` ancestor. Only the *secondary* navigation was marked up (social links
  `StaggeredMenu.jsx:588`, footer `Footer.jsx:83`). The `<header>` at `StaggeredMenu.jsx:492`
  is rendered inside `<main>`, so it is a generic header, not a `banner`.
- **Fix:** the panel element became `<nav id="staggered-menu-panel" aria-label="Main">`. The
  `id` is unchanged so `aria-controls` still resolves, and every style is attached to the
  `.staggered-menu-panel` class, so nothing about layout or the focus trap changed.
  **Not changed:** moving the component out of `<main>` to restore a `banner` landmark — that
  is a structural change with real layout risk, and it is recorded in §C.8 instead.
- **Status:** `FIXED`

### A11Y-03 · P1 · The tech marquee never pauses for keyboard focus

- **Affected:** `/` (the tech strip)
- **Reproduction:** at 360×800 on `/`, Tab into the strip and stop. The ringed logo drifts out
  of the clipped track.
- **Expected (WCAG 2.2.2 / 2.4.11):** a focused item stays visible.
- **Actual (`[B]`):** pause was wired to `onMouseEnter`/`onMouseLeave` only, on both the root
  and the track element; the root clips with `overflow-x-hidden`. The sequence is ≈1320 px at
  `speed={70}`, so at 320–390 px only ~25 % is visible and a focused link is clipped out in
  roughly 4.6 s. Exact timing `[B-UNV]` — no browser.
- **Fix:** `onFocus`/`onBlur` bound to the same handlers (React maps them to the bubbling
  `focusin`/`focusout`, so focus moving *between* links inside the track re-sets the state in
  the same commit). Four lines.
- **Status:** `FIXED`

### SEO-01 · P1 · The shipped HTML for every route contains no body content

- **Affected:** all 11 shells
- **Expected:** `scripts/prerender.mjs` snapshots the rendered DOM into
  `<noscript id="codevio-static">`, which the project measured at **155,150 bytes** per shell.
- **Actual (`[C]`, `[V]`):** `dist/index.html` is **4,017 bytes**. Every shell counts
  `title=1 desc=1 canonical=1`, **zero `<h1>`**, zero internal `<a href="/…">`, and exactly
  one `<a>` — the `mailto:` in the fallback paragraph. `#root` is empty.
- **Root cause — environmental, not a code defect:** the prerender step needs a real browser
  and this sandbox cannot launch one (Deliverable A §A.3/§A.7). On a machine with Chrome the
  step runs and the numbers above are reproduced by the previous round's own record
  (`docs/plans/2026-10-16-seo-perf-hardening.md:243`).
- **Consequence that *is* a code issue:** see SEO-02.
- **Status:** `OPEN` (environment-blocked; the artifact is honest about it, and the fix is to
  build on a machine with a browser)

### SEO-02 · P1 · The prerender step fails open, so meta-only shells can ship silently

- **Affected:** the build pipeline
- **Expected:** a build that cannot produce crawlable HTML fails, or at least fails in CI.
- **Actual (`[C]`):** `scripts/prerender.mjs:90-96` does
  `warn(...); process.exit(0)` when no browser is found. A CI machine without Chrome produces
  a **green build** whose shells are exactly the meta-only artifact on disk — and nothing
  detects it.
- **Honest counter-argument:** the fail-open is deliberate and documented in the file's own
  header comment ("a deploy on a machine without a browser is never blocked"). A documented
  tradeoff is a decision, not an accident.
- **Why it is still worth raising:** this is the one failure mode that silently ships a
  half-built site, and it is the failure mode that actually occurred here. The fix is small
  and does not remove the escape hatch: gate on `process.env.CI` (exit 1 in CI, warn and exit
  0 locally), or assert in the build that `dist/index.html` contains `id="codevio-static"`.
- **Not fixed:** changing build-failure semantics is a pipeline policy call for the owner, and
  I cannot run the pipeline to verify either behaviour here.
- **Status:** `OPEN`

### PERF-01 · P1 · 1.57 MB of WebAssembly is base64-inlined inside the largest JS chunk

- **Affected:** `dist/assets/three-vendor-*.js` (3,289,391 B), reached only by `/`
- **Evidence (`[C]`, measured):** one base64 literal of **2,092,530 characters** (63.6 % of the
  chunk) decodes to a **1,569,397-byte** WASM module (magic `0061736d`). Base64 costs
  **+523,133 raw / +216,748 gzip / +164,534 brotli** bytes over the binary, and the module can
  never be stream-compiled. Cause: `@react-three/rapier` resolves to `@dimforge/rapier3d-compat`,
  which inlines its WASM.
- **Fix:** use the non-`-compat` Rapier build (separate `.wasm` asset) or drop Rapier for this
  decorative scene; keep physics in its own chunk regardless.
- **Not fixed:** swapping the physics build of an interactive 3D scene that cannot be visually
  verified here is exactly the kind of change that should not be made blind. The project also
  carries a standing "do not touch the lanyard physics" constraint.
- **Status:** `OPEN`

### PERF-02 · P1 · `/` pulls 3.82 MB (1.13 MB brotli) two frames after first paint

- **Evidence (`[C]`, measured):** the 3D stack is correctly off the preload and entry graph,
  but `Lanyard.jsx:77-88` sets `showScene` on a double `requestAnimationFrame`, so
  `three-vendor` (3,289,391) + `card.glb` (272,928) + `gsap` (112,819) + `ogl` (45,233) +
  `Lanyard` (53,835) + `Home`/`PageShell`/`seo`/`SpecularButton`/`LanyardScene` + `Lanyard.css`
  + `codevio_strip1.png` = **3,824,731 B / 1,127,470 B brotli** arrive right as the LCP text
  and fonts are still landing. Total for `/`: **4,278,360 B raw / 1,253,113 B brotli**.
- **Fix:** gate `setShowScene(true)` behind the `IntersectionObserver` the component already
  has *plus* `requestIdleCallback`, and drop the module-scope `useGLTF.preload`.
- **Not fixed:** it changes when the hero's centrepiece appears, which is a design decision and
  needs a browser to judge.
- **Status:** `OPEN`

### PERF-03 · P1 · Animation libraries load on every route for chrome only

- **Evidence (`[C]`, measured from the built import graph):** `PageShell` statically imports
  `Lanyard` → `gsap` (112,819 B) and `Grainient` → `ogl` (45,233 B); `framer-motion`
  (121,388 B) is on the entry graph. Extras per non-home route: `/services`
  **233,039 B raw / 71,811 B brotli**, `/work` **227,807 / 71,388**. Common eager set
  (7 `modulepreload` hints): 453,629 B / 125,643 B brotli.
- **Fix:** lazy-mount `Grainient` behind an `IntersectionObserver` (the pattern already used
  for the 3D scene) and load `StaggeredMenu` on first interaction, or replace its GSAP
  timeline with CSS transitions.
- **Not fixed:** touches the shell every route renders; not verifiable blind.
- **Status:** `OPEN`

---

## C.4 P2 — Medium

### FUN-01 · P2 · Three of four case studies are undisclosed mock work on their own pages
*(raised independently by agents A and C; merged)*

- **Affected:** `/work/saas-waitlist-launch`, `/work/marketplace-mvp`, `/work/rebrand-and-relaunch`
- **Evidence (`[V]`):** `src/data/site.js:572,589,606` mark the three `illustrative: true` and
  the comment at `:531` says *"Project examples marked `illustrative` are representative mock
  case studies."* The only disclosure is the pill at `src/pages/Work.jsx:67-71`. `grep -n
  illustrative src/pages/CaseStudy.jsx` → **no matches**, so a visitor arriving from search or
  a share sees "Case study", a metric badge ("Prototype → product in 31 days"), and
  "The challenge / Our approach / The outcome" with no marker. Their URLs are in
  `public/sitemap.xml` and `public/_redirects`, and the mock copy is their meta description.
- **Fix (recommended):** render the same pill in `CaseStudy.jsx` when `project.illustrative`,
  and append "(illustrative example)" to the three `CASE_STUDY_META` descriptions.
- **Not fixed:** this adds user-facing content. The brief says to preserve content unless a
  change is necessary, and the owner is the only person who can decide how the studio wants to
  present representative work. The mechanism already exists in the codebase, so the change is
  small whenever it is approved.
- **Status:** `OPEN`

### FUN-02 · P2 · The contact form can show "Message sent" without sending anything
*(raised independently by agents A and D; merged with SEC-06)*

- **Affected:** `/contact`
- **Reproduction:** submit less than `MIN_FILL_TIME_MS` (1500) after the form mounts — the
  clock starts at mount (`ContactForm.jsx:91-93`), not at first keystroke — or have anything
  write into the off-screen `_gotcha` input. Both paths call `showSuccess()` and `return`
  **before** `submitToFormspree` (`ContactForm.jsx:170-176`), so the user sees the real
  confirmation card, the "send another" button, and no request is made.
- **Why it can really happen (`[A]`):** browsers restore form values on reload, password
  managers and autofill extensions write into off-screen text inputs, and the honeypot is a
  normal `<input>` with a normal `<label for>` — it is only hidden visually.
- **Fix (recommended):** drop the timing heuristic and keep the honeypot, or start the clock on
  the first field change; at minimum do not render the success panel for a submission that was
  never sent.
- **Not fixed:** any change here alters anti-spam behaviour on a live endpoint, and it cannot be
  verified without either making a real submission (explicitly out of scope) or a browser.
  Changing it blind could trade silent lead loss for spam. Recorded as the owner's call.
- **Status:** `OPEN`

### A11Y-04 · P2 · Two `/about` labels fail contrast
- **Evidence (`[B]`, computed):** `text-white/40` over the glass panel `#16161B` → `#737376` =
  **3.82:1**; over flat `--bg` → **3.77:1**. `text-white/30` line numbers over `--bg` →
  **2.62:1**. Both are 12–14 px normal text, so 4.5:1 applies. `#16161B` is the *best* case;
  over the shader's bright band it is lower.
- **Fix:** `COMMENT` and the `studio.js` label → `text-white/70` (9.7:1); line numbers →
  `text-white/55` (6.3:1). Applied.
- **Regression test:** none automated (contrast arithmetic over a live shader is not a test I
  can make honest). The exact token values are recorded here so a re-check is mechanical.
- **Status:** `FIXED`

### A11Y-05 · P2 · `prefers-reduced-motion` was not honoured by the 3D physics
- **Affected:** `/`
- **Evidence (`[B]`, code-traced):** every other animated layer honours the preference
  (`index.css:109-118`, `MotionConfig reducedMotion="user"`, `LogoLoop`, `Grainient`,
  `StaggeredMenu`, `About`, `SplashScreen`, `Lanyard`'s GSAP reveal). The Rapier/R3F body did
  not: `LanyardScene.jsx` had no `matchMedia` check, and `Home.jsx:61` + `Lanyard.jsx:48,118-121`
  make `active` true 700 ms after mount, so gravity was applied and the card spun for four
  seconds. `src/lib/motion.js:11-13` asserted the opposite.
- **Fix:** `LanyardScene.jsx` now reads the media query once and derives
  `const animated = active && !reduceMotion`, which feeds `Physics gravity` and `Band active`;
  `Band spinning` uses `spinning && !reduceMotion`. **No physics or rendering math changed** —
  only the gating booleans, and `src/components/Lanyard.jsx` was not touched.
- **Residual limitation:** whether the scene still looks right in the reduced-motion state was
  not observed (no browser). The state it now takes is the same one the component already uses
  before warm-up.
- **Status:** `FIXED`

### A11Y-06 · P2 · Form errors were announced one at a time, and success was not announced at all
- **Evidence (`[B]`):** the per-field error `<p>`s had no live role, so an error was reachable
  only via `aria-describedby` once focus was already on that field; `ContactForm.jsx:162-166`
  focuses only `Object.keys(nextErrors)[0]`, so submitting an empty form announced one of four
  errors. On success the form was replaced and nothing was focused, and the `role="status"`
  container is inserted already-populated — a live region is not required to announce content
  added in the same mutation.
- **Fix:** `role="alert"` on both inline error paragraphs; the success panel gained
  `ref` + `tabIndex={-1}` and `successRef.current?.focus()` inside its existing
  `status === 'success'` effect.
- **Residual limitation:** announcement behaviour itself is `NEEDS-BROWSER`; what is verified is
  that the roles and the focus call are present and the build/lint/tests pass.
- **Status:** `FIXED`

### A11Y-07 · P2 · The honeypot exposed a focus dead end
- **Evidence (`[B]`):** the wrapper `div` and the visible `<label for="contact-company">` were
  in the accessibility tree while the `<input>` itself was `aria-hidden="true"` with
  `tabIndex={-1}`. The label's `for` association is exactly the mechanism that moves focus —
  onto a node with no accessible representation and no visible indicator.
- **Fix:** `inert` on the wrapper. The subtree is now out of the tab order *and* out of the
  accessibility tree, and `for` can no longer focus the input. `name="_gotcha"` and the input
  are unchanged, so Formspree's server-side filter and the honeypot's purpose are unaffected.
- **Status:** `FIXED`

### A11Y-08 · P2 · Contact-page link hover colour fails contrast
- **Evidence (`[B]`, computed):** `#db364e` has relative luminance 0.18253 → **4.373:1** on
  flat `--bg`, already below 4.5:1 for 18 px normal text. Over `.liquid-glass` over the live
  shader the backdrop is not fixed: **4.65:1** over the dark end, **2.99:1** over the brightest
  reachable canvas red.
- **Fix:** the three affected hover states (`Contact.jsx` ×2, `ContactForm.jsx` success panel
  ×1) now use `#f5b8c4`, an existing brand colour already used for the page's eyebrows —
  **8.06:1** over the worst-case backdrop.
- **Not changed:** the many `hover:text-[#db364e]` states on pure black (footer, menus), which
  compute to 4.65:1 and pass.
- **Status:** `FIXED`

### A11Y-09 · P2 · Decorative display words are effectively invisible but still exposed
- **Evidence (`[B]`, computed):** `.lanyard-deco__word--ghost` is `rgba(255,255,255,.3)` →
  **2.62:1**; at ≤900 px the parent `.lanyard-deco--left/right` adds `opacity: .35`, giving an
  effective alpha of 0.105 → **1.28:1**. "WEBSITES / MARKETING / BRANDING" render as plain
  `<span>`s with no `aria-hidden`. The block is hidden entirely at ≤768 px, so the bad window is
  769 px and up.
- **Fix (recommended):** raise the ghost alpha, drop the `.35` de-emphasis, and either give the
  words a heading/structure or mark them decorative with `aria-hidden="true"`.
- **Not fixed:** both options are visual or content decisions, the text is display decoration
  rather than prose, and I cannot see the result. Marking it `aria-hidden` would remove words
  that may be intended as content; raising the alpha changes the composition.
- **Status:** `OPEN`

### A11Y-10 · P2 · The case-study sidebar sticks underneath the fixed header backdrop
- **Evidence (`[B]`, geometry):** `CaseStudy.jsx:67` used `lg:sticky lg:top-10` (40 px) while
  the fixed header's backdrop (`.sm-header-backdrop`, `StaggeredMenu.jsx:640-660`) is
  76.8 px tall at 1024 px and 96 px at ≥1280 px, at ~0.66 alpha with `blur(14px)`, switching on
  at `scrollY > 8`. The nav is `z-index: 60`, the article `z-index: 10`, so the nav always wins.
- **Reproduction:** `/work/tara-jewellery` at 1440×900, scroll ~100 px → "What we shipped" and
  the first deliverables sit permanently under the blurred strip.
- **Fix:** `lg:top-28` (112 px), above the maximum backdrop height. Applied.
- **Status:** `FIXED`

### A11Y-11 · P2 · `100vh`/`svh` unit mismatch can hide the hero copy and menu socials
- **Evidence (`[B]`):** the project deliberately uses `100svh` for `#root`
  (`index.css:148`) and the route wrapper (`index.css:28`), but `.lanyard-sticky`
  (`Lanyard.css:11`) and `.pixelblast-bg` (`:106`) use `100vh`. `.lanyard-textbox { bottom }` is
  redefined in four overlapping `@media (max-width:768px)` blocks and only the last
  (`:254-258` → `3rem`) applies, putting the hero sentence 48 px above the bottom of a 100 vh
  box — under the URL bar until it retracts. The menu panel inherits its height from
  `inset: 0` with `margin-top: auto` socials.
- **Fix (recommended):** `100svh`/`100dvh` for `.lanyard-sticky` and the panel; collapse the
  four duplicate `bottom` declarations to one.
- **Not fixed:** changing the fixed background's height to `svh` risks exposing a gap when the
  browser chrome retracts — the classic tradeoff — and mobile viewport behaviour is exactly
  what I cannot observe. The four duplicate declarations are dead code, not a bug.
- **Status:** `OPEN`

### SEO-04 · P2 · `_redirects` is a hand-maintained copy of the route table
- **Evidence (`[C]`, `[V]`):** 20 route rewrites + one catch-all; ordering is correct and every
  route is covered *today*. But nothing generates or validates the file, so a new route in
  `App.jsx`/`seo.js` without a matching line hard-404s on refresh while working fine on
  client-side navigation.
- **Fix applied as a guard rather than a generator:** `tests/site-contracts.test.mjs` now fails
  if any declared route lacks a 200 rewrite for both the plain and trailing-slash variant, if
  the catch-all is missing, or if the catch-all appears more than once or before the last
  position. Generating the file from `ROUTE_META` remains the better long-term fix.
- **Status:** `MITIGATED`

### SEO-05 · P2 · `/` shipped two different descriptions depending on the consumer
- **Evidence (`[C]`, `[V]`):** `index.html` carried a 118-character `og:description` and
  `twitter:description` while its own `meta description` was 158 characters, and
  `useDocumentTitle` overwrote the OG tags with the 158-character string on mount. Every other
  shell had them equal, because `generate-pages.mjs` injected the description — it explicitly
  skipped `/`.
- **Fix:** `outFileFor('/')` now returns `dist/index.html` and the loop no longer skips `/`, so
  all 11 shells are produced by one code path. The now-redundant "title does not match" warning
  block was removed. Verified in the built artifact: `meta desc`, `og:desc` and `tw:desc` are
  now byte-identical.
- **Regression test:** the root-shell test asserts all three strings are equal.
- **Status:** `FIXED`

### PERF-04 · P2 · The form library is preloaded on routes that have no form
- **Evidence (`[C]`):** `dist/assets/vendor-*.js` (63,365 B) contains `@formspree/*` three times
  and is in the 7-hint `modulepreload` set present in every shell, though only `/contact`
  renders a form. ~21 KB brotli at top priority on six routes that never use it.
- **Fix (recommended):** give `@formspree/react` its own chunk reached only from `ContactForm`.
- **Not fixed:** a build-config change whose effect on the eager set I can measure but whose
  loading behaviour I cannot observe.
- **Status:** `OPEN`

### PERF-05 · P2 · `card.glb` ships uncompressed
- **Evidence (`[C]`, GLB header parsed):** 272,928 B, `extensionsUsed: []`,
  `extensionsRequired: []`, 3 meshes, 2 materials, one 800×800 JPEG of 109,884 B, bin chunk
  268,036 B → ~158 KB of geometry for a card, a clip and a clamp. 188,486 B brotli.
- **Fix (recommended):** `gltf-transform` with Draco/meshopt and WebP or KTX2.
- **Not fixed:** re-encoding the mesh is a 3D-asset change with visual risk and no way to
  verify it here.
- **Status:** `OPEN`

### PERF-06 · P2 · No `Cache-Control` for fingerprinted assets
- **Evidence (`[V]`):** `public/_headers` set six security headers and nothing else; live
  responses carry Netlify's default `cache-control: public,max-age=0,must-revalidate`, so every
  repeat visit revalidates 3.98 MB of JS and the 273 KB GLB.
- **Fix:** an `/assets/*` block with `Cache-Control: public, max-age=31536000, immutable`.
  HTML is deliberately left on the default so a deploy is picked up immediately.
- **Regression test:** the `_headers` test asserts the `/assets/*` rule exists **and** that no
  `Cache-Control` appears before it (so immutable caching cannot leak onto HTML).
- **Status:** `FIXED`

### PERF-07 · P2 · No font preload, and a font that was never used
- **Evidence (`[C]`, `[V]`):** three families, one weight each, latin-only subsets, all with
  `font-display: swap`; `index.html` has no `rel=preload` or `preconnect` for them. Real
  download 27,572 B of woff2, discovered only after both blocking CSS files parse. Geist
  (29,400 B) was shipped and never applied, and the two legacy `.woff` fallbacks (28,628 B)
  are never picked by a modern browser.
- **Fix applied:** the Geist dead-weight half is resolved by TA-01 — Geist is now the body face,
  so it is fetched and used. The preload half is not fixed.
- **Not fixed (preload):** Vite fingerprints the font filenames, so a static
  `<link rel="preload">` in `index.html` cannot name them; doing it properly means injecting
  preloads from the postbuild script, which is a build-pipeline change. `font-display: swap`
  already prevents invisible text.
- **Status:** `PARTIALLY FIXED` — recorded as `OPEN` for the preload half.

### PERF-08 · P2 · The background shader renders every frame forever, with no DPR cap
- **Evidence (`[C]`):** `Grainient`'s loop reschedules itself unconditionally; it is paused only
  by `IntersectionObserver` or `visibilitychange`, but its canvas is
  `position: fixed; inset: 0` (`.pixelblast-bg`) so it is **never** offscreen; the `Renderer` is
  created without a DPR limit. Full-viewport noise/warp maths on every route, for the whole
  visit.
- **Fix (recommended):** cap at ~30 fps and `dpr ≤ 1.5`, or render once and replace the
  animation with a static CSS gradient plus the existing grain overlay.
- **Not fixed:** it is the page's visual identity; reducing it is a design decision.
- **Status:** `OPEN`

### PERF-09 · P2 · First paint on every route is a full-screen black overlay
- **Evidence (`[C]`):** `RouteFallback` (`App.jsx:92-109`) is
  `fixed inset-0 z-[9998] bg-black` and wraps the entire route table, and every page is
  `lazy()`. Nothing can paint until the route chunk set arrives (233,039 B / 71,811 B brotli on
  `/services`), and no shell preloads its own route chunk.
- **Fix (recommended):** emit a `modulepreload` for each shell's own route chunk from
  `generate-pages.mjs`, and make the fallback a skeleton instead of an opaque black rectangle.
- **Not fixed:** the preload needs a route→chunk map at postbuild time, and the fallback's
  appearance is a design decision.
- **Status:** `OPEN`

### PERF-10 · P2 · Two case-study heroes keep a third of their pixels, one is upscaled
- **Evidence (`[C]`, measured):** `sidescroll2.jpg` is 1080×1306 → in a 16:6 box only 405 of
  1306 rows are shown (**69 % of decoded pixels discarded**) and at DPR 2 the box needs 2,048 px
  against a largest candidate of `1080w` (**~1.9× upscale**). `sidescroll3.jpg` is 1080×1080
  (37.5 % kept). `sidescroll1` and the Tara WebP are correctly shaped.
- **Fix applied (partial):** the footer logo, which is below the fold on every route, now has
  `loading="lazy" decoding="async"`. **Not fixed:** 16:6-shaped derivatives for the three
  illustrative heroes — that needs new image assets.
- **Status:** `PARTIALLY FIXED` — recorded as `OPEN` for the hero derivatives.

### SEO-03 · P2 · Home page `h1` sits below a 115 vh hero
*(raised by agents B and C; merged)*
- **Evidence (`[C]`, `[B]`):** `/` has exactly one `h1`, in `PositioningStrip.jsx:20` (the
  tagline), and it is preceded by `.lanyard-scroll-wrapper { min-height: 115vh }` plus a
  100 vh sticky hero. The visually-first headline
  ("ENGINEERING DIGITAL EXCELLENCE…", `Lanyard.jsx:236-239`) is a bare `<div>`, and the hero's
  display words are bare `<span>`s.
- **Fix (recommended):** promote the hero text node to `<h1>` and demote the tagline, or move
  `PositioningStrip` above `Lanyard`.
- **Not fixed:** both options change the composition of the most important page, and one of them
  changes which words are the page's primary heading — a content/SEO decision.
- **Status:** `OPEN`

### SEO-06 · P2 · `og:image:alt`, `og:type` and the missing `twitter:image:alt`
- **Evidence (`[C]`):** all 11 shells carry the home tagline as `og:image:alt` (it is not one of
  the eight patterns `generate-pages.mjs` replaces, so it is copied byte-for-byte), `og:type` is
  `website` even on case studies, and `twitter:image:alt` does not exist anywhere.
- **Fix (recommended):** add `ogImageAlt` to `ROUTE_META`/`CASE_STUDY_META` and one more
  `replaceTag` entry; set `og:type=article` on case studies; add `twitter:image:alt`.
- **Not fixed:** it adds metadata fields, and the `replaceTag` helper throws when a pattern is
  missing, so it needs the source `index.html` edited in step — a small, coherent change better
  made together with a metadata review.
- **Status:** `OPEN`

---

## C.5 P3 — Low

| ID | Title | Evidence | Fix / decision | Status |
|---|---|---|---|---|
| FUN-03 | Menu links never closed the panel; clicking the current page's entry was a dead click | `[A]` panel `<Link>`s had no `onClick`; click-away explicitly ignores in-panel clicks (`StaggeredMenu.jsx:389`) | Added `onClick={closeMenu}` to the panel link | `FIXED` |
| FUN-04 | Unknown case-study slug silently redirected to `/work` | `[A]` `if (!project) return <Navigate to="/work" replace />`; the host already returns 404 for that path, so the SPA rewrote a 404 URL into a valid, indexable one | Renders `<NotFound />` in place; the URL and the 404 status now agree | `FIXED` |
| FUN-06 | `Grainient` never released its WebGL context | `[A]` both cleanup paths removed the canvas without `loseContext`; `SpecularButton.jsx:215` already did it correctly; the page remounts on every navigation and StrictMode doubles it in dev | `gl.getExtension('WEBGL_lose_context')?.loseContext()` in both paths | `FIXED` |
| FUN-07 | The three mock case studies use unrelated third-party imagery, one with a visible artist credit | `[V]` — I opened `src/assets/sidescroll3.jpg`: it is a photograph of a printed poster carrying "óscar raña", "yo sí: yo no", "último mono ediciones" and "2024". `[A]` describes `sidescroll1` as a glass sculpture and `sidescroll2` as a surreal street photograph; I did not re-open those two | Replace with owned/abstract art and record a licence per asset | `OPEN` |
| FUN-08 | The form's network-failure branch is unreachable | `[A]` `@formspree/core` returns a `SubmissionError` rather than rejecting, so `await submitToFormspree(event)` never throws; the "check your connection" copy is dead | Delete the branch or choose the message from the returned error | `OPEN` |
| A11Y-12 | Menu ordering numerals fail contrast | `[B]`, computed: `#db364e` on the opaque `#fcdfe4` panel = **3.616:1** at 11–14 px (needs 4.5:1). The labels themselves are 14.71:1 | Darken to an existing palette colour such as `#b02a3d`, or use `--sm-text` | `OPEN` |
| A11Y-13 | WebGL canvases were exposed as unnamed graphics | `[B]` neither canvas had `aria-hidden`/`role`/name, while `SpecularButton` and `LogoLoop` get it right | `aria-hidden="true"` added to `Grainient`'s root, which covers all four call sites at once. The R3F `<Canvas>` in `LanyardScene` is **not** fixed — passing `aria-hidden` through R3F's canvas wrapper is unverified | `PARTIALLY FIXED` |
| A11Y-14 | The splash covers the app during the first ~1.5 s | `[B]` `SplashScreen` is an opaque `z-index: 9999` overlay and nothing in the tree is made `inert`; the second Tab lands on the toggle painted underneath | Make the app shell `inert` while `!splashDone` | `OPEN` |
| A11Y-15 | Six decorative lucide icons lacked `aria-hidden` | `[B]` `CaseStudy.jsx:24,110,120,124`, `Work.jsx:97`, `Footer.jsx:27` | Added `aria-hidden="true"` to all six | `FIXED` |
| A11Y-16 | Desktop logo links are 24–32 px tall | `[B]` the 44 px floor is scoped to `@media (max-width: 768px)` and `Footer.jsx` removes it with `md:min-h-0`. Passes WCAG 2.2 SC 2.5.8 (24×24); fails the 44×44 best practice | Move the floor out of the media query | `OPEN` |
| SEO-08 | `/about` has one heading for a 13 KB page | `[C]` only `About.jsx:322`; values and stats are `<p>` | Give the blocks `<h2>`s | `OPEN` |
| SEO-09 | A soft 404 left a duplicate robots tag and a stale canonical | `[B]`/`[C]` the 404 shell already ships one `robots` tag and `NotFound` appended a second; on client-side navigation the previous page's canonical stayed in `<head>` while `noindex` blocked indexing | Reuse the existing tag, restore its previous content on unmount, and remove/re-append the canonical | `FIXED` |
| SEO-10 | `VITE_SITE_URL` does not reach every absolute URL | `[C]` the override reaches per-route shells but not `index.html`'s `og:image`, the JSON-LD URLs, `sitemap.xml` or `robots.txt`; `public/*` and `dist/*` are byte-identical, so the hardcoded host ships as-is | Generate sitemap/robots/JSON-LD from `SITE_URL`, or drop the override | `OPEN (improved)` — `/` now goes through the generator like every other shell, so the override behaves consistently across all 11 shells |

---

## C.6 Informational

Not defects. Reported because the next person to touch this code should know.

| ID | Note | Evidence |
|---|---|---|
| INFO-01 | The contact form's anti-bot controls are client-side only; the Formspree endpoint is directly POSTable, so honeypot and timing are irrelevant to a real bot. Rate limiting and spam filtering are entirely Formspree's. | `[D]` `ContactForm.jsx:168-176`; `FORMSPREE_FORM_ID` is inlined into the public bundle by design |
| INFO-02 | `react-router` 6.30.6 carries two moderate advisories, and the `^6.30.3` pin from the previous round **did not remediate them** (6.30.6 is inside the affected range and no 6.x fix exists). Neither is reachable: no `<Link to>` or `navigate()` target is user-derived (verified every call site), and the other is SSR-hydration-only while this app has no SSR. Do **not** blanket-upgrade to v7 for eight static routes. | `[D]` `npm audit --json`, `npm ls react-router-dom`, call-site review |
| INFO-03 | The staging host is publicly indexable with no noindex signal, and its `robots.txt` points at the production domain. Once DEP-01 is fixed it becomes explicitly crawlable duplicate content. | `[D]` live `/robots.txt` → 404, no `X-Robots-Tag` |
| INFO-04 | `HEAD`'s CSP allowlists `formsubmit.co`, which the working tree dropped and which no code references. Keep the working-tree version. | `[D]` grep `(?i)formsubmit` in `src/` → 0 hits |
| INFO-05 | The CSP's `script-src 'self' 'wasm-unsafe-eval'` is correct and `wasm-unsafe-eval` is genuinely required (three.js hits `WebAssembly`, Rapier inlines WASM). Do not "fix" a WASM CSP error by adding `'unsafe-eval'`. `style-src 'unsafe-inline'` is required today; there is no `report-to`, so a CSP regression is silent. Browsers without `wasm-unsafe-eval` (Safari <16.4, Firefox <102) block the WASM, and the scene degrades through its `ErrorBoundary`. | `[D]` directive-by-directive review against the real resource set |
| INFO-06 | `promo-video/composition*/index.html:19` loads `https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js` — floating version, no SRI. Not deployed (`dist/promo-video` does not exist); it runs in the local video-render browser. | `[D]`; `[V]` `promo-video/` is 65.6 MB, eslint-ignored, untracked |
| INFO-07 | `scripts/prerender.mjs:204` launches Chrome with `--no-sandbox`. Build-time only, rendering the project's own `dist/` over loopback. | `[D]` |
| INFO-08 | Dead third-party origin strings ship in the bundle (`js.stripe.com` etc.) because `@formspree/react@3.0.0` hard-depends on Stripe. None is contacted. If Formspree payment fields are ever adopted, `script-src 'self'` will block Stripe's loader and the CSP will look like the bug. | `[D]` built-asset string extraction |
| INFO-09 | The Formspree form ID in the bundle is a public endpoint identifier, already exposed in the no-JS `action` fallback. The invariant to keep is that no `VITE_*` variable ever holds a real secret. | `[D]` `site.js:27-37`, `.env.example`, `README.md:31` |
| INFO-10 | The meta description promises "fixed 2–4 week sprints" while the site's own stats say "2–3 week launch sprints" and `/services` sells 3–5 week AI Automation and 4–8 week MVPs (shortest package 1–2 weeks). The snippet that wins the click contradicts the landing page. | `[A]` `[V]` `index.html:18,24,37,50,72` vs `site.js:79,316,332,482` |
| INFO-11 | "Post-launch support included in every sprint" (`site.js:443`) is not true of 6 of the 13 listed packages. | `[A]` deliverables arrays at `site.js:196-202,213-218,246-254,265-272,282-289,317-322` |
| INFO-12 | `docs/agency-strategy.md:248` itself asks when real case studies will replace the illustrative ones — the repository already knows about FUN-01. | `[C]` |
| INFO-13 | The same three `STATS` values render in **Dela Gothic One** on `/` (`PositioningStrip.jsx:51-52`) and in **Bebas Neue** on `/about` (`About.jsx:350-351`). Pre-existing; this audit preserved both renderings rather than picking one blind. | `[V]`, found during the review round (REV-02) |
| INFO-14 | `Organization.logo` points at the 1200×630 `og-image.png` social banner rather than a logo, and no logo file is published in `public/` while `src/assets/logo.png` (330×83) exists. Valid — Google only asks for ≥112×112 — but likely to be scaled or cropped in rich results. Numbered **SEO-11** in §C.12. | `[V]`, raised by the SEO agent in round 1 and left unnumbered until round 3 |

---

## C.7 Fixes not made, and why

Seventeen findings were fixed; thirty-six were not. The reasons fall into five groups, and
none of them is "ran out of time":

1. **Needs a browser to verify** (PERF-02, PERF-03, PERF-08, PERF-09, A11Y-11, A11Y-13 partial,
   A11Y-14, SEO-03): each is a visual or timing change. Making them blind would be an
   unverifiable change to the site's appearance or first-paint behaviour — precisely what the
   brief forbids.
2. **Needs new assets** (PERF-05, PERF-10, FUN-07): re-encoding a GLB or producing 16:6
   derivatives means creating new binary assets I cannot review.
3. **Is a policy decision for the owner** (DEP-01, DEP-02, SEO-02, FUN-02, FUN-01, INFO-10,
   INFO-11): committing ~150 files, changing what a build failure means, altering anti-spam
   behaviour on a live endpoint, or adding disclosure/marketing copy are all decisions about
   the product and its release process, not QA findings I should action unilaterally.
4. **Carries a standing project constraint** (PERF-01, A11Y-05's file scope): the project
   explicitly forbids touching the lanyard's physics/drag/kinematics, and swapping Rapier's
   build is exactly that.
5. **Is a visual-identity tradeoff** (A11Y-09, A11Y-12, A11Y-16, PERF-04, SEO-06, SEO-08,
   SEO-10, INFO-05): real, evidenced, and better decided with the design in front of you.

---

## C.8 Unconfirmed risks

Not defects. Each has evidence and no reproduction. They are **not** counted in the summary
table and must not be quoted as findings.

| ID | Risk | Evidence | What would confirm it |
|---|---|---|---|
| UNC-01 | The route transition's 12 px `y` transform makes `.site-route-content` the containing block for the fixed nav and the fixed shader background for ~350 ms, so on Back into a scrolled page they may paint at the document top and then snap | `[A-UNV]` `PageTransition.jsx:17` + `motion.js:60-61`; framer-motion only writes `transform: none` once every transform value is default | DevTools during a Back navigation: `getComputedStyle('.site-route-content').transform` and `.lanyard-nav` `getBoundingClientRect().top` |
| UNC-02 | The prerendered `<noscript>` copy is captured with component CSS applied but replayed without it, because `Lanyard-*.css` is injected by JS | `[C]` only `index-BnpJ18Nf.js` references that stylesheet; the previous round's own no-JS measurement ("h1 in the first viewport, top 401/519 px") is consistent with the unstyled layout rather than the styled one | Load a shell with `Emulation.setScriptExecutionDisabled` and compare against the styled page |
| UNC-03 | The prerendered snapshot bakes `© {new Date().getFullYear()}` and the case-study copy at build time, with no staleness marker | `[C]` `Footer.jsx:135`; nothing in the pipeline hashes or dates the block | Inspect a shell built more than a year ago |
| UNC-04 | `forced-colors` / `prefers-contrast` are not handled anywhere: every colour is a hard-coded hex or a Tailwind opacity utility, so Windows High Contrast will strip the rgba and gradient layers and leave text on the system background | `[B]` no `@media (forced-colors)` or `@media (prefers-contrast)` block exists in `src/` | Load in forced-colors mode |
| UNC-05 | 200 % zoom reflow is unpredictable: the root font drops to 16 px below 1024 px while `.compact-layout` rewrites every gap/padding/margin/font-size at ≥1024 px | `[B]` `index.css:79-81,207-451` | Browser zoom test at 200 % |
| UNC-06 | `#staggered-menu-panel`'s `p-[6em_2em_2em_2em]` is dead because an unlayered `padding: clamp(...)` wins, and four overlapping media queries redefine `.lanyard-textbox { bottom }` so only the last applies; `.lanyard-wrapper canvas { touch-action: pan-y }` is duplicated verbatim | `[B]` `StaggeredMenu.jsx:546` vs `:756`; `Lanyard.css:196,223,240,256` and `:42`,`:245` | Computed-style inspection in a browser |
| UNC-07 | The runtime 3D scene's reduced-motion state (`gravity=[0,0,0]`, no spin) may not be the composition the designer expects | `[V]` — my own change; it is the same state the component already enters before warm-up, but the rendered result was not observed | Screenshot the home hero with the media query forced |
| UNC-08 | Announcement behaviour of the new `role="alert"` errors and the focused success panel was not heard | `[V]` — my own change | Screen-reader pass after submit |
| UNC-09 | Footer headline `whitespace-nowrap` at `clamp(1.7rem,5.5vw,5rem)` inside a 600 px column may overflow at some widths; the estimate puts the 11-glyph run at 528–616 px, i.e. it probably fits | `[B]` `Footer.jsx:90-96`, `index.css:430-432` | Measure the rendered run |

---

## C.9 What was reported and then rejected

Recorded so the register is not read as "everything found was accepted".

| Reported | By | Why rejected as a defect |
|---|---|---|
| "`npm audit fix` needed for react-router" | prior round's own prompt (`codevio-fix-prompt.md` item 11) | The `^6.30.3` pin installed 6.30.6, which is **still inside** the advisory range, and `fixAvailable: false` — no 6.x fix exists. Not reachable either way. Corrected in INFO-02 rather than actioned. |
| "Tailwind oxide native binary is broken (`UNLOADABLE_DEPENDENCY`)" | my own first build run | Cascade of the sandbox's `spawn EPERM`. With the shim in place the binary loads and the build is green; nothing is wrong with `node_modules`. |
| "`prerender.mjs` swallowing failures is a P0" | agent C, initially | The fail-open path is deliberate and documented in the file. Demoted to P1 SEO-02 and framed as a pipeline-policy call. |
| "`/work/<unknown>` → `_redirects` is missing `/work/*`" | agent D's impact note | Not missing — `/* /404.html 404` covers it, and the real defect was the SPA rewriting the 404 URL (FUN-04). |
| "Menu panel: focusable links inside an `aria-hidden` subtree" | my own hypothesis at first read | Wrong. `inert={!open}` plus `aria-hidden={!open}` mean the closed panel has nothing focusable; the trap wraps correctly at both ends. Recorded as clean in Deliverable B. |
| "`LogoLoop` effect re-runs every render → infinite loop" | agent A's own note | Rejected by that agent: `setState` bails out on equal values, so it converges. |

---

## C.10 Findings from the independent review of the remediation

A fifth agent, in its own context, was given the file list, the claim behind each change, and an
adversarial brief. It reviewed the current tree, re-derived the font proof with `fontTools`,
traced the React and Formspree internals, and checked every one of the 19 items. Its full output
is reproduced in Deliverable G §G.6.1.

It found **three defects the remediation itself introduced** and five weaknesses in the new tests
and docs. All ten are recorded here with the same rigour as the original findings, because a QA
report that hides the flaws in its own fixes is not a QA report.

### REV-01 · P1 · The route-change focus fix no-opped on the first visit to every lazy route
**Introduced by this remediation (A11Y-01's first fix).**

- **Reproduction:** reload `/`, keyboard-open the menu, activate "Services".
- **What happened:** the target chunk is unfetched, so React commits `RouteFallback`
  (`App.jsx:92-109`) — a `fixed inset-0 bg-black` overlay with **no `id="main"`** — in the same
  commit as the route change. `getElementById('main')` returned `null`, the `?.` swallowed it,
  and because `pathname` did not change again the effect never re-ran when the real page arrived.
  `document.activeElement` stayed `<body>`.
- **Why it mattered:** that is 7 of the 8 routes on a first visit — precisely the case A11Y-01
  was filed for, marked `FIXED` in a report that had not measured it.
- **Fix:** retry the focus on animation frames until `#main` appears, capped at 480 frames
  (≈8 s), cancelled in the effect cleanup.
- **Verification:** lint 0, build 0, `npm test` 22/22. The retry loop itself still needs a
  browser; what is verified is that it exists, is bounded, is cancelled, and that a new test
  asserts every route renders a `#main` for it to find.
- **Status:** `FIXED` (second attempt)

### REV-02 · P2 · `/about`'s stat block changed face
**Introduced by this remediation (TA-01's blast radius was incomplete).**

- **What happened:** `<p className="text-3xl font-semibold">{stat.value}</p>`
  (`About.jsx:350`) named no face, so it inherited `--sans` and moved Bebas Neue → Geist
  Semibold. The blast-radius sweep missed it because the sweep keyed on `uppercase` and these are
  digits. The adjacent label (`{stat.label}`) also lost its accidental all-caps.
- **Why it mattered:** `docs/qa/03-remediation-report.md` claimed *"no element's rendered face
  changed except the prose, list items, form fields and footer contact lines"*. That claim was
  false for this block.
- **Fix:** the value and the label both name `font-['Bebas_Neue']` now, so the block renders
  exactly as it did before; the label also declares `uppercase` explicitly rather than relying on
  the unicase quirk.
- **Note (not a defect):** `/` renders the same `STATS` values in Dela Gothic One
  (`PositioningStrip.jsx:51-52`), so the two pages have always disagreed about the stat face. That
  is a pre-existing design inconsistency, recorded as INFO-13 rather than "fixed", because
  changing it is a design decision and not something to do blind.
- **Status:** `FIXED`

### REV-03 · P2 · The `_headers` cache guard could not see a rule added *after* the block
- **What was wrong:** the negative assertion inspected `headers.split('/assets/*')[0]` — only the
  text **before** `/assets/*`, which is the last block in the file. Appending
  `/index.html` + `Cache-Control: public, max-age=86400` left the suite green, which is exactly
  the "a year of immutable HTML" failure the check exists to prevent.
- **Fix:** `_headers` is parsed into `{ pattern, headers }` blocks, the `/assets/*` block must
  contain the immutable rule, and **no other block may contain any `Cache-Control`**.
- **Verification:** red-green probed. Appending a `Cache-Control` block after `/assets/*` makes
  the suite fail (exit 1); restoring the byte-identical file (sha256 checked) makes it pass.
- **Status:** `FIXED`

### REV-04 · P2 · The display-face label guard covered one tracking value and no expressions
- **What was wrong:** the scan required the literal `tracking-[0.3em]` **and** only matched a
  string/template `className`, so it never saw `className={cx(...)}`; and the destructuring took
  the whole match, leaving both capture groups dead. Deleting `font-['Bebas_Neue']` from
  `PositioningStrip.jsx:15` (`tracking-[0.24em]`) left the suite green.
- **Fix:** the matcher accepts any `tracking-[<number>em]`, accepts single-quoted, template and
  `{expression}` classNames, and the two price-note spans that legitimately inherit Bebas from
  their parent are an explicit allowlist **keyed on the class string, with the occurrence count
  asserted at exactly 2** so a third copy fails loudly rather than silently passing.
- **Verification:** red-green probed — stripping the pin off `PositioningStrip.jsx:15` makes the
  suite fail, and the broadened scan flags exactly the 2 allowlisted spans today.
- **Status:** `FIXED`

### REV-05 · P3 · Three documentation claims did not match what was done
| Claim | Problem | Correction |
|---|---|---|
| "19 checks … All three were red before the change" | The baseline run happened when the suite had **18** checks → 16 pass / 2 fail. The eyebrow guard was added with the pinning, so it never had a red baseline. | Deliverable D now states 18 checks at baseline (16/2), and that the 19th and 20th were added afterwards and **individually red-green probed** instead of claimed. |
| "19 files touched" | The set is 16 application files + 4 build/deploy files + the new suite + docs. `Mission.jsx`, `Services.jsx` and `AGENTS.md` were also edited and were missing from the count. | Corrected in Deliverable D §D.1 and G §G.1. |
| "`--mono` → a real monospace stack" | `var(--mono)` is read nowhere in `src/`, `index.html` or the built CSS; `code`/`pre` resolve through Tailwind's own `--font-mono`. The line fixed an unused variable. | `--mono` is **deleted** (REV-09), and the claim is removed. |
- **Status:** `FIXED`

### REV-06 · P3 · The new focus target painted a ring around the whole page
`#main` has `tabIndex={-1}` and nothing suppressed its outline, so a keyboard-initiated
navigation would let Chrome draw the UA outline around a full-viewport `main`. Fixed with
`#main:focus-visible { outline: none }` — it is a programmatic skip target, not a control, so
SC 2.4.7 does not apply. A test asserts the rule stays. **Status:** `FIXED`

### REV-07 · P3 · Focus was not returned when the form came back
`reset()` ("Send another") swapped the confirmation for a fresh form, unmounting the focused
node and dropping focus back to `<body>`. Now a `requestAnimationFrame` focuses the first field
once that form has committed. **Status:** `FIXED`

### REV-08 · P3 · The `BreadcrumbList` negative check sampled a single shell
`assert.doesNotMatch(readDist('services.html'), /BreadcrumbList/)` was the only non-case-study
shell inspected. Now every non-case-study shell (including `404.html` and `index.html`) is
checked. **Status:** `FIXED`

### REV-09 · P3 · Dead `--mono` declaration
`var(--mono)` appears nowhere in `src/`, `index.html` or the built CSS; `code`, `pre` and
`font-mono` resolve through Tailwind's `--font-mono`. Deleted. Verified gone from the built CSS
while `--sans:"Geist Variable"` is still present. **Status:** `FIXED`

### REV-10 · P3 · `prefers-reduced-motion` is read once and never re-read
`LanyardScene.jsx` samples `matchMedia(...).matches` during render only. Toggling "Reduce
Motion" in the OS while `/` is open leaves the badge swinging until a reload, whereas
framer-motion's `MotionConfig reducedMotion="user"` reacts live in the same session. The same
one-shot shape exists in `StaggeredMenu` and `SplashScreen`, so this is a consistency gap rather
than a new class of bug, and subscribing would add a listener per mount for a rare mid-session
toggle. **Status:** `MITIGATED` — recorded, not fixed, with the reason.

### Also found by the same review: the lint script was blind to every `.mjs` file

**LINT-01 · P3 · `eslint .` never read `scripts/*.mjs` or `tests/*.mjs`**

- **Proven, not assumed:** adding `var unusedThing = 1;` to `scripts/__lintprobe.mjs` left
  `npm run lint` at **exit 0**; the identical content in `scripts/__lintprobe.js` gave
  **exit 1** with `no-unused-vars`. `eslint.config.js` matched only `**/*.{js,jsx}`, so eslint
  skipped every `.mjs` file — including the two scripts that drive the build and the suite added
  by this audit.
- **Fix:** a second config block for `scripts/**/*.mjs` and `tests/**/*.mjs` with
  `globals.node`. Enabling it immediately surfaced 13 real errors (11 × `process`/`Buffer` not
  defined, 1 × `no-regex-spaces` in the new test file), all of which are now fixed.
- **Verification:** a bad `.mjs` now gives **exit 1**; after deleting the probe, **exit 0**.
- **Status:** `FIXED`

---

## C.11 Round-2 findings — static accessibility and font-coverage audit

The browser was still unavailable in round 2, so this round attacked the two a11y questions that
*are* answerable from source. It found one real but minor defect, and one area that is provably
clean and now mechanized.

### TA-02 · P3 · `→` is missing from every shipped font subset, and the display-face utilities declare no fallback

- **Affected:** `OffersTeaser.jsx:64`, `Mission.jsx:156`, and `src/data/site.js:452,461,470,479,560,577,594` — ten user-visible strings, including the **case-study metric badges** ("Idea → live in 14 days", "Prototype → product in 31 days", "Rebrand → relaunch in 21 days") and the four home-offer headlines ("From idea → recognizable brand.").
- **Evidence (`[V]`, two independent measurements):**
  1. A `fontTools` cmap check of the three shipped latin subsets against every non-ASCII codepoint used in `src/`. All three cover U+00A9 ©, U+00B7 ·, U+2013 –, U+2014 —, U+2019 ’, U+201C “, U+201D ”, U+20AC € — and **all three lack U+2192 →**. (U+2500 ─ was also reported missing, but it appears only in three comments in `LogoLoop.jsx:329,345,429`, so it is never rendered — a false positive of the scan.)
  2. The built CSS declares `.font-['Bebas_Neue']{font-family:Bebas Neue}` — **a single family with no fallback list**, and the same for `font-['Dela_Gothic_One']`. So a glyph those fonts lack does not fall back to the declared `system-ui` chain; it drops to the browser's default face for that element. `--sans` and `--heading` **do** declare fallback stacks, so the two paths behave differently.
- **Expected:** an arrow that matches the label it sits in, or a deliberate, documented fallback.
- **Actual:** in the ten display-face labels the arrow renders in the browser default face next to condensed caps, and the result is not pinned by anything in the cascade.
- **Fix (recommended, not applied):** replace the ten text arrows with the `ArrowRight` lucide icon this codebase already uses in `CaseStudy.jsx` and `Work.jsx` — it inherits `currentColor` and cannot fall back — and/or write the display-face utilities with a stack (`font-['Bebas_Neue',sans-serif]`) so a future load failure or glyph gap degrades predictably.
- **Why not fixed:** both options change rendered output and no browser was available to see the result. Same line as A11Y-09 and A11Y-12.
- **Status:** `OPEN`

### A11Y-19 · clean · ARIA/label reference integrity and image alternatives

- **What was checked (`[V]`, mechanized):** every literal `htmlFor`, `aria-describedby`, `aria-controls`, `aria-labelledby`, `aria-owns` and `aria-activedescendant` across all 31 JSX/JS files must resolve to a literal `id` declared in `src/` (or to `root`/`codevio-static`, which live outside it); every `<img>` must carry `alt`; and no id other than `#main` may be declared in more than one file.
- **Result:** **0 broken references**, **0 images without `alt`**, 23 interactive elements and 7 literal ids inspected. The only cross-file id is `#main`, declared once in each route owner (`PageShell`, `Home`, `About`, `Contact`) plus `StaticFallback`, and never twice in one render — which the focus-target test also guards.
- **Two false positives in the first version of the scan**, recorded because they mark where the method stops: `Footer.jsx:72`'s `<Link>` was flagged as having no accessible name, but its name comes from the nested `<img alt="Codevio">`; and `ContactForm.jsx:281`'s `<input>` was flagged as unlabelled, but it uses a template id (`` id={`contact-${field.name}`} ``) a literal-only scan cannot see. Both were read and dismissed **before** anything was reported.
- **Deliberately not mechanized:** the accessible-name check itself. Its regex cannot distinguish visible text from a nested image `alt` or a template id without producing false failures, so it was run, produced no real defect, and is recorded here rather than turned into a rule that would cry wolf.
- **Status:** `MITIGATED` — the reference and `alt` halves became permanent contracts in `tests/site-contracts.test.mjs`, each red-green probed (Deliverable F §F.1 #45).

### Method note (recorded because it caught me out twice)

Two independent detector bugs produced false "all clean" results during this audit and are worth
naming so a reader trusts the right evidence:

1. The blast-radius sweep for the typography change keyed on the string `uppercase`, so it could not
   see `About.jsx:350` — which is exactly how REV-02 shipped (found later by the reviewer).
2. The first UTF-8 corruption check used the pattern `U+00C3` followed by a codepoint in `0x80–0xBF`,
   which misses `×` (double-encoded as `U+00C3 U+2014`). The precise check — encode the whole file to
   CP1252 and decode it back as UTF-8, treating "changed output with zero replacement characters" as
   corruption — reports all nine documents clean.

---

## C.12 Round-3 findings — pricing-data and structured-data integrity

Round 3 asked the two content-integrity questions a marketing site can fail most expensively: does
the price on the landing page match the price on the pricing page, and does the structured data
match the contact details the site actually publishes? One is clean, one produced a previously
unrecorded informational item, and the drift risk is now guarded.

### DATA-01 · clean · `/` and `/services` agree on every shared price and timeline

- **Why it was checked:** the home page shows four "Launch sprints" cards with prices and timelines, and `/services` lists all fifteen packages. `HOME_OFFERS` and `OFFERS` are two separate arrays in `src/data/site.js` with no code linking them, so a price edited in one place could silently contradict the other — the single most damaging content defect a studio site can ship.
- **Method (`[V]`):** a script parsed both array literals, extracted `title`/`price`/`timeline`/`priceNote` per entry, and matched the four home tiers against `/services` by title.
- **Result:** all four shared tiers — Starter — Brand €1,200 / 1–2 weeks, Standard — Website €3,500–5,000 / 2–3 weeks, AI Sprint €2,500–4,500 / 1–3 weeks, MVP Sprint €9,000–25,000 / 4–8 weeks — **agree on price and timeline exactly**. The only difference is `priceNote`: the home teaser says "one-time" and the services page leaves it blank. That is a presentational difference, not a contradiction, and `/services` uses the same field to mean something else on two other tiers (`note: "bundle"` on Launch Lite and Launch Pro), so it is deliberate.
- **Status:** `MITIGATED` — no defect to fix, and the structured-data half of the drift risk is now a permanent contract (see below).

### SEO-11 · Info · `Organization.logo` points at the 1200×630 social banner, not a logo

- **Where:** `index.html:47` → `"logo": "https://codevio.net/og-image.png"`.
- **Evidence (`[V]`):** `public/` contains `favicon.ico`, `favicon.svg`, `og-image.png`, `robots.txt`, `sitemap.xml`, `_headers` and `_redirects` — no logo file. `og-image.png` is exactly 1200×630 (a social banner with the tagline on it), while `src/assets/logo.png` is 330×83 and is never published. Structured data is valid — Google's guidance only requires a representative image of at least 112×112 — but a wide banner is likely to be scaled or cropped in rich results, and it is not what the property means.
- **Fix (recommended, not applied):** publish a logo image and point `Organization.logo` at it. **Not applied** because it means shipping a second copy of `src/assets/logo.png` into `public/`, and two copies of one asset that must change together is a worse trade than the current state until someone chooses the canonical one. Raised by the SEO agent in round 1 and left unnumbered then; recorded here so it is not lost.
- **Status:** `OPEN`

### New permanent contract (round 3)

`the structured data and the shared site constants agree` — `src/data/site.js` is the single source
for the contact details and social profiles, and `index.html` hardcodes all of them a second time
inside the `Organization` JSON-LD. Nothing else connected the two, so changing a phone number in one
place would have left search engines publishing the old one indefinitely.

Red-green probed with three separate breaks against the **built** `dist/index.html` (which is what
the contract reads — the first probe run mutated `index.html` and correctly did not fire, which is
itself the evidence that the contract tests the artifact rather than the source):

```
RED as expected  broken=exit 1  restored=true  after-restore=exit 0  :: phone drifts between the JSON-LD and site.js
RED as expected  broken=exit 1  restored=true  after-restore=exit 0  :: email drifts between the JSON-LD and site.js
RED as expected  broken=exit 1  restored=true  after-restore=exit 0  :: a social profile is dropped from sameAs
```

---

## C.13 Browser round — one new P1 finding

### PERF-11 · P1 · GSAP spends ~13 seconds of main-thread time on the home page (mobile)

- **Affected:** `/` only.
- **Evidence (`[V]`, reproducible over 4 independent Lighthouse 13.5.0 mobile runs):** Lighthouse's
  own `bootup-time` attribution names **`gsap-B2JeSRMT.js`** as the worst script every time:
  **13,228 / 13,016 / 13,221 / 13,041 ms**. The `three-vendor` chunk, which the previous round
  treated as the home page's main cost, is **3,881 ms** — under a third of it.
  - home mobile: perf **≈50**, LCP **≈3706 ms**, TBT **7998–8792 ms**, CLS **0**, TTI ≈22.6–23.8 s,
    20 long tasks with a worst case of **3,247 ms**; main-thread work 13,858 ms "Other" + 5,110 ms
    script evaluation; 1.67 MB total, 1,311 KB of transferred JS, 238 KB unused.
  - `services-mobile` loads the same chunk graph **except gsap** and reaches TBT **≈347 ms** with the
    `Lanyard` chunk as its worst entry (5,564–6,291 ms). So the ~13 s is specific to `/`, where
    `ScrollTrigger` drives the hero's scrubbed decorative-word timeline alongside the 3D scene's
    continuous `requestAnimationFrame`.
- **Why it matters:** the home page is the one that has to win the click, and on a mid-tier phone it
  blocks the main thread for eight-plus seconds while failing the LCP threshold at 3.7 s.
- **Fix (recommended, not applied):** profile the ScrollTrigger timeline before changing it — the
  obvious candidates are replacing the scrubbed reveal with a CSS transition, removing the scrub, or
  gating the timeline on viewport/idle the way the 3D scene already gates its mount. Any of these
  changes the hero's motion, so it needs the design in front of it and a re-measure.
- **Supersedes the framing of:** PERF-02 and PERF-03 remain true (the 3D stack is 3.82 MB fetched
  two frames after first paint; 233 KB of animation libraries load on every route), but neither is
  the dominant *main-thread* cost on the home page. That is gsap.
- **Status:** `OPEN`

### Correction to the previous two rounds' records

`[V]` In round 1 I wrote and reported that the first version of the A11Y-03 fix "does not work",
based on a browser measurement showing the track moving 108–114 px while a link was focused. That
measurement was invalid: **programmatic `element.focus()` in headless Chrome sets
`document.activeElement` without dispatching `focusin` at all** — measured directly as
`docIn: 0, regionIn: 0` after `.focus()`, while a hand-dispatched `FocusEvent('focusin')` on the
same element paused the marquee within 400 ms. Real Tab key presses do dispatch it, and with those
the current implementation pauses correctly. The props-based version was replaced rather than
proven broken, and the code comment now says so.

Two harness bugs of mine are recorded in Deliverable I §I.4 for the same reason: a full-page
screenshot taken without scrolling showed ~70 % of `/services` blank (framer-motion `whileInView`
has not fired — not a site defect), and the focus measurement above. Both would have produced
false findings if left unchecked.

