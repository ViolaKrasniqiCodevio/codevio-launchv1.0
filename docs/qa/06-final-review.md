# Deliverable G — Final Review

Codevio QA audit · 2026-10-17

This is the Supervisor's review of the audit and of its own remediation, plus the result of the
independent review pass. It is written in the Ponytail skill's format
(`ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`).

---

## G.1 What the change set is

22 files. 17 findings fixed, then 3 defects **in this change set** found by the independent review
and fixed too (10 review items in total). No dependency added, removed or upgraded. No route,
layout or copy restructured except where a finding required it.

**Application code (16):** `src/index.css`, `src/components/SpecularButton.css`,
`src/components/ScrollToTop.jsx`, `src/components/StaggeredMenu.jsx`, `src/components/LogoLoop.jsx`,
`src/components/Grainient.jsx`, `src/components/ContactForm.jsx`, `src/components/Footer.jsx`,
`src/components/LanyardScene.jsx`, `src/pages/About.jsx`, `src/pages/CaseStudy.jsx`,
`src/pages/Contact.jsx`, `src/pages/Mission.jsx`, `src/pages/NotFound.jsx`, `src/pages/Services.jsx`,
`src/pages/Work.jsx`.

**Build and deployment (4):** `public/_headers`, `scripts/generate-pages.mjs`, `package.json`,
`eslint.config.js`.

**New (1):** `tests/site-contracts.test.mjs` (20 checks).

**Documentation:** `docs/qa/` (9 files), `CHANGELOG.md`, `AGENTS.md`.

