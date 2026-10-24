# Deliverable H — Release Readiness Decision

Codevio QA audit · 2026-10-17

## H.1 Decision

# NOT READY

Two release blockers prevent a responsible release recommendation. Neither is in the application
code. The browser-verification gap that also held the verdict down in earlier rounds has since been
closed ([Deliverable I](08-browser-verification.md)).
Neither blocker is in the application code — both are in the path from repository to
production — and both are cheap to clear.

The brief's own definitions decide it:

- **READY** requires that *"key user flows were verified"*. No browser was available, so **no
  user flow was verified end to end at all** — no page was rendered, no button was clicked, no
  form was submitted, no viewport was resized.
- **CONDITIONALLY READY** requires that *"no known critical blocker remains"*. Two P0 blockers
  remain, and they are not theoretical: they are the reason the public site does not contain any
  of the work under audit.
- **NOT READY** is defined as *"important defects, release blockers, or insufficient
  verification"*. All three apply.

---

## H.2 Evidence behind the verdict

### Blocker 1 — DEP-02: the audited code is not in the repository

`HEAD` is `bc6e77d` (2026-10-11) and equals `upstream/staging`. The working tree carries **41
modified tracked files and 106 untracked paths**, including six build-critical files that do not
exist at `HEAD` at all:

```
UNTRACKED  scripts/prerender.mjs            UNTRACKED  src/data/seo.js
UNTRACKED  scripts/generate-pages.mjs       UNTRACKED  src/lib/motion.js
UNTRACKED  src/components/ErrorBoundary.jsx UNTRACKED  src/components/LanyardScene.jsx
```

`HEAD:package.json` still says `"build": "vite build"`; the working tree has the three-stage
pipeline. Working-tree pages import `../data/seo`, `../lib/motion` and `./ErrorBoundary`, none of
which exist at `HEAD` — **a clean checkout cannot build the site.**

The cause is not negligence: the previous round's own plan says
*"Do not commit to git as part of this work. Do not deploy."* The instruction was followed, and
the consequence is a repository that cannot produce its own product.

### Blocker 2 — DEP-01: production contains none of it

Verified directly against `https://codevio-dev.netlify.app/`:

| Probe | Result |
|---|---|
| `GET /` | 200, 2,165 B |
| CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | **all absent** |
| `Strict-Transport-Security` | Netlify's default `max-age=31536000`, not the repo's `63072000` |
| `GET /robots.txt` | **404** |
| `GET /sitemap.xml` | **404** |
| `GET /services` | **404** |
| `GET /work/tara-jewellery` | **404** |
| Live HTML | hotlinks `fonts.googleapis.com` / `fonts.gstatic.com`; no `og:image`, no JSON-LD, no prerendered content |

`public/_headers` and `public/robots.txt` first entered git in `854f09a` (2026-10-05), and Google
Fonts were removed from `index.html` in that same commit. **The deployment predates it by at
least twelve days.** Every deep link on the staging host 404s, the host is indexable duplicate
content, and there is no clickjacking or `nosniff` protection in production.

### Verification gap — closed in the browser round

Rounds 1–3 had no browser: headless Chrome exited immediately (code `-36863`, no
`DevToolsActivePort`), `spawnSync` of Chrome returned `EPERM` while the same call with `cmd`
succeeded, `child_process` with piped stdio was denied, and `agent-browser` could not create its
socket directory outside the workspace.

**Full access was granted at the start of the browser round and all four probes now pass.** Every
check that was `BLOCKED` was then executed — see [Deliverable I](08-browser-verification.md):

- `npm run build` **exits 0 including prerender**; `dist/index.html` went from 4,017 bytes
  meta-only to **155,339 bytes** of real content with 30 internal links. **SEO-01 is closed.**
- **axe-core 4.14.0: 0 violations on all 8 routes.**
- **Lighthouse 13.5.0**, mobile ×4 and desktop: accessibility, SEO and best-practices **100**
  everywhere; **CLS 0** everywhere; LCP ≈3.71 s (home) and ≈3.46 s (services) mobile against a
  2.5 s threshold; desktop LCP **757 ms**.
