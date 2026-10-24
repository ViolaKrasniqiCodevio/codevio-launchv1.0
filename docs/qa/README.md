# Codevio QA Audit — 2026-10-17

Evidence-driven QA and controlled remediation of the Codevio site. Every claim in these
documents is tied to a command that was actually run, or is explicitly marked as blocked,
unconfirmed, or reported-but-not-verified.

**Verdict: [NOT READY](07-release-readiness.md)** — two deployment blockers, both outside the
application code. The browser-verification gap that also held the verdict down has since been
closed; see [Deliverable I](08-browser-verification.md).

## Deliverables

| # | Document | What it covers |
|---|---|---|
| A | [Harness and skill inventory](00-harness-and-skill-inventory.md) | Runtime, what the DSH skill catalogue exposes vs. what is installed, the sandbox shim used for the build, every skill actually read and applied, what delegation really happened, and what was blocked |
| B | [Test plan and coverage matrix](01-test-plan-and-coverage-matrix.md) | Route/component/feature inventory and a test matrix that separates **executed**, **read-only**, and **blocked** |
| C | [Complete issue register](02-issue-register.md) | 58 numbered findings with stable IDs, severity, reproduction, evidence, fix, and status; 9 unconfirmed risks listed separately; 6 reported items that were rejected and why |
| D | [Remediation report](03-remediation-report.md) | The fixes: original problem, root cause, files, solution, reasoning, regression test, verification, residual limitation |
| E | [Before-and-after comparison](04-before-after.md) | Required metrics table with per-cell provenance, plus the environmental differences that make some comparisons unreliable |
| F | [Test execution record](05-test-execution-record.md) | Every command with its real exit code; passed, failed, blocked, pre-existing, regressions found and resolved, remaining manual verification |
| G | [Final review](06-final-review.md) | The Ponytail audit/review/debt passes, the independent reviewer's verdict, and the remaining technical debt |
| H | [Release readiness](07-release-readiness.md) | The decision, the evidence behind it, and what stands between NOT READY and READY |
| I | [Browser verification](08-browser-verification.md) | The browser round: prerender, axe-core, Lighthouse, keyboard and routing behaviour, and the new P1 finding it produced |

## The 30-second version

**Fixed (17 + 10 review-round + 2 browser-round):** body copy was rendering in a unicase all-caps
display face while an unused Geist font shipped; focus was lost on every route change; the primary
nav had no landmark; the tech marquee never paused for keyboard focus; two `/about` labels and
three hover states failed contrast; the 3D physics ignored `prefers-reduced-motion`; form errors
were announced one at a time and success was never announced; the honeypot exposed a focus dead
end; the case-study sidebar sat under the fixed header; six decorative icons were exposed; the menu
never closed on a link click; an unknown case-study slug silently rewrote a 404 URL into a valid
one; a WebGL context was never released; `/` shipped two different OG descriptions; a soft 404 left
a duplicate robots tag and a stale canonical; fingerprinted assets had no `Cache-Control`; and
`eslint .` never read any `.mjs` file.

**Still open and worth knowing (the top ones):**

- **DEP-01 / DEP-02 (P0)** — the deployed site contains none of the hardening, and the hardening is
  uncommitted, so a clean checkout cannot build the site at all.
- **PERF-11 (P1, new)** — on a simulated mid-tier phone the home page blocks the main thread for
  **≈8.4 s**, and Lighthouse attributes **13.0–13.2 s of script bootup to `gsap`** across four runs,
  against 3.9 s for the entire three/rapier stack. This corrects the earlier framing that blamed the
  3D scene.
- **PERF-01 / PERF-02 / PERF-03 (P1)** — 1.57 MB of WebAssembly is base64-inlined in the largest
  chunk, `/` fetches 3.82 MB two frames after first paint, and 233 KB of animation libraries load on
  every route. All still true; none is the dominant main-thread cost.
- **FUN-01 (P2)** — three of four case studies are self-declared mock work and say so only on the
  listing page, not on their own (indexed) pages.
- **FUN-02 (P2)** — the contact form can show "Message sent" without sending anything.
- **SEO-02 (P1)** — the prerender step still fails open: a machine without Chrome ships meta-only
  shells with a green build.
- **INP** — not measured anywhere. No field data was available, and TBT is not INP.

**Added:** a 22-contract, zero-dependency regression suite (`tests/site-contracts.test.mjs`,
`npm test`) guarding routes, metadata, the sitemap, `robots.txt`, `_headers`, `_redirects`, the
404 shell, JSON-LD, the typography rule, and ARIA/label reference integrity. It had **18 checks →
16 pass / 2 fail** against the pre-fix tree and is **22 pass / 0 fail** after; the 11 checks added
or widened after that baseline were each red-green probed rather than claimed.

**Also found, reported not changed:** the `→` arrow is missing from all three shipped font subsets
and the display-face utilities declare no fallback list, so it renders in the browser's default
face in 10 visible strings — including the case-study metric badges (TA-02).

**Browser round.** The build now runs end to end including prerender (SEO-01 closed —
`dist/index.html` went from 4,017 to **155,339 bytes** of real content). **axe-core: 0 violations on
all 8 routes.** Lighthouse mobile over four runs: accessibility / SEO / best-practices **100**
everywhere and **CLS 0** everywhere, LCP ≈3.71 s home and ≈3.46 s services (both fail the 2.5 s
threshold).
