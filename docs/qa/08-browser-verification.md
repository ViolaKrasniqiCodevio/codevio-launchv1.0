# Deliverable I — Browser Verification

Codevio QA audit · 2026-10-17 · the 12 checks that were `BLOCKED` in Deliverables A–H

Full access was granted at the start of this round. Every probe described in Deliverable A §A.7
was re-run first and all three now pass: file writes outside the workspace succeed, piped
`spawn`/`exec` succeeds, and `spawnSync(chrome, …)` returns status 0. The shim in
`%TEMP%\dsh-netuse-shim.cjs` is no longer used anywhere.

---

## I.1 The real build now passes, including prerender

```
npm run build   ->  exit 0
  vite build            exit 0, 2,829 modules
  generate-pages.mjs    exit 0, 11 shells
  prerender.mjs         exit 0, "prerender: rendered 11 routes."
```

This closes **SEO-01**, which was blocked for three rounds. `dist/index.html` went from
**4,017 bytes meta-only to 155,339 bytes of real content**.

| Shell | bytes | `<h1>` | `<h2>` | internal links | `<form>` | `id="codevio-static"` |
|---|---|---|---|---|---|---|
| index.html | 155,339 | 1 | 1 | 30 | 0 | yes |
| mission.html | 40,122 | 1 | 2 | 26 | 0 | yes |
| services.html | 80,586 | 1 | 4 | 26 | 0 | yes |
| work.html | 41,425 | 1 | 4 | 30 | 0 | yes |
| about.html | 41,655 | 1 | 0 | 26 | 0 | yes |
| contact.html | 38,528 | 1 | 3 | 26 | **1** | yes |
| 404.html | 31,893 | 1 | 0 | 27 | 0 | yes |
| work/tara-jewellery.html | 37,436 | 1 | 3 | 29 | 0 | yes |
| work/saas-waitlist-launch.html | 36,356 | 1 | 3 | 29 | 0 | yes |
| work/marketplace-mvp.html | 36,334 | 1 | 3 | 29 | 0 | yes |
| work/rebrand-and-relaunch.html | 36,354 | 1 | 3 | 29 | 0 | yes |

`#root` is still deliberately left empty and the no-JS fold shim is present, exactly as
`scripts/prerender.mjs` documents. The `contact.html` `<form>` is the no-JS fallback, which
finally exists in shipped HTML — one of the previous round's claims that was not true of the
meta-only artifact now is.

Prerender sizes are byte-identical across two consecutive builds in this session (155,339 for
`/` both times), so the snapshot is reproducible here.

---

## I.2 axe-core: 0 violations on all 8 routes

axe-core **4.14.0**, injected from a local file (`C:\Users\Admin\melos-portfolio\node_modules\axe-core\axe.min.js`),
run with the full ruleset at 1440×900 against `/`, `/mission`, `/services`, `/work`,
`/work/tara-jewellery`, `/about`, `/contact` and an unknown path:

```
axe: 0 violation type(s)   (x8 routes)
```

This is the first automated accessibility scan in this audit; it was `BLOCKED` in rounds 1–3.
It corroborates the manual source-level audit rather than replacing it.

---

## I.3 Lighthouse — mobile n=4 and desktop, with the numbers the brief asked for

Method: Lighthouse **13.5.0** from the npx cache, local preview server, one Chrome at a time,
5–6 s between runs, `--chrome-flags="--headless=new --no-sandbox --disable-gpu"`,
`--only-categories=performance,accessibility,seo,best-practices`. Mobile is Lighthouse's default
(simulated mid-tier CPU + slow 4G); desktop uses `--preset=desktop`.

| Run | perf | a11y | SEO | best-practices | LCP | TBT | CLS | FCP | SI | TTI |
|---|---|---|---|---|---|---|---|---|---|---|
| **home mobile** (n=4: 49/50/50/50) | **≈50** | **100** | **100** | **100** | 3717 / 3700 / 3691 / 3716 → **≈3706 ms** | 8627 / 8792 / 8260 / 7998 → **7998–8792 ms** | **0** | ≈2894 ms | ≈5915 ms | ≈22.6–23.8 s |
| **services mobile** (n=4: 74/80/79/78) | **≈79** | **100** | **100** | **100** | 3470 / 3455 / 3457 / 3456 → **≈3459 ms** | 490 / 318 / 320 / 375 → **≈347 ms** | **0** | ≈2742 ms | ≈2742 ms | ≈7.0 s |
| **home desktop** (n=1) | **66** | **100** | **100** | **100** | **757 ms** | 1076 ms | **0** | 619 ms | 2135 ms | 4102 ms |

