# Deliverable A — Harness and Skill Inventory

Codevio QA audit · session `session-0c0a50b9-2899-4d4e-abf4-5576e730396b` · 2026-10-17

This document records only what was actually available and actually used. Anything
listed as *not available* was tested, not assumed.

---

## A.1 Runtime observed

| Fact | Value | How it was observed |
|---|---|---|
| Project root (actual) | `C:\Users\Admin\Downloads\Codevio-Website-staging\Codevio-Website-staging` | The path named in the brief is the parent; the app is one level down. `package.json`, `src/`, `index.html` all live in the nested directory. |
| Workspace root (sandbox) | `C:\Users\Admin\Downloads\Codevio-Website-staging` | Session context |
| Node | v24.16.0 | `node -v` |
| npm | 12.0.2 | `npm -v` |
| OS / shell | Windows, PowerShell 7 (`pwsh`) | Command behaviour |
| DSH home / profile | `C:\Users\Admin\.dsh`, profile `web` | `$env:DSH_HOME`, `$env:DSH_PROFILE` |
| DSH GUI | `http://127.0.0.1:3080` | `$env:DSH_WEB_URL` |
| File policy at start | `workspace-write` | Proven: writes to `C:\Users\Admin\…` and `C:\Windows\Temp\…` were denied |
| Approval policy at start | `ask` | Session context |
| Model (supervisor + builder) | `opencode-go/deepseek-v4.1-flash` | Reported by the harness in the session transcript ("the session continues with opencode-go/deepseek-v4.1-flash"). No separate builder model exists in this session, so **there is no model-level role separation** — Supervisor and Builder are sequential phases of one agent. This is a documented limitation, not a choice. |

### Runtime capabilities that were probed

| Capability | Result | Evidence |
|---|---|---|
| `npm run lint` | **Works** | exit 0 |
| `vite build` | **Works**, but only with a harness shim (see A.3) | exit 0, 2829 modules transformed |
| `node scripts/generate-pages.mjs` | **Works** | exit 0, wrote 10 shells |
| `node scripts/prerender.mjs` | **Blocked** | `prerender: WARNING browser setup failed (spawn EPERM)` → exit 1 |
| `npm run build` (full chain) | **Blocked** | fails at `vite build` config load (`exec("net use")` → `spawn EPERM`), and would also fail at prerender |
| Headless Chrome | **Blocked** | `Start-Process chrome … --remote-debugging-port` → process exits immediately (`exited=True`, exit code `-36863`), no `DevToolsActivePort` file, no CDP endpoint. `spawnSync(chrome, …)` → `EPERM`. Control: `spawnSync('cmd', ['/c','echo hi'])` succeeds with the same default piped stdio, so the denial is specific to launching the browser, not to spawning in general. |
| `agent-browser` CLI | **Blocked** | `✗ Socket directory 'C:\Users\Admin\.agent-browser' is not writable: Access is denied. (os error 5)`. `USERPROFILE`/`HOME` overrides are ignored. `agent-browser --version` → `0.39.0`. |
| Playwright browsers | Present but unusable | `%LOCALAPPDATA%\ms-playwright` holds `chromium-1243`, `chromium_headless_shell-1243`, `firefox-1543`, `webkit-2359`. The Python driver (`playwright.exe`) needs a piped child process, which is denied; no Node Playwright package is installed. |
| `curl.exe` to the **local** preview server | **Works** | `status=200 size=4017` |
| `curl.exe` over **HTTPS** | **Blocked** | `schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030e)`. Plain HTTP works (the live site answers `301` to HTTPS). |
| `web_fetch` tool (harness network stack) | **Works** | Used for the live-site comparison |
| DNS resolution | **Works** | `Resolve-DnsName codevio-dev.netlify.app` |
| Font inspection via Python `fontTools` | **Works** | Used to prove the Bebas Neue unicase finding |
| `git` (read-only) | **Works** | `git status`, `git log` |

