# Changelog

All notable UI changes made during the Codevio website polish pass are recorded here.

## 2026-10-17 — QA audit and controlled remediation

Full report: [`docs/qa/`](docs/qa/README.md). 57 findings recorded, **17 fixed**.
Verification order: `npm run lint` → `npm run build` → `npm test`.

### Differences in this pass

| Area | Before | After | File |
| --- | --- | --- | --- |
| Body typography | `--sans` was Bebas Neue, a **unicase** face whose lowercase letters are the capital outlines, so every paragraph, list item and form field rendered in all caps. Geist was installed, its `@font-face` was built, and nothing used it | `--sans` is Geist Variable; Bebas Neue stays opt-in by name on short labels and eyebrows | `src/index.css`, `src/components/SpecularButton.css`, `src/pages/{About,Contact,Mission,Services,Work}.jsx`, `src/components/Footer.jsx` |
| Route change focus | The route remount destroyed the activated link and focus fell back to `<body>`; the next Tab restarted at the skip link | `#main` (already `tabIndex={-1}`) receives focus on PUSH/REPLACE, with `preventScroll` | `src/components/ScrollToTop.jsx` |
| Primary navigation | The six nav links lived in an `<aside>` with no `<nav>` landmark | `<nav id="staggered-menu-panel" aria-label="Main">`; the `id` is unchanged so `aria-controls` still resolves | `src/components/StaggeredMenu.jsx` |
| Menu link clicks | The panel never closed on a link click, and clicking the current page's entry did nothing at all | `onClick={closeMenu}` on the panel links | `src/components/StaggeredMenu.jsx` |
| Tech marquee | Paused on hover only, so a keyboard-focused logo drifted out of the clipped track | Also pauses on focus/blur | `src/components/LogoLoop.jsx` |
| 3D badge and reduced motion | CSS, framer-motion and GSAP honoured `prefers-reduced-motion`; the Rapier physics did not, so the card still swung and spun | Physics gating reads the media query; no physics or rendering math changed | `src/components/LanyardScene.jsx` |
| Form feedback | Inline errors had no live role, so only the first of four was announced; the success panel was never focused | `role="alert"` on both inline errors; the confirmation panel is focused on success | `src/components/ContactForm.jsx` |
| Honeypot | The wrapper and its visible `<label for>` were exposed while the input was `aria-hidden`, creating a focus dead end | `inert` on the wrapper | `src/components/ContactForm.jsx` |
| About code panel | `text-white/40` labels (3.8:1) and `text-white/30` line numbers (2.6:1) | `white/70` (9.7:1) and `white/55` (6.3:1) | `src/pages/About.jsx` |
| Contact link hover | `#db364e` computed to 4.373:1 on the flat background and as low as 2.99:1 over the shader | The existing brand pink `#f5b8c4` (8.06:1 worst case) | `src/pages/Contact.jsx`, `src/components/ContactForm.jsx` |
| Case-study sidebar | `lg:sticky lg:top-10` put it under a 77–96px blurred fixed header | `lg:top-28` | `src/pages/CaseStudy.jsx` |
| Unknown case-study slug | `<Navigate to="/work">` rewrote a 404 URL into a valid, indexable one | Renders the existing 404 page in place | `src/pages/CaseStudy.jsx` |
| Background shader | WebGL context was handed to the garbage collector on every navigation | `WEBGL_lose_context` released explicitly in both cleanups | `src/components/Grainient.jsx` |
| Home OG description | `index.html` shipped an OG/Twitter description that differed from its own meta description, because the generator skipped `/` | `/` goes through the same generator as every other shell | `scripts/generate-pages.mjs` |
| Soft 404 | Appended a second `robots` meta and left the previous page's canonical in `<head>` | Reuses the existing tag, restores it on unmount, removes/restores the canonical | `src/pages/NotFound.jsx` |
| Fingerprinted assets | No `Cache-Control` at all, so every repeat visit revalidated 3.98 MB of JS and the 273 KB GLB | `/assets/*` cached `public, max-age=31536000, immutable`; HTML deliberately left on the default | `public/_headers` |
| Decorative icons and canvas | Six lucide arrows and both WebGL canvases were exposed to assistive tech | `aria-hidden` added | `src/pages/{CaseStudy,Work}.jsx`, `src/components/{Footer,Grainient}.jsx` |
| Footer logo | Eager on every route though below the fold | `loading="lazy" decoding="async"` | `src/components/Footer.jsx` |