Against the brief's Core Web Vitals thresholds:

| Metric | Threshold | home mobile | services mobile | home desktop |
|---|---|---|---|---|
| LCP | ≤ 2.5 s | **≈3.71 s — FAILS** | **≈3.46 s — FAILS** | 0.76 s — passes |
| CLS | ≤ 0.1 | **0 — passes** | **0 — passes** | **0 — passes** |
| INP | ≤ 200 ms | **NOT MEASURED** — Lighthouse reports TBT, and TBT is not INP | — | — |

**TBT is not reported as INP anywhere in these deliverables.** No field data (CrUX) was available,
so every number above is a *laboratory* measurement of a simulated mid-tier device.

`accessibility`, `seo` and `best-practices` are **100 across every run**, which independently
confirms the metadata work, the prerendered content, the security headers, the absence of console
errors, and the accessibility fixes — with 0 audits below 1.0 in each of those three categories
(the only sub-1.0 audit found is one weighted-zero best-practices item on the home runs).

### PERF-11 (new, P1) — GSAP, not the 3D stack, is what blocks the home page on mobile

Lighthouse's own attribution is consistent across all four home-mobile runs:

| worst script | 4-run bootup time | 
|---|---|
| **`gsap-B2JeSRMT.js`** | **13,228 / 13,016 / 13,221 / 13,041 ms** |
| `three-vendor-*.js` | 3,881 ms |
| `react-vendor-*.js` | 1,410 ms |

Main-thread work 13,858 ms "Other" + 5,110 ms script evaluation; **20 long tasks, worst 3,247 ms**.
Total page weight 1.67 MB, 14 JS requests, 1,311 KB transferred, 238 KB unused JS.

On `services-mobile` the same chunk graph produces TBT **347 ms**, and there the leading entry is
the `Lanyard` chunk at 5,564–6,291 ms with no gsap entry at all. So the ~13 s is specific to the
home page, where `gsap` is loaded and `ScrollTrigger` drives the hero's scrubbed decorative-word
timeline (`Lanyard.jsx`) alongside the 3D scene's continuous `requestAnimationFrame`.

**This corrects the previous round's framing**, which attributed the home page's blocking time to
the three/rapier stack (PERF-01/PERF-02). The 3D stack is real and large, but on a mid-tier mobile
CPU it is roughly a quarter of the cost that `gsap` represents. **PERF-11 is the single largest
performance finding in this audit and it is newly measurable.** It is reported, not fixed: the
mechanism needs investigation with a profiler, and any fix changes the hero's motion.

---

## I.4 Functional, responsive and console verification — 35 page loads

CDP-driven Chrome, 6 viewports × 8 routes (plus repeats), 2.5 s settle plus a scrolling walk
before measurement.

| Viewport | Routes | Result |
|---|---|---|
| 1440×900 desktop | all 8 | 0 horizontal overflow, 1 `<h1>`, 1 `<main>`, 0 console errors, 0 failed requests |
| 1366×768 laptop | `/`, `/services`, `/work` | same |
| 768×1024 tablet | `/`, `/services`, `/contact` | same |
| 390×844 | all 8 | same |
| 360×800 | `/`, `/services`, `/contact` | same |
| 320×640 | all 8 | same |

**Totals: 35 loads, 0 horizontal overflow, 0 console errors, 0 failed requests, 0 unhandled
rejections, exactly one `<h1>` and one `<main>` on every route.** Body font computed as
`"Geist Variable", system-ui, "Segoe UI", Roboto, sans-serif` — the TA-01 fix, confirmed in the
live cascade.

### A note on two harness bugs of mine, because they shaped the evidence

1. **Full-page screenshots without scrolling.** The first capture of `/services` showed ~70 % of
   the page blank. That was my harness, not the site: `reveal()` uses framer-motion
   `whileInView` with `viewport: { once: true }`, so below-fold sections are at `opacity: 0` until
   scrolled into view. `prerender.mjs` already solved this by walking the page; I copied that and
   the page renders completely. Recorded because a screenshot alone would have produced a false
   P0.
2. **Programmatic focus cannot test focus behaviour.** `element.focus()` in headless Chrome sets
   `document.activeElement` **without dispatching `focusin` at all** — measured directly:
   `docIn: 0, regionIn: 0` after `.focus()`, while a hand-dispatched `FocusEvent('focusin')` on
   the same element paused the marquee immediately. Two rounds of "the focus fix doesn't work"
   were measurement artifacts. Everything focus-related below was re-verified with real
   `Input.dispatchKeyEvent` Tab presses.

### Scroll-reveal under a jump — investigated and NOT a defect