- 35 page loads across 6 viewports: 0 horizontal overflow, one `<h1>` and one `<main>` per route,
  **0 console errors, 0 failed requests**.
- Keyboard: skip link becomes visible on focus; 8 focus stops all on screen with a visible ring;
  the menu trap, Escape and `aria-expanded` all behave.
- Route-change focus, reduced motion, the sticky sidebar, the routing table and the asset-cache
  rule were all **verified in the browser** rather than argued from source.

**What remains unverified, and it is a much shorter list:** **INP** (no field data was available,
and TBT is not INP — 8.4 s on home mobile is a lab blocking-time figure, not an INP figure);
**A11Y-11** (`vh`/`svh` needs dynamic browser chrome, which headless Chrome does not have); **no
Firefox, WebKit, iOS Safari or real-device testing**; and **no field/CrUX data**. The typography
fix — the largest change in the set — has now been **seen**, not just argued.

---

## H.3 What *is* verified, and why that matters

The code is materially better than at the start of the audit, and that is measured, not asserted:

| Evidence | Before | After |
|---|---|---|
| `npm run lint` | exit 0 | exit 0 |
| `vite build` (with the documented shim) | exit 0 | exit 0 |
| `generate-pages.mjs` | exit 0, 10 shells | exit 0, **11** shells |
| `npm test` | **no test infrastructure existed**; the new suite scored **16 pass / 2 fail** over 18 checks | **22 pass / 0 fail** (baseline-run count corrected; the 4 checks added or widened later were each red-green probed) |
| Finding counts | 2 P0, 9 P1, 21 P2, 13 P3 all open | **17 fixed**, 4 partially fixed, 1 mitigated; 36 open (2 P0, 5 P1, 10 P2, 7 P3, 12 informational) |
| Regression guards added | 0 | **22 permanent contracts**; the 4 added or widened after the baseline run were each red-green probed |
| Independent review of the fixes | — | A separate agent context reviewed the whole change set: **13 of 17 items `CONFIRMED CORRECT`, 3 defects in the change set found and fixed** (REV-01 P1, REV-02 P2, plus the test/doc weaknesses), and 1 item left `MITIGATED` with a reason |
| Lint honesty | `npm run lint` silently skipped every `.mjs` file, including the two build scripts | `eslint.config.js` now covers `scripts/**/*.mjs` and `tests/**/*.mjs`; enabling it surfaced and fixed 13 real errors |
| Total page weight | 5,499,411 B | 5,500,378 B (+0.02 %) |

Independently of the fixes, the audit established things worth knowing:

- The metadata pipeline is **contract-clean**: all 11 shells' title/description/canonical/OG tags
  match the single metadata source, the sitemap matches the route table exactly with no future
  dates, `robots.txt` is correct, `_redirects` covers every route with the catch-all last,
  `404.html` has no bogus canonical, the JSON-LD parses and invents nothing.
- The menu's keyboard contract is genuinely correct — focus is moved in, trapped, Escape returns
  focus, the closed panel is both `aria-hidden` and `inert`.
- There are **no credentials anywhere** in the repo, `.env*` handling is correct, there are no
  XSS sinks, no open redirect, and the CSP matches the real resource set exactly.
- The 3D stack really is off every non-home route's critical path.
- `npm audit` is 2 moderate, 0 high, 0 critical, and both advisories are unreachable — and the
  previous round's `^6.30.3` pin **did not** remediate them, which is now corrected in the
  register rather than papered over.

---

## H.4 What stands between NOT READY and READY

Ordered, and each is small:

1. **Commit the working set** (DEP-02). Until then nothing can be deployed and a clean checkout
   cannot build. This is the owner's call because it stages ~150 files of someone else's
   uncommitted work.
2. **Build and deploy** (DEP-01). `npm run build` now completes end to end including prerender on
   this machine, and the browser round confirmed the artifact; publishing it and re-running the
   header probe is what closes DEP-01 and SEC-07 together.