---

## A.2 Skills: what the catalogue exposes vs. what is installed

The DSH `skill` tool catalogue for this session contains **21** skills, resolved from
`C:\Users\Admin\.agents\skills`:

`agent-browser`, `brag`, `devops-engineer`, `docker-expert`, `docx`, `error-detective`,
`kubernetes-specialist`, `motion-design`, `neon`, `neon-postgres`, `pptx`, `python-pro`,
`react-specialist`, `refactoring-specialist`, `sql-pro`, `test-automator`,
`typescript-pro`, `vercel-composition-patterns`, `vercel-react-best-practices`,
`web-design-guidelines`, `xlsx`.

The brief names roughly fifty skills. Every one of them **is installed on this
machine**, but in three directories the DSH `skill` tool does **not** register:

| Root | Count | Examples relevant here |
|---|---|---|
| `C:\Users\Admin\.config\opencode\skills` | 46 | `accessibility`, `building-accessible-interfaces`, `responsive-design`, `web-typography`, `systematic-debugging`, `verifying-before-completion`, `testing-webapps`, `testing-skills`, `investigating-performance`, `reviewing-security`, `website-audit`, `webdesign-review`, `reviewing-interface-quality`, `writing-plans`, `executing-plans`, `test-driven-development`, `subagent-driven-development`, `dispatching-parallel-agents`, `usability`, `ux-design`, `ui-patterns`, `images-media`, `navigation-design` |
| `C:\Users\Admin\.config\opencode\power-pack-skills` | — | `code-review`, `code-reviewer`, `code-quality`, `ai-slop`, `security-review`, `security-threat-model`, `insecure-defaults`, `agentic-actions-auditor`, `differential-review`, `fp-check`, `supply-chain-risk-auditor`, `semgrep`, `codeql`, `variant-analysis`, `sharp-edges` |
| `C:\Users\Admin\ponytail\skills` | 6 | `ponytail`, `ponytail-help`, `ponytail-audit`, `ponytail-review`, `ponytail-debt`, `ponytail-gain` |

**Consequence and method.** `skill <name>` cannot load these; it fails closed. Because
each skill is a plain `SKILL.md`, they were loaded **by reading the file directly**, which
delivers the same instructions. Every "used" entry below means: *the `SKILL.md` was read
in this session and its instructions were applied to this project.* No skill is claimed as
used on the strength of its name.

Skills that are genuinely **not installed anywhere on this machine**: none of the named
ones. `semgrep` and `codeql` skills exist, but their **tools** are not installed (see A.5).

---

## A.3 Harness shim used for the build (declared, not hidden)

The Sandbox blocks `child_process` spawns with piped stdio (`EPERM`). Two things in this
project's build need that:

1. Vite's `optimizeSafeRealPathSync()` (Windows-only) runs `exec("net use", cb)` during
   config load. Vite already handles an `exec` *error* correctly (`if (error) return;` →
   falls back to plain `fs.realpathSync`). Under the sandbox the spawn throws
   synchronously and Vite has no try/catch, so the build dies before it starts.
2. `scripts/prerender.mjs` launches Chrome with `stdio: ['ignore','ignore','pipe']` to read
   the DevTools URL off stderr.

To separate *environment* failures from *project* failures, a shim was written to
`%TEMP%\dsh-netuse-shim.cjs` (outside the repository) and used via
`NODE_OPTIONS=--require …`. It (a) converts the synchronous sandbox throw into the
asynchronous callback error Vite already expects, and (b) downgrades `'pipe'` to
`'ignore'` for child stdio and attaches inert stream stubs. No project file was modified.

With the shim: **`vite build` exits 0** and **`generate-pages.mjs` exits 0**. The
earlier `[UNLOADABLE_DEPENDENCY] … tailwindcss-oxide.win32-x64-msvc.node` error was a
cascade of the same EPERM and does not reproduce once the shim is in place — the native
binary is present and loads normally.