### Fixes from the independent review round

The change set above was then reviewed by a separate agent, which found three defects **in the
remediation itself**. All are fixed:

| Area | Before | After | File |
| --- | --- | --- | --- |
| Route-change focus | The first version of the focus fix no-opped whenever the destination route's chunk was not cached — React commits the loading fallback, which has no `#main`, and the effect never re-ran | Focus is retried on animation frames until `#main` exists (capped at ≈8 s), cancelled on cleanup | `src/components/ScrollToTop.jsx` |
| Focus target outline | Focusing `#main` could paint the UA outline around the whole viewport | `#main:focus-visible { outline: none }` — it is a programmatic skip target, not a control | `src/index.css` |
| `/about` stat block | Its value and label relied on the inherited font, so they changed face with the typography fix | Both name `font-['Bebas_Neue']` again; the label also declares `uppercase` rather than relying on the unicase quirk | `src/pages/About.jsx` |
| "Send another" | The confirmation was replaced by a fresh form without moving focus, dropping it to `<body>` | A `requestAnimationFrame` focuses the first field once the form has committed | `src/components/ContactForm.jsx` |
| Dead token | `--mono` was declared and read nowhere | Deleted | `src/index.css` |
| Test suite | The `_headers` cache check only inspected the text *before* the `/assets/*` block; the label guard covered one tracking value and never saw `className={cx(...)}`; the `BreadcrumbList` negative check sampled one shell | `_headers` parsed into blocks; the label guard matches any `tracking-[<n>em]` and expression classNames with a count-asserted allowlist; every non-case-study shell is checked | `tests/site-contracts.test.mjs` |
| Lint coverage | `eslint .` matched only `.js`/`.jsx`, so `scripts/*.mjs` and `tests/*.mjs` were never linted (proven: a deliberate error in a `.mjs` left lint at exit 0) | A second config block with Node globals for those paths; enabling it surfaced 13 real errors, all fixed | `eslint.config.js` |

### Regression coverage added

`tests/site-contracts.test.mjs` — 22 contracts on the built-in Node test runner, no
dependency. Guards routes versus metadata, nav targets, case-study slug sync, the body-font
rule, the display-face label rule, the `#main` focus target, ARIA/label reference integrity and
image `alt` text, the sitemap, `robots.txt`, `_headers` (including the new cache rule, the absence
of `unsafe-inline`/`unsafe-eval` in `script-src`, and `Cache-Control` appearing in no block but
`/assets/*`), `_redirects`, the 404 shell, JSON-LD, `BreadcrumbList` placement, and the `public/` →
`dist/` copy. The suite had **18 checks → 16 pass / 2 fail** against the pre-fix tree and is
**22 pass / 0 fail** after; the eleven checks added or widened after that baseline were each
red-green probed — a real break makes the suite exit 1 and a sha256-verified restore makes it
exit 0.

### Known, reported, not changed

- **The `→` arrow is missing from all three shipped latin font subsets** and the
  `font-['Bebas_Neue']` / `font-['Dela_Gothic_One']` utilities declare no fallback list, so it
  renders in the browser's default face beside condensed caps in 10 visible strings (including the
  case-study metric badges). Verified with `fontTools` against the shipped woff2 files and against
  the built CSS. The fix is either the lucide `ArrowRight` this codebase already uses elsewhere, or
  writing the utilities with a stack — not applied here because it changes rendered output and no
  browser was available to check it. Recorded as TA-02 in `docs/qa/02-issue-register.md`.

### Verification

