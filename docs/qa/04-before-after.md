# Deliverable E — Before-and-After Comparison

Codevio QA audit · 2026-10-17

## E.1 How to read this table

"Before" is the source tree as it stood at the start of this audit. "After" is the same tree
with the 17 fixes in Deliverable D applied.

**Provenance is marked per cell, because the measurement methods differ and pretending
otherwise would be dishonest:**

- `[self-A]` — measured by me on the **pre-fix** build (my first `vite build` in this session)
- `[self-B]` — measured by me on the **post-fix** build (the final `vite build`)
- `[agent-C]` — measured by audit agent C on the pre-fix `dist/` using node `zlib`
- `[doc]` — recorded in the repository's own plan document from the previous round; **not
  re-measured by me** and labelled as such
- `N/A` — not measurable in this environment, with the reason given

Two environment facts are needed to read the metrics row fairly:

1. **This sandbox cannot launch a browser**, so `scripts/prerender.mjs` cannot run. Every
   `< 50 KB` HTML figure below means "meta-only shell", not "the site is that small".
2. **The `dist/` directory at the start of this audit was already a prerendered build** from an
   earlier session (on a machine that had Chrome): `dist/index.html` was **151.5 KB** `[self-A]`.
   Running `vite build` replaced it with the 4,017-byte meta-only shell `[self-A]`. That is a
   consequence of the build running in a Chrome-less environment, **not a regression introduced
   by the fixes.** The same is true of the "After" column.

---

## E.2 Required metrics