The prerender step still cannot run: it needs a real browser, and Chrome cannot start
here. That is an **environment limitation**, and it is carried into every SEO finding as
an explicit caveat.

---

## A.4 Ponytail skills — read and applied

| Skill | Instructions loaded | Work actually performed | Useful output / limitation |
|---|---|---|---|
| `ponytail-help` | Yes (`C:\Users\Admin\ponytail\skills\ponytail-help\SKILL.md`, 70 lines) | Used to establish that Ponytail is level-based (`lite`/`full`/`ultra`), that `full` is the default, and the correct skill sequence: `ponytail` → `ponytail-audit` → `ponytail-debt` → `ponytail-gain`, with `ponytail-review` for each change set. | Confirmed the ordering used below. No level flag was set, so **level = full** applies. |
| `ponytail` | Yes (`ponytail/SKILL.md`, 52 lines) | Governed every fix: smallest complete change, reuse before adding, delete beats add, never cut validation/error handling/security/accessibility, `shortcut:` comment for any deferral. | Led directly to the zero-dependency `node:test` regression harness instead of adding Vitest/Playwright. |
| `ponytail-audit` | Yes (`ponytail-audit/SKILL.md`, 103 lines) | Whole-repo ranked audit in the required 4-part finding format, ordered correct → safe → holds under load → tested → fast → lean. | See the consolidated issue register (Deliverable C). |
| `ponytail-review` | Yes (`ponytail-review/SKILL.md`, 101 lines) | Applied to the working-tree change set at the end (Deliverable G), plus a second pass by an independent reviewer agent. | Findings and verdict recorded in Deliverable G. |
| `ponytail-debt` | Yes (`ponytail-debt/SKILL.md`, 45 lines) | Ran the documented scan for `shortcut:` / `ponytail:` markers with `git grep --no-index --exclude-standard`. | Ledger in Deliverable G. |
| `ponytail-gain` | Yes (`ponytail-gain/SKILL.md`, 53 lines) | Read; used only for its **honesty boundary**. | Its scoreboard is a published benchmark, not this repo, and the skill explicitly forbids printing a per-repo savings number. **No per-repo gain figure is reported anywhere in these deliverables** — the only counted per-repo figures come from `ponytail-debt`. |

---

## A.5 QA, testing, frontend, performance and security skills

Legend — **Applied** = instructions read and used against this project;
**Read, not applicable** = instructions read and ruled out with a reason.