- `npm run lint` — exit 0, and it now actually reads `scripts/**/*.mjs` and `tests/**/*.mjs`.
- `npm run build` — `vite build` exit 0, `generate-pages.mjs` exit 0 (11 shells), `prerender.mjs`
  **could not run** in the audit environment because it needs a real browser; see
  `docs/qa/00-harness-and-skill-inventory.md` §A.3.
- `npm test` — 22 pass / 0 fail.
- **Not verified: any rendering.** No browser was available, so there are no screenshots, no
  `axe-core` run and no Lighthouse score. `docs/qa/07-release-readiness.md` records this as a
  release blocker rather than treating it as passed.

## 2026-09-25 — Polish pass (PR #2)

Pull request: https://github.com/Codevio-Codespace/Codevio-Website/pull/2
Base branch: `stagin`

### Differences in this pull request

| Area | Before | After | File |
| --- | --- | --- | --- |
| Route transition | Every route was wrapped in a full-screen transition overlay showing labels such as "Our Work" and "Our Services" | The overlay is no longer mounted; navigation goes straight to the page | `src/App.jsx` |
| Transition theme tokens | `textColor` and `transitionBackground` existed in the shared theme | Removed because nothing uses them anymore | `src/data/site.js` |
| Native scrollbar | Browser-default scrollbar with a visible track | Native scrollbar hidden in Chrome, Edge, and Firefox | `src/index.css` |
| Scroll indicator | None | A 3px white line with no track shows the current scroll position and moves with page progress | `src/App.jsx`, `src/index.css` |
| About hero spacing | `pt-32` (128px) | `pt-8` (32px) so the content starts closer to the header | `src/pages/About.jsx` |
| Services hero spacing | No bottom padding | `pb-8` added under the "Launch sprints" block | `src/pages/Services.jsx` |
| Home launch-sprint section | `py-16` (64px) | `pt-16 pb-32` so there is clear space between the cards and the footer | `src/components/OffersTeaser.jsx` |
| Home offer cards | `p-7` (28px) | `p-7 pb-16` (64px bottom) with no card movement or transform | `src/components/OffersTeaser.jsx` |
| Desktop density rules | The `stagin` density pass set uniform 48px section padding and 21px card padding | Density is preserved, while the requested 128px section bottom and 64px card bottom are kept on desktop | `src/index.css` |

### Earlier changes already merged into `stagin`

| Area | Change | File |
| --- | --- | --- |
| Shared page theme | Central `PAGE_THEME` tokens for background, gradient, menu, and accent colors; used by the shell, home, About, and Contact | `src/data/site.js` |
| Page background colors | Hard-coded shader colors replaced with shared theme values | `src/components/PageShell.jsx`, `src/components/Lanyard.jsx`, `src/pages/About.jsx`, `src/pages/Contact.jsx` |
| Burger menu colors | Menu surface, text, trigger, and open-trigger colors are now driven by theme props and CSS variables | `src/components/StaggeredMenu.jsx` |
| Burger menu hover | Menu links turn Codevio red with a black outline and layered 3D shadow on hover and keyboard focus, matching the footer "something" treatment | `src/components/StaggeredMenu.jsx` |
| Text selection | Selected text uses a Codevio red highlight with white letters | `src/index.css` |
| macOS window controls | The About "studio.js" dots behave like macOS traffic lights: only the hovered control scales and reveals `×`, `−`, or `+` with smooth easing | `src/pages/About.jsx` |

## Verification

- `npm run build` passes.
- `npm run lint` reports 17 pre-existing errors and 4 warnings in legacy components that were not touched by this work: `CurvedLoop.jsx`, `ImagesParallax.jsx`, `Lanyard.jsx`, `Loader.jsx`, `Mousemaskreveal.jsx`, `PixelBlast.jsx`, and `StickyCard.jsx`.
- Targeted ESLint passes on every file changed by this work.
- All six routes return HTTP 200: `/`, `/mission`, `/services`, `/work`, `/about`, `/contact`.
- The scrollbar and macOS controls were verified visually with headless Edge screenshots.