| Metric | Before | After | Result |
|---|---|---|---|
| **Production build** | `npm run build` → **exit 1**: `vite build` dies loading its config (`exec("net use")` → `spawn EPERM`). With the documented sandbox shim: `vite build` **exit 0**, `generate-pages.mjs` **exit 0**, `prerender.mjs` **exit 1** (`browser setup failed (spawn EPERM)`) `[self-A]` | Identical: `npm run build` still exit 1 without the shim; with it, `vite build` **exit 0** (1.35 s, 2,829 modules), `generate-pages.mjs` **exit 0**, `prerender.mjs` **exit 1** `[self-B]` | **PASS (no regression).** The prerender failure is environmental in both columns and is issue SEO-01/SEO-02. |
| **Automated tests** | **No test infrastructure existed.** `AGENTS.md`: *"There is no test, typecheck, formatter, CI, or code-generation script in this repository."* Running the new suite against the pre-fix sources: the suite had **18 checks → 16 pass / 2 fail**, both failures the typography contracts `[self-A]` | **22 pass / 0 fail** (`node --test --test-isolation=none "tests/**/*.test.mjs"`), exit 0; `npm run lint` exit 0 `[self-B]` | **PASS.** +22 permanent checks. The 4 checks added or widened after the baseline run were each **individually red-green probed** (exit 1 on a real break, exit 0 after a sha256-verified restore) rather than claimed. |
| **Accessibility findings** | 17 findings from a source-level WCAG 2.2 AA audit: 0 × P0, 3 × P1, 8 × P2, 5 × P3, 1 × Info `[agent-B]` | 17 findings re-scored against the fixed tree: **10 fixed** (A11Y-01,02,03,04,05,06,07,08,10,15), **1 partially fixed** (A11Y-13 — Grainient hidden, the R3F canvas not), **6 open** (A11Y-09,11,12,14,16,17) `[self-B]`. A11Y-01's first fix was itself defective and was corrected in the review round (REV-01). | **Improved, not resolved.** No WCAG 2.2 AA conformance claim is made: axe-core was never run and no keyboard walkthrough happened. |
| **SEO findings** | 10 findings (SEO-01…SEO-10), of which 1 × P1, 6 × P2, 3 × P3 `[agent-C]` | **2 fixed** (SEO-05 home description divergence, SEO-09 soft-404 robots/canonical), **1 mitigated** (SEO-04 now has an automated guard), **7 open** (SEO-01, 02, 03, 06, 07, 08, 10) `[self-B]` | **Improved.** The metadata pipeline was already contract-clean on 8 of 10 checks before and after; the remaining items need a browser, a pipeline decision, or content sign-off. |
| **Lighthouse Performance** | **N/A** — no browser. Not measured by me and not inferred from the repo's records `[self-A]` | **N/A** — same reason `[self-B]` | **N/A.** Any number here would be invented. |
| **LCP** | **N/A (lab)**. The repository records 3,221–3,374 ms mobile lab LCP from a previous round on a machine with Chrome `[doc]` — quoted for context only, **not re-measured**, and it describes the pre-prerender build | **N/A** `[self-B]` | **N/A.** No field data either (no CrUX / Search Console access). |
| **CLS** | **N/A (lab)**. Repository records CLS 0 (home and services) `[doc]` | **N/A** `[self-B]` | **N/A.** |
| **Total Blocking Time** | **N/A (lab)**. Repository records TBT ≈ 4,117 ms mobile (home) and ≈ 102 ms (services) `[doc]` | **N/A** `[self-B]` | **N/A.** TBT is **not** INP and neither is reported as one. |
| **JavaScript transfer size** | `dist/**/*.js` = **3,984,333 B across 24 chunks** `[agent-C]`; `seo-*.js` was its own 1,184 B chunk | `dist/**/*.js` = **3,984,738 B across 23 chunks** `[self-B]`; `ROUTE_META` moved into `Lanyard-*.js` (53,835 → 55,235 B) | **+405 B (+0.01 %), one fewer request.** Cause: importing `NotFound` into `CaseStudy` (fix 13) changed Rollup's chunk grouping and merged the tiny metadata module. Verified still shipped: both `ROUTE_META` strings are present in `Lanyard-C-9ryaXw.js`. **No material change.** |
| **Total page weight** | `dist/` = **67 files, 5,499,411 B** `[agent-C]` | `dist/` = **66 files, 5,500,378 B** `[self-B]` (+967 B = +0.02 %) | **No material change.** |
| *(context)* CSS | 53,483 B across 4 files `[agent-C]` | 53,687 B across 4 files `[self-B]` (+204 B: the typography comment and the pinned label utilities) | No material change. |
| *(context)* HTML | 44,853 B across 11 shells `[agent-C]` | 44,917 B across 11 shells `[self-B]` (+64 B: `index.html`'s OG description now matches its meta description) | No material change. |
| *(context)* fonts, images, GLB | woff2 56,972 B (3), woff 28,628 B (2), jpg 864,409 B (8), webp 62,758 B (4), glb 272,928 B (1), png 102,917 B (4) `[agent-C]` | Byte-identical per extension `[self-B]` | No change — no asset was added or removed. |

---

## E.3 What the numbers do *not* say

- **They do not say the site got faster.** Total bytes moved by +0.02 %. The two real
  performance wins in this audit are a **caching** change (PERF-06: repeat visits stop
  revalidating 3.98 MB of JS and the 273 KB GLB) and the **removal of a dead 29,400-byte font
  from the render path** by actually applying Geist (TA-01) — neither of which shows up in a
  first-load byte total. The largest performance problems found (PERF-01: 1.57 MB of
  base64-inlined WASM; PERF-02: 3.82 MB fetched two frames after first paint; PERF-03: 233 KB of
  animation libraries on every route) are **untouched** and remain in the "After" column.
- **They do not say the site is accessible.** Automated scanning is still `BLOCKED`; the
  accessibility row is a count of source-level findings, not a conformance level.
- **The HTML figures are misleading in isolation.** Before: 151.5 KB prerendered (`[self-A]`,
  from an earlier session's build on another machine). After a rebuild here: 4,017 B meta-only.
  The visible "regression" is the environment, not the code — which is precisely why SEO-02
  (the pipeline fails open) is worth fixing.
- **No before/after comparison is possible for LCP, INP, CLS, TBT, Speed Index or page request
  count**, because none of them could be measured on either side.

---

## E.4 Environmental differences that make comparison unreliable

| Difference | Effect |
|---|---|
| No browser in this sandbox | Prerender disabled; no screenshots, no axe, no Lighthouse, no field metrics. The current `dist/` is a **worse artifact** than the one present at session start, for environmental reasons only. |
| `child_process` with piped stdio is denied | Vite's config load needs a shim to run at all; `npm run build` cannot be executed as written. Both columns used the same shim, so the comparison between them is fair — but neither equals a normal developer machine. |
| Pre-fix bytes measured by a different agent/script revision than post-fix bytes | Both used node `zlib` and `fs` on the same `dist/` path, and the totals agree to within 1 KB, so the deltas are trustworthy at the scale reported. Per-chunk attributions are labelled per cell. |
| `curl.exe` cannot do TLS here (`schannel: SEC_E_NO_CREDENTIALS`) | The live-site comparison went through Node `fetch` instead. |
| The repo's own LCP/TBT/CLS figures come from a different session and a pre-prerender build | Quoted as `[doc]` only. They are not a baseline for the After column. |