Jumping straight to the middle or the bottom of `/services` at 320×640 leaves 6 text elements at
`opacity: 0`. Measured viewport-relative, **0 of the 6 were on screen** (tops −6147, −6098, −4178,
−4128, +3526, +4717 against a 640 px viewport): they are the off-screen sections that
`whileInView` is designed to reveal when they enter view. A smooth walk of the same page leaves
**0** invisible, and `prefers-reduced-motion: reduce` with a smooth walk also leaves **0** — so
reduced-motion users are not given invisible content.

### Focus after a client-side route change — A11Y-01 and REV-01 verified

```
before any click          : BODY#          (initial load is POP, so no focus steal - correct)
after clicking to /services: {"url":"/services","active":"MAIN#main","main":true}
after a second navigation : MAIN#main
```

Both the cold-chunk case (the one REV-01 fixed) and the warm case land focus on `#main`. Focus was
moved with a programmatic `.click()` on a visible footer link, and the destination chunk was not in
the browser's cache on the first navigation.

### Reduced motion — A11Y-05 verified

Two screenshots 1.5 s apart, byte-compared:

| Emulated preference | `matchMedia` matches | frames identical | verdict |
|---|---|---|---|
| `reduce` | true | **yes (identical hash)** | page is genuinely static |
| `no-preference` | false | no (different hashes) | animation is running |

### Keyboard contract — verified with real key events

| Check | Result |
|---|---|
| First Tab lands on the skip link | yes, `A.skip-link` "Skip to content" |
| Skip link becomes visible on focus | `top: 18px` (from `-900px`), on-screen, `:focus-visible` matched |
| Focus stops 1–8 all on screen with a visible indicator | yes — skip link, logo, menu toggle, "Request a quote", two links, and three footer links |
| Menu toggle size and ring | **44×44 px**, `outline: solid 2px rgb(219,54,78)` (brand red) |
| Menu opens, moves focus into the panel | yes, focus lands on an `.sm-panel-item` link |
| Closed panel is `inert` while open = not inert | `panelInertWhileOpen: false` (correct) |
| Escape closes and returns focus to the toggle | `aria-expanded` → `"false"`, `focusReturnedToToggle: true` |

### A11Y-03 — the marquee focus pause, fixed and verified

The measurement trap above means the first two attempts to verify this were invalid. Resolved with
real Tab presses at 1440×900:

```
Tab  1: "Skip to content"     Tab  3: "Open menu"
Tab  2: "Codevio home"        Tab  4: "React"   <- inside the marquee
focusin events observed on the marquee region: 1
travel over 1.6s while a marquee link holds real keyboard focus: 0px      => PAUSED
travel after focus left the marquee:                            113px     => resumed
```

The implementation now uses native `focusin`/`focusout` listeners on the marquee container with a
`relatedTarget` guard, so focus moving between two links inside the same track stays paused. The
hover path was measured as a control throughout (7 px vs 112–114 px unfocused).

**Honest correction:** I wrote and said that the first (React props) version "does not work".
That conclusion came from an invalid measurement — programmatic focus dispatches no `focusin`, so
it could neither confirm nor refute the props version. What is established is that the current
native-listener implementation pauses correctly under real keyboard input; the props version was
replaced rather than proven broken. The code comment says exactly this.

### A11Y-10 — the case-study sticky sidebar, verified

At 1440×900 on `/work/tara-jewellery`, scrolled 600 px:

```
stickyTop: 215   firstLineTop: 215   backdropBottom: 108   backdropHeight: 108
firstLineCovered: false
```

The sidebar's first line clears the fixed header backdrop by 107 px, so the `lg:top-28` fix works.

### 404 route — SEO-09 and the not-found behaviour, verified

`/definitely-not-a-page` renders: title `Page not found — Codevio`, one `<h1>` ("This page doesn't
exist."), **exactly one** `robots` meta (`noindex, nofollow`), **no canonical**, `#main` present, and
a working back-home link. The duplicate-robots and stale-canonical defects are gone in the live DOM.

### A11Y-11 — still NOT verified, and why

The `100vh` vs `100svh` question was about mobile browser chrome (the URL bar). Headless Chrome has
no dynamic browser chrome, so `vh`, `svh` and `dvh` are all equal and the distinction cannot be
observed. Measured anyway, and recorded as *uninformative* rather than as a pass: at 390×844 the
hero copy sits at y 761–796 inside an 844 px viewport, and at 320×640 at y 557–592 inside 640 px —
neither off-screen. Confirming A11Y-11 needs a real mobile device or DevTools device mode with
dynamic chrome, not this harness.

---

## I.5 Deployment configuration — behaviourally verified

`vite preview` ignores `_redirects`, so the routing table was exercised against a **faithful model
of Netlify's documented order** (static file → pretty URL → first matching rule in file order;
200 = rewrite, 404 = serve with 404; `_headers` blocks applied by pattern). This is a model, not
Netlify, and is labelled as such.

