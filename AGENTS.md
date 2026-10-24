# Agent Notes

## Commands

- Install the locked dependencies with `npm ci`.
- Run the development server with `npm run dev`.
- Run the available verification in this order: `npm run lint`, then `npm run build`, then `npm test`.
- `npm test` runs the route/metadata/deployment contracts in `tests/site-contracts.test.mjs` with the built-in Node test runner — no test dependency. It needs a fresh `dist/`, so run it after `npm run build`, and it uses `--test-isolation=none` so it also works where spawning a child process with piped stdio is not permitted.
- There is no typecheck, formatter, CI, or code-generation script in this repository.

## Structure

- This is a single Vite React app. `src/main.jsx` is the entrypoint and `src/App.jsx` owns the `react-router-dom` route table for `/`, `/services`, `/about`, and `/contact`.
- Route-level pages live in `src/pages`; shared UI and animation/3D pieces live in `src/components`; reusable site content and navigation data live in `src/data/site.js`.
- Non-home pages generally use `PageShell`, which supplies the animated background, menu, page transition, title, and footer. The home page has its own `Lanyard`/Three.js composition and splash flow.
- Vite defines `@` as an alias for `src`; `.glb` files are treated as assets. Keep 3D assets under `src/assets` and preserve the existing `?url` pattern where a URL is required.

## Conventions

- ESLint covers `js`, `jsx` and `mjs` files and ignores `dist` and `promo-video`; use `npm run lint` rather than assuming TypeScript or Prettier checks exist. The `.mjs` files under `scripts/` and `tests/` are Node programs and get Node globals, not browser globals.
- Tailwind CSS is integrated through `@tailwindcss/vite`; shared/global styling is in `src/index.css`, with component-specific CSS/SCSS beside components.
- Keep route/content changes aligned with the constants in `src/data/site.js`.
- Two brand faces on purpose: `--heading` is Dela Gothic One (primary — h1/h2 and the wordmark) and `--sans` is Bebas Neue (secondary — the inherited face for body copy, list items and form fields). Bebas Neue is unicase (its lowercase letters are the capital outlines), so the document deliberately renders in capitals; do not swap in a text face. Labels still name the face explicitly with the `font-['Bebas_Neue']` utility, and tests in `tests/site-contracts.test.mjs` pin both variables.
- Anything that changes a file in `public/` (`_headers`, `_redirects`, `robots.txt`, `sitemap.xml`) or a route in `src/App.jsx`/`src/data/seo.js` has a matching contract in `tests/site-contracts.test.mjs`; run `npm test` and keep it green.
- The home page’s React Three Fiber, Rapier, GSAP, and Three.js code is browser-only and performance-sensitive; verify interactive changes in the dev server on desktop and mobile-sized viewports.