3. ~~**One browser pass** on the ten remaining manual checks.~~ **DONE** — see
   [Deliverable I](08-browser-verification.md). Prerender, `axe-core` on all 8 routes, Lighthouse
   mobile ×4 and desktop, 35 page loads across 6 viewports, the keyboard walkthrough, the routing
   table and the typography were all executed. Two things this pass changed: it **closed SEO-01**,
   and it found **PERF-11** — the largest performance finding in the audit, which no static
   analysis had surfaced. It also showed that a browser can falsify a source-level claim in both
   directions: my first marquee-focus fix could not be verified by programmatic focus at all
   (headless Chrome dispatches no `focusin` for it), so the fix was re-derived and re-verified with
   real Tab presses rather than left ambiguous.
4. **Decide on the four owner-level findings** — the undisclosed mock case studies (FUN-01), the
   contact form's false-success paths (FUN-02), the prerender fail-open (SEO-02), and the
   marketing claim in the meta description (INFO-10). None is a code problem; each is a
   judgement only the studio can make.
5. **Decide whether to take the performance work** (PERF-11 first, then PERF-01/02/03). PERF-11 is
   now the top of that list: **≈8.4 s of blocking time on home mobile, attributed to `gsap` at
   13.0–13.2 s of script bootup across four consistent runs**, versus 3.9 s for the whole
   three/rapier stack. The others are 1.57 MB of base64-inlined WASM, 3.82 MB fetched two frames
   after first paint on `/`, and 233 KB of animation libraries on every route — all still true, none
   of them a release blocker, and none of them the dominant main-thread cost.

---

## H.5 What would make this NOT READY even after the above

Recorded so the verdict cannot be quietly satisfied by process alone:

- If step 3 finds that the typography change reads wrong, or that the pinned label groups no
  longer match, TA-01 should be reverted rather than patched around. The revert is one line
  (`--sans` back to `'Bebas Neue'`) plus the six pinned classes, and the two tests that guard it
  would need to be deleted deliberately rather than silently.
- If the three undisclosed mock case studies ship as they are, the pages that exist to win
  search traffic will keep making unverifiable client claims and showing another artist's
  credited artwork as a "rebrand" (FUN-01, FUN-07). That is a commercial and reputational risk
  the code cannot fix, and no amount of technical SEO offsets it.
- If the contact form's false-success paths (FUN-02) are left as they are, an unknown and
  unmeasured share of real enquiries will be acknowledged and discarded with no error anywhere
  for anyone to notice.

## H.6 Explicit non-claims

- No WCAG conformance level is claimed. Automated scanning **did** run (axe-core 4.14.0, 0
  violations on 8 routes) and Lighthouse accessibility scored **100**, but automated tooling cannot
  establish conformance, and no screen-reader pass was performed.
- Performance figures **are** now claimed, and only these: Lighthouse 13.5.0 **laboratory** runs on
  this machine against the local build — mobile home (n=4) LCP ≈3706 ms, TBT 7998–8792 ms, CLS 0,
  perf ≈50; mobile services (n=4) LCP ≈3459 ms, TBT ≈347 ms, CLS 0, perf ≈79; desktop home (n=1)
  LCP 757 ms, TBT 1076 ms, CLS 0, perf 66; accessibility/SEO/best-practices 100 on all runs.
  **INP is not claimed anywhere** — it needs field data, and TBT is not INP. **No real-user data was
  available** (no CrUX, no Search Console, no analytics). The repository's own earlier figures are
  quoted once, labelled `[doc]`, and never used as a baseline.
- No claim is made about Firefox, WebKit, iOS Safari or any real device. Every browser measurement
  above is headless Chrome 141 on Windows via CDP.
- No claim is made about what is live. The live host serves a build that predates the code under
  audit; every "the site has X" statement in these deliverables describes the repository and its
  `dist/` output, not `codevio-dev.netlify.app`.
- Nothing was deployed or committed. `promo-video/` (65.6 MB of the owner's local video project) and
  the three PDFs at the workspace root were not touched. The only files added outside `docs/qa/` and
  `tests/` are the browser evidence in `.qa-evidence/` (43 screenshots plus the raw measurement
  JSON), which is gitignored.