**Not touched, deliberately:** `src/components/Lanyard.jsx` (standing project constraint on the
lanyard's drag, kinematics, physics, MeshLine/curve and strap logic), `promo-video/` (65.6 MB of
the owner's local video project), `src/assets/*`, `index.html`, `vite.config.js`,
`public/_redirects`, `public/robots.txt`, `public/sitemap.xml`, `eslint.config.js`, and the three
PDFs at the workspace root.

---

## G.2 `ponytail-audit` — whole-repo verdict

**What this repo does:** a static marketing site for a small studio, one Vite + React 19 app with
six routes, four case-study pages and a catch-all, a bespoke 3D home page, a shared shell with a
GSAP menu and a shader background on every other route, and a Formspree contact form. Load
assumed: a public marketing site, low request rate, no accounts, no sessions, no server-side
state, no user-generated content.

The full ranked findings list is **Deliverable C**. The audit-level verdict:

**Verdict: `Verdict: fix 1 and 3 first.`** — where 1 and 3 are the two P0 deployment blockers
(the code is not committed; production contains none of it). Everything else is either
evidenced-and-open, or needs a browser, an asset, or an owner decision.

The three things a senior developer inheriting this repo should know before anything else:

1. **The repository cannot build its own product.** `HEAD` is missing six files the working tree
   imports. Any git-based deploy republishes the old site.
2. **The largest performance cost is a decoration.** 3.58 MB of the 5.5 MB `dist/` is the 3D
   stack on `/`, and 1.57 MB of that is one base64-inlined WASM module pulled in by
   `@react-three/rapier`.
3. **The metadata and deployment-config layer is genuinely well built.** All 11 shells' titles,
   descriptions, canonicals and OG tags match a single source of truth; the sitemap, `robots.txt`,
   `_redirects` and the 404 shell are all correct; the JSON-LD is valid and invents nothing. That
   is unusual and it is worth not breaking — which is why this audit added 22 contracts to guard
   it.

### Lean findings (what could still go)

| Finding | What could go |
|---|---|
| 17 orphaned artefacts from earlier iterations dead in CSS | `Lanyard.css` redefines `.lanyard-textbox { bottom }` in four overlapping `@media (max-width:768px)` blocks, so three of them never apply; `.lanyard-wrapper canvas { touch-action: pan-y }` is duplicated verbatim at `:42` and `:245` |
| Dead utility | `StaggeredMenu.jsx:546`'s `p-[6em_2em_2em_2em]` never wins against the unlayered `padding: clamp(...)` at `:756` |
| Duplicate markup | Home, About and Contact each hand-roll the shell (`Grainient` + `StaggeredMenu` + `Footer` + `Lanyard.css`) that `PageShell` already provides; the three call sites pass identical values |
| Dead font files | two legacy `.woff` fallbacks (28,628 B in `dist/`) that no browser with `woff2` support will ever fetch |
| Unused variables | `CONTACT_FORM.fallbackAction` duplicates `CONTACT_FORM.endpoint` verbatim; `--shadow`, `--code-bg`, `--selection-*` are declared and barely used |
| `LogoLoop` re-runs two effects every render | harmless (state settles) but noise |

None of these is a defect and none was changed: the brief forbids unrelated refactoring, and a
QA pass that starts deleting "dead" CSS is a QA pass that breaks someone's layout.

### Lean summary

`Lean: −40 lines, −0 dependencies possible.` — all of it cosmetic (the four duplicate media
queries, the duplicated `touch-action`, the dead `p-[6em…]`, and the two `.woff` fallbacks), and
none of it recommended without a visual check.

---

## G.3 `ponytail-review` — the change set

Reviewed against the order of importance: correct, safe, holds under load, tested, fast, lean.

**Findings: none that block.** The specific things checked:

| Check | Result |
|---|---|
| Any change that alters a physics/rendering value? | **No.** `LanyardScene.jsx` only gates `gravity`, `active` and `spinning`. `Lanyard.jsx` was not modified. |
| Any change that weakens a security control? | **No.** `public/_headers` only gained a `/assets/*` cache rule. `script-src` still free of `unsafe-inline`/`unsafe-eval`; the new test asserts it stays that way. |
| Any change that removes validation or error handling? | **No.** The honeypot, min-fill-time, `submittingRef`, `noValidate` + custom validation, and the no-JS `<form action>` fallback are all intact. |
| Any new dependency? | **No.** The test suite uses `node:test`, `node:assert`, `node:fs`, `node:path`, `node:url` only. |
| Any temporary debugging code, `console.log`, or dead branch added? | **No.** |
| Any credential or environment value exposed? | **No.** |
| New console errors? | **None expected.** `Grainient`'s added `loseContext()` runs on a context being torn down; the `ErrorBoundary` and the two existing `console.warn` calls for WebGL fallback are unchanged. **Not observed — no browser.** |
| Any accessibility regression? | **One to watch**, `UNC-07`/`UNC-08`: the reduced-motion 3D state and the announcement behaviour of the new `role="alert"` errors were not heard or seen. Both are additions of missing behaviour, not replacements. |
| Any performance regression? | Measured: `dist/` +967 B (+0.02 %), JS +405 B with one fewer request. No material change. |
| New abstraction, wrapper, config or "for later" code? | **No.** The largest single addition is 7 lines (`ScrollToTop`). |
| Unrelated changes? | **No.** Every one of the 17 file-level changes maps to a numbered finding in Deliverable C. |

**Two honest criticisms of my own change set:**

1. **The typography fix is the largest change and has the least direct evidence.** The blast
   radius was found by a sweep and resolved by hand (6 elements pinned, 4 shown unaffected by
   nesting), and the built CSS is verified — but nobody has *looked* at the result. The
   independent review then proved the sweep was also **incomplete**: it keyed on `uppercase` and
   missed `/about`'s stat block, which is REV-02. If the typography reads wrong, the revert is one
   line plus the pinned classes, and the two tests that guard it would have to be deleted
   deliberately rather than silently.
2. **My first version of the focus fix did not work.** `ScrollToTop` focused `#main` in a layout
   effect that commits with the route change, so it only found the element when the destination
   chunk was already cached — the majority of first navigations in a session were unaffected.
   **I reported A11Y-01 as FIXED without having measured it**, and only the independent review
   caught that. That is exactly the failure `verifying-before-completion` exists to prevent, and it
   is the most useful thing this audit learned about its own process.
3. `--test-isolation=none` in the `npm test` script is a **sandbox accommodation, not a
   preference.** It runs every test file in one process. It is safe here because nothing in the
   suite mutates global state, but a future test that does would behave differently than under the
   default. The reason is written into `AGENTS.md`.

`Verdict: Ship — subject to the two P0 deployment blockers and one browser pass.`
`Lean: -3 lines taken (the dead --mono declaration); the handleFocus/handleBlur aliases are kept because they carry the why. -40 lines available elsewhere, not recommended unverified.`

---

## G.4 `ponytail-debt` — the ledger

Run exactly as the skill documents it:

```
git grep --no-index --exclude-standard -nE '(#|//|/\*) ?(shortcut|ponytail):'
```

**No shortcut debt. Clean ledger.**

A wider sweep for `TODO` / `FIXME` / `HACK` / `XXX` across `src/` and `scripts/` also returned
**zero hits**. One `eslint-disable` exists and is justified in place:
`react-hooks/immutability` for drei's cached texture needing shared repeat wrapping
(`LanyardScene.jsx:134`).

**One process observation worth recording.** The codebase documents its deliberate tradeoffs in
prose — for example `prerender.mjs`'s header comment explaining that a missing browser warns and
exits 0 "so a deploy on a machine without a browser is never blocked". That is a real, considered
decision, but it does not use the `shortcut:` marker the project's own tooling scans for, so it
never appears in this ledger. `SEO-02` is exactly the kind of deferral that quietly becomes
permanent. Adopting the marker convention for build-pipeline tradeoffs would put decisions like
that where the ledger can find them.

`0 markers, 0 with no trigger.`

---

## G.5 `ponytail-gain` — honesty boundary

Read and applied only for its boundary rule: it is a published benchmark of the skill, not of this
repository, and it explicitly forbids printing a per-repo savings figure because the unbuilt
version was never written and there is no real baseline to subtract from.

**No per-repo savings number is reported anywhere in these deliverables.** The only counted
per-repo figures are the byte measurements in Deliverable E and the ledger above.

---

## G.6 Independent review

A separate agent, in its own context, was given the file list, the claim behind each change, and
the instruction to review adversarially — to find counterexamples, regressions, vacuous tests,
and unnecessary code, and to state `CONFIRMED CORRECT` / `WRONG` / `UNVERIFIED` for each item.

**Result: see §G.6.1. The reviewer's output is reproduced rather than summarised, so its own
wording and severity calibration survive.**

### G.6.1 Reviewer output

Reviewed revision: the tree after the 17 fixes. The reviewer's own summary of the change set:

> It moves the inherited body font off the unicase Bebas Neue onto Geist (pinning display-face
> labels by name), adds route-change focus management, a nav landmark, marquee focus-pause,
> explicit WebGL context release, reduced-motion gating for the Rapier physics, live-region/focus
> fixes plus a honeypot `inert` on the contact form, contrast and icon a11y touch-ups, immutable
> caching for `/assets/*`, and a static-contract test suite wired into `npm test`.

**Must fix (both were real defects in this change set — see register §C.10 REV-01 and REV-02):**

1. **The focus fix no-opped on the first visit to every lazy route.** `?.focus()` sits in a layout
   effect that commits *with* the route change, so it only finds `#main` when the target chunk is
   already cached. Reload `/`, keyboard-open the menu, activate "Services": the chunk is unfetched,
   React commits `RouteFallback` (a `fixed inset-0 bg-black` overlay with no `id="main"`) in that
   same commit, `getElementById('main')` is `null`, and no effect re-runs when Services mounts — so
   `document.activeElement` stays `<body>`. That is 7 of 8 routes on first visit, i.e. the case
   A11Y-01 was filed for. *Fix:* retry over animation frames, or move the focus into the route
   content. *If skipped:* A11Y-01 is marked FIXED while a keyboard user's first navigation still
   lands on `<body>`.
2. **`/about`'s stat values changed face** while the same `STATS` data is pinned to Dela Gothic One
   on `/`, and the blast-radius scan missed it because it keyed on `uppercase`. The change set's own
   claim that nothing but prose changed was therefore false for that block.

**Should fix:** the `_headers` guard could not see a `Cache-Control` added *after* the `/assets/*`
block (demonstrated by evaluating both regexes against a tampered string); the label guard covered
one tracking value and never saw `className={cx(...)}`; the red→green arithmetic could not be
reconciled with the suite that shipped; and the change set was three files wider than the list it
was given.

**Nice to have:** dead `--mono`; focus not returned after "Send another"; the `BreadcrumbList`
negative check sampling one shell; `prefers-reduced-motion` read once and never re-read.

**On the specific probes it was asked to run**, it confirmed: focus does **not** fire on first load
(`useNavigationType()` is `Action.Pop` for the initial location) and `preventScroll` is doing real
work; `onFocus`/`onBlur` aliasing causes no flicker and no stuck pause, because React maps them to
bubbling `focusin`/`focusout` so blur→focus collapses to one render with `true`; the `<nav>` swap
breaks neither `aria-controls`/`aria-expanded` nor the landmark structure; `inert` affects **only**
focus and the a11y tree, because `@formspree/react` builds the body with `new FormData(form)`,
which enumerates every named control regardless — so `_gotcha` is still submitted and still
filtered server-side; there is no import cycle and `/work/<unknown>` still pairs the 404 status with
the rendered NotFound; and **nothing was lost** from the regenerated `dist/index.html` (both favicon
links, the transparent-`body` inline style, 2 JSON-LD blocks, `<noscript>`, 7 modulepreloads, 2
stylesheets, all OG/Twitter tags, `theme-color` and the module script are present; the only content
delta is that the two descriptions now match). It also re-derived the unicase proof independently
with `fontTools` and confirmed that every file under `dist/assets/` is content-hashed, so the
immutable rule cannot pin mutable content.

**Its item-by-item verdicts:** items 1, 2, 4–17 `CONFIRMED CORRECT`; item 3 `WRONG` (the focus
effect fails when the destination chunk is uncached); item 18 `WRONG` (the suite has 19 tests at
that point, not the 18 it was told); item 19 `WRONG` (the directory exists, but two of its own
claims were false — the arithmetic and the file list).

**Reviewer verdict, verbatim:**

> Verdict: fix 1 and 5 first.
> Lean: -3 lines possible (-1 `--mono` declaration in src/index.css:73; -2 by inlining the
> `handleFocus`/`handleBlur` aliases at LogoLoop.jsx:302-303). Separately, docs/qa restates the same
> result tables in 4–5 files (~143 KB of markdown for a 326-line diff) and the copies already
> disagree — consolidating to the issue register plus one report would remove ~1,000 lines and the
> inconsistency.
> Not checked: any rendered output (no browser in this sandbox and dev/preview/build are off-limits),
> so the focus-ring prediction, live-region announcement order, shader-backdrop contrast, and the
> dist artifacts (which the environment rebuilt at 14:03:29 while I reviewed; `scripts/prerender.mjs`
> still exits 1 under the sandbox's spawn EPERM, so no shell has a `<noscript>` snapshot).

### G.6.2 Supervisor's response to the review

Every correctness finding was **verified before acting**, then fixed, then re-verified:

| Finding | Verified how | Fix | Re-verified |
|---|---|---|---|
| REV-01 focus no-op | Read `App.jsx:92-109` — `RouteFallback` really has no `#main`, and `ScrollToTop`'s effect deps (`pathname`, `navigationType`) really do not change again when the chunk resolves | Bounded `requestAnimationFrame` retry | lint 0, build 0, tests 20/20 at the time (22/22 now); new test asserts every route renders a `#main` |
| REV-02 About stat face | Read `About.jsx:350` — no `fontFamily`, no `font-['…']` | Pinned both value and label to `font-['Bebas_Neue']` | Broadened label guard now scans it |
| REV-03 `_headers` hole | Re-read the assertion — it sliced on `/assets/*`, which is the last block | Block parser; no other block may carry `Cache-Control` | Red-green probed: tampered file → exit 1; restored → exit 0 |
| REV-04 narrow guard | Re-ran the scan broadened — it flagged exactly the 2 known-safe spans | Any `tracking-[<n>em]`, expression classNames, count-asserted allowlist | Red-green probed |
| REV-05 doc arithmetic | Recounted the baseline run: 18 checks, 16 pass, 2 fail — the reviewer's "must have been 3 fail" assumes the 19th check existed then, which it did not | Stated 18/16/2 and marked the later checks as individually probed | Numbers cross-checked across all 9 docs |
| REV-06 full-page outline | Read `index.css` — no `outline` suppression existed | `#main:focus-visible { outline: none }` | Red-green probed via the focus-target test |
| REV-07 focus after reset | Traced `reset()` — it only sets state | `requestAnimationFrame` focuses the first field | lint 0, build 0, tests 20/20 at the time (22/22 now) |
| REV-08 one-shell sample | Read the assertion | Loop over every non-case-study shell | Red-green probed: injected a `BreadcrumbList` into `dist/about.html` → exit 1 |
| REV-09 dead `--mono` | `git grep -- '--mono'` — only the declaration and my own docs | Deleted | Built CSS contains no `--mono` and still has `--sans:"Geist Variable"` |
| LINT-01 `.mjs` unlinted | Probed: `var unusedThing` in a `.mjs` → lint exit 0; the same in `.js` → exit 1 | Node-globals block for `scripts/**/*.mjs` and `tests/**/*.mjs` | Probed again: bad `.mjs` → exit 1; after deleting the probe → exit 0. Enabling it surfaced 13 real errors, all fixed |
| REV-10 reduced motion read once | Accepted as accurate | **Not fixed** — recorded as `MITIGATED` in §C.10 with the reason | n/a |
| "docs duplicate each other, ~143 KB for a 326-line diff" | Accepted as accurate | **Not fixed** — deliverables A–H with those contents are what the brief requires. Mitigation: the issue register is the single source of truth for findings and the other documents reference it | n/a |
| "-3 lines possible" | Accepted for `--mono` only | `--mono` deleted. The `handleFocus`/`handleBlur` aliases are **kept**: they carry the comment explaining why a mouse handler is wired to focus, and inlining them would lose that | n/a |

Two honest notes about the review itself. First, it reviewed a moving tree — the pinning edits
landed mid-review — and it said so rather than silently reporting on a stale revision. Second, its
claim that the pre-fix figure "must have been 16 pass / 3 fail / 19" is wrong: the baseline suite
had 18 checks, and 16 + 2 = 18 is what the run printed. I did not adopt a correction that the
evidence did not support, and the register records both readings.

---

## G.7 Remaining technical debt

Ordered by how likely it is to bite.

| # | Debt | Why it is debt | Cost to clear |
|---|---|---|---|
| 1 | The application cannot be built from `HEAD` (DEP-02) | Six build-critical files are untracked; a clean checkout does not compile | One commit |
| 2 | The prerender step fails open (SEO-02) | A Chrome-less machine ships meta-only shells with a green build, silently — which is what happened here | One `process.env.CI` check, or an assertion on `dist/index.html` |
| 3 | `_redirects` is hand-maintained (SEO-04) | A new route 404s on refresh while working on client-side navigation | Now guarded by a test; generating it from `ROUTE_META` would remove the class |
| 4 | 1.57 MB of base64-inlined WASM (PERF-01) | ~164 KB brotli of pure encoding overhead per home visit, and the module can never stream-compile | Swap the Rapier build, or drop physics from the decoration |
| 5 | `@react-three/rapier`'s `-compat` build is pinned by an import path, not a decision | Nothing in the repo records why the compat build was chosen | A `shortcut:`-style note next to the import |
| 6 | Four overlapping `@media (max-width:768px)` blocks redefine one property (`Lanyard.css`) | Three are dead; the real mobile geometry cannot be read from source | Delete three |
| 7 | Home/About/Contact hand-roll `PageShell` | Four copies of the shell that must change together | Consolidate — but that is a refactor, not a fix |
| 8 | `npm run lint` never read a single `.mjs` file (LINT-01) | The two scripts that drive the build and the suite that guards it were unlinted, so `npm run lint` reported success without reading them — how the six untracked build files went unnoticed | Fixed: a Node-globals block for `scripts/**/*.mjs` and `tests/**/*.mjs`; it immediately surfaced 13 real errors |
| 9 | `--mono` was declared and read nowhere | A design token that claimed a monospace stack the site never used | Fixed: deleted |
| 10 | `prefers-reduced-motion` is sampled once in `LanyardScene` (REV-10) | A mid-session OS toggle is ignored until reload, unlike framer-motion's live `MotionConfig`. The same one-shot shape exists in `StaggeredMenu` and `SplashScreen` | Recorded as `MITIGATED`; subscribing costs a listener per mount for a rare case |
| 11 | No `report-to` on the CSP (INFO-05) | A CSP regression is silent — which is how the missing-headers situation went unnoticed for 12 days | Add a reporting endpoint |
| 12 | `→` is missing from all three shipped latin subsets, and `font-['Bebas_Neue']` / `font-['Dela_Gothic_One']` declare **no fallback list** at all (TA-02) | 10 visible strings — including the case-study metric badges — render the arrow in the browser's default face beside condensed caps, and nothing in the cascade pins the result, so it varies per browser | Either use the lucide `ArrowRight` this codebase already uses elsewhere, or write the utilities with a stack. Reported, not applied: it changes rendered output and no browser was available to see it |

## G.8 Complexity removed vs. complexity added

**Removed:** three dead `Lanyard.css` candidates for `padding`/`bottom` remain (not removed — see
G.2), but the audit did remove one genuine source of confusion: `--mono` no longer holds a
sans-serif, `font-family: inherit` on `SpecularButton` is no longer an implicit dependency on a
global variable, and the six label elements that relied on inheritance now say what they mean.

**Added:** 19 test contracts, 7 lines of focus management, one attribute here and there, and
8 documents plus this index. The tests are the only substantial addition, and they are the reason
10 of the 17
fixes cannot silently regress. No abstraction, wrapper, or configuration was introduced.

## G.9 What this review does not cover

- **Nothing was rendered.** No screenshot, no keyboard walkthrough, no `axe-core`, no Lighthouse.
  Every visual and behavioural claim in this section is a code-level claim.
- **The independent reviewer shares this sandbox**, so it had no browser either, and its review is
  a source review. Its independence is in context and authorship, not in tooling.
- **No field data.** No CrUX, no Search Console, no analytics. Nothing is claimed about real users.
- **Nothing is claimed about Firefox, WebKit, or any device.**