| Skill | Instructions loaded | Applied / not applicable | What it actually produced |
|---|---|---|---|
| `systematic-debugging` | Yes | Applied | Root-cause discipline for the build failure (isolated the EPERM to `exec("net use")` by reading Vite's source at `vite/dist/node/chunks/node.js:1941-1960`), and for the Chrome failure (isolated it with a control spawn of `cmd`). |
| `verifying-before-completion` | Yes | Applied | Every claim in these deliverables is tied to a command run in this session with its exit code. No "should pass". |
| `testing-webapps` | Yes | Applied | Drove the decision to build a repeatable, zero-dependency regression suite because the repo has no test infrastructure at all. |
| `testing-skills` | Yes | Applied | Used for the coverage-matrix shape in Deliverable B (state what is verified, what is blocked, what was not run). |
| `investigating-performance` | Yes | Applied | Measurement-before-optimisation; only measured `dist/` byte sizes and the eagerly-loaded graph are reported as facts. No invented Lighthouse numbers. |
| `reviewing-security` | Yes | Applied | Drove the header/CSP, secret-scan and dependency review. |
| `website-audit` | Yes | Applied | The 5-dimension analysis frame; the SEO findings follow its technical/SEO dimensions. Its relaunch/migration material is out of scope (this is not a relaunch). |
| `accessibility` | Yes | Applied | WCAG 2.1/2.2 AA checklist used as the a11y finding rubric (contrast 4.5:1 / 3:1, one `h1`, landmarks, 44×44 targets, focus visible, labels). |
| `building-accessible-interfaces` | Yes | Applied | Used for the menu-panel/focus-management and form-error-association findings. |
| `responsive-design` | Yes | Applied | Drove the 7-viewport static layout analysis. |
| `web-typography` | Yes | **Applied — and it is the basis of a confirmed defect.** Its rule "DON'T: Set longer texts in all caps. Only for short labels/buttons (max. 3-4 words)" is exactly what the site does today. | See issue TA-01. |
| `web-design-guidelines` | Yes (28-line stub; delivered via the DSH `skill` tool) | Applied | Interface-state and interaction review. |
| `ai-slop` | Yes | Applied | Used to check for fake functionality and dead UI, not to restyle anything. |
| `usability`, `ux-design`, `ui-patterns` | Yes | Applied where a defect concerned real interaction | Feedback, navigation clarity, control states. |
| `webdesign-review`, `reviewing-interface-quality` | Yes | Applied | Final interface pass. |
| `writing-plans`, `executing-plans` | Yes | Applied | Plan written to `docs/qa/`, then executed in small testable groups with `npm run lint` + build after each. |
| `test-driven-development` | Yes | Applied where the harness allows | The node:test regression suite was written red→green (see Deliverable D). |
| `dispatching-parallel-agents`, `subagent-driven-development` | Yes | Applied | Both mandate real, bounded delegation with evidence. Four independent read-only agents were dispatched (A: function/routing/state, B: a11y/responsive, C: SEO/performance, D: security/deps); a fifth independent reviewer re-checked the diff. |
| `code-review`, `code-reviewer`, `code-quality` | Yes | Applied | Final review of the working-tree change set. |
| `error-detective` | Yes | Applied | Used on the build/Chrome failure evidence above. |
| `react-specialist` | Yes | Applied | React 19 specifics: `inert`, StrictMode double-invoke, lazy/Suspense boundaries. |
| `refactoring-specialist` | Yes | Read, **not applicable** | The brief forbids unrelated refactoring; no structural refactor was performed. |
| `vercel-react-best-practices` | Yes | Applied selectively | Dominated by Next.js/App-Router guidance that does not apply. Used only for the route-level code-splitting and lazy-loading checks. **This project is not on Vercel** — it deploys to Netlify. |
| `vercel-composition-patterns` | Yes | Read, **not applicable** | Concerns compound-component APIs and prop proliferation; no component-API refactor is in scope. |
| `motion-design` | Yes (via the DSH `skill` tool; also vendored at `.agents/skills/motion-design`, `skills-lock.json`) | Applied | Used to check `prefers-reduced-motion` coverage and the existing motion identity in `src/lib/motion.js`. |
| `security-review`, `security-threat-model`, `insecure-defaults`, `supply-chain-risk-auditor`, `fp-check`, `differential-review` | Yes | Applied | Header/CSP correctness, secret scan, dependency reachability analysis, false-positive check on scanner output, and a review of the change set for newly introduced risk. |
| `agentic-actions-auditor` | Yes | Read, **not applicable** | It audits agentic/LLM action surfaces (tool calls, prompt-injection paths). This repository contains no agent, LLM call, or automated action surface. |
| `semgrep`, `codeql`, `variant-analysis`, `sharp-edges` | Yes (instructions) | **Blocked — tools not installed.** `semgrep` and `codeql` are not on `PATH`. | No scanner was run. Findings come from source reading plus `npm audit`. `variant-analysis`/`sharp-edges` were not triggered: no confirmed vulnerability pattern was found to search variants of. |
| `images-media`, `navigation-design`, `designing-frontend-interfaces` | Yes | Applied | Image delivery/`srcset`, back-navigation scroll behaviour, pricing-grid grouping. |

---

## A.6 Delegation actually performed

| Agent | Kind | Scope | Status |
|---|---|---|---|
| Agent A | `subagent` (real, separate context) | Functional correctness, routing, components, forms, data handling | Complete — 10 findings, 4 P3/Info fixed |
| Agent B | `subagent` | WCAG 2.2 AA + responsive, source-level | Complete — 17 findings, 10 fixed |
| Agent C | `subagent` | Technical SEO + measured performance | Complete — 20 findings, 2 fixed (1 of them a test gap), the rest reported |
| Agent D | `subagent` | Security + dependency review | Complete — 14 findings; its headline result (the stale deploy) became P0 DEP-01 |
| Reviewer | `subagent` | Independent adversarial review of *this remediation* | Complete — 3 defects in the change set found and fixed, 5 test/doc weaknesses fixed, 1 item left `MITIGATED` with a reason |

All four audit agents were instructed to be strictly read-only, so there was **no concurrent
editing** and therefore no merge-conflict risk. The Supervisor (this agent) verified their
load-bearing claims against the source before accepting any of them; findings that could not be
reproduced are demoted to *unconfirmed risk* in Deliverable C rather than reported as defects.
Two claims were rejected outright and the rejections are recorded in Deliverable C §C.9.

The reviewer ran **after** the fixes, in a fresh context, with the file list and the claim behind
each change, and an explicit instruction to find counterexamples and to mark each item
`CONFIRMED CORRECT` / `WRONG` / `UNVERIFIED`. That independence paid for itself: it found that the
first version of the route-change focus fix **did not work** on any uncached route, that the
typography fix had changed `/about`'s stat block, and that the new `_headers` test could not see a
rule appended after the block it guarded. All are in Deliverable C §C.10. Its output is reproduced
in Deliverable G §G.6.1, along with two places where I did **not** adopt its conclusion because the
evidence did not support it.

Honest limitation: the subagents and the reviewer share this session's sandbox, so **none of them
had a browser either**. Their findings and their review are source-level, and are labelled as such
throughout.

---

## A.7 Capabilities that were unavailable, and the effect on this audit

| Unavailable | Effect | Mitigation actually used |
|---|---|---|
| Any browser (Chrome, Edge, Playwright, agent-browser) | **No screenshots, no keyboard walkthrough, no axe-core run, no Lighthouse, no CWV lab numbers, no multi-engine testing** | Static + build-artifact analysis; the browser-dependent items are marked `BLOCKED` in the coverage matrix and are **not** claimed as passed. |
| Prerendered `dist/*.html` (needs the browser) | SEO judgement is made on the meta-only shells plus a read of `scripts/prerender.mjs` | Stated explicitly in every affected finding |
| HTTPS from `curl.exe` (Schannel credentials) | Live-site comparison goes through the harness `web_fetch` (GET only, no header inspection over HTTPS) | Header comparison used the local `public/_headers` and the plain-HTTP `301` response, and the limitation is recorded |
| `semgrep`, `codeql` | No SAST scanner output | Manual source review + `npm audit` |
| Field data (CrUX / Search Console) | No real-user CWV, no index coverage | Not claimed anywhere |

---

## A.8 Model-role separation

The brief asks for a Supervisor model and a Builder model, both DeepSeek V4.1 Flash. This
session exposes a single configured model (`opencode-go/deepseek-v4.1-flash`) and no
mechanism to pin a different model to a delegated role. Role separation was therefore
implemented **by phase and by context**, which is what the harness supports:

1. **Supervisor phase** — scope, acceptance criteria, repo inspection, plan, dispatch,
   severity calibration, acceptance of findings.
2. **Builder phase** — reproduce, fix, add regression checks, run lint/build.
3. **Independent review phase** — a separate agent context reviews the change set
   (author ≠ reviewer), and the Supervisor re-verifies the load-bearing claims.

This is recorded so the verdict is not read as having had model-level independence that
did not exist.