| Request | Status | bytes |
|---|---|---|
| `/` | 200 | 155,339 |
| `/mission`, `/mission/` | 200 | 40,122 |
| `/services`, `/services/` | 200 | 80,586 |
| `/work`, `/work/` | 200 | 41,425 |
| `/about` | 200 | 41,655 |
| `/contact` | 200 | 38,528 |
| `/work/tara-jewellery`, `/work/tara-jewellery/` | 200 | 37,436 |
| `/work/saas-waitlist-launch` | 200 | 36,356 |
| `/work/marketplace-mvp` | 200 | 36,334 |
| `/work/rebrand-and-relaunch` | 200 | 36,354 |
| `/definitely-not-a-page` | **404** | 31,893 (the 404 shell) |
| `/work/nope` | **404** | 31,893 |
| `/robots.txt` | 200 | 65 |
| `/sitemap.xml` | 200 | 1,755 |

Every route returns **its own distinct byte count**, so each rewrite really targets its own shell
rather than funnelling everything to `index.html`. All six security headers are applied from
`_headers`, including the repo's own `strict-transport-security: max-age=63072000` (the live site
currently serves Netlify's default `31536000`). **PERF-06 verified:** `/assets/*` carries
`cache-control: public, max-age=31536000, immutable` while `/` (HTML) does not, so immutable
caching cannot leak onto a regenerated document.

---

## I.6 Visual verification

Screenshots at 6 viewports are in `.qa-evidence/shots/` (43 PNGs) and the raw measurements in
`.qa-evidence/browser-audit.json`. Two were inspected directly:

- **`home-desktop.png`** — the 3D lanyard badge renders with its strap and "Code.Create.Innovate."
  card over the red gradient; the tech marquee, "From idea to launch, in weeks." hero, the four
  launch-sprint cards and the footer all render correctly, with no overlap or clipping.
- **`services-desktop.png`** — full page: hero, four "What we do" cards, the complete pricing grid
  grouped by category (LAUNCH / WEBSITES / AI / PRODUCT / CUSTOM / MONTHLY RETAINERS), the "Why
  Codevio" promise card, "How packages work", "Who this is for", the CTA and the footer.

**The typography fix (TA-01) is confirmed visually:** body copy renders in a normal text face with
real lowercase glyphs in both screenshots, which is what the font-data analysis predicted and what
no amount of static checking could show.

I also misread one detail from a downscaled image and then disproved it: the marquee appeared to
render "MySQL" as serif text. A direct DOM probe shows all 11 items and their clones each render an
`<svg>` with one path and **no visible text**, so that was an artifact of downscaling, not a defect.

---

## I.7 What this round changed

| Finding | Before this round | Now |
|---|---|---|
| SEO-01 (P1) — meta-only shells | `BLOCKED`, 4,017 B shells | **CLOSED** — prerender runs, 155,339 B with 30 links |
| A11Y-01 / REV-01 — focus after route change | source-level only | **VERIFIED** in-browser, including the cold chunk |
| A11Y-03 — marquee focus pause | claimed FIXED, unverified | **FIXED and VERIFIED** — 0 px travel while focused; implementation corrected and its comment made accurate |
| A11Y-05 — reduced motion | source-level only | **VERIFIED** — byte-identical frames under `reduce` |
| A11Y-10 — sticky sidebar | geometry only | **VERIFIED** — clears the backdrop by 107 px |
| SEO-04 — `_redirects` routing | rules read only | **VERIFIED** behaviourally |
| SEO-09 — soft-404 robots/canonical | source-level only | **VERIFIED** in the live DOM |
| PERF-06 — asset caching | rule read only | **VERIFIED** — applied to `/assets/*`, not to HTML |
| Visual quality | never observed | **VERIFIED** — 43 screenshots, 2 inspected directly; typography confirmed |
| **PERF-11 — gsap burns ~13 s of main-thread time on home mobile** | not measurable | **NEW P1 FINDING**, reproducible over 4 runs |
| LCP / CLS / TBT | not measurable | **MEASURED** — CLS 0 everywhere; LCP and TBT fail their thresholds on mobile |
| **INP** | not measurable | **still NOT MEASURED** — no field data; TBT is not INP |
| A11Y-11 — `vh`/`svh` | reported | **still unverified**; headless has no dynamic browser chrome |
