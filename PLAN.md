# Visual System And Layout Plan

## Goal

Create one consistent Codevio visual system across the home page and all route pages. Keep the existing dark, red, glass, and motion-led identity, but remove conflicting starter-theme variables and ad hoc text colors.

## 1. Establish The Color System

- Make the site permanently dark instead of relying on `prefers-color-scheme`; the animated backgrounds and components already assume a dark canvas.
- Replace the starter light/dark variables in `src/index.css` and `src/App.css` with a single semantic palette:
  - `--color-bg`: near-black navy, approximately `#0a0a0f`.
  - `--color-surface`: translucent dark panel for cards and navigation.
  - `--color-surface-strong`: opaque dark surface for overlays and footer content.
  - `--color-text`: warm white for primary content, approximately `#f7f3f4`.
  - `--color-text-muted`: white at roughly 65% opacity for supporting copy.
  - `--color-text-subtle`: white at roughly 40% opacity for metadata and labels.
  - `--color-border`: white at roughly 10% opacity.
  - `--color-accent`: Codevio red, approximately `#db364e`.
  - `--color-accent-soft`: pink highlight, approximately `#f5b8c4`.
  - `--color-deep`: dark burgundy/navy for contrast, approximately `#1a1a2e`.
- Map Tailwind utilities and reusable CSS to these semantic tokens instead of repeating raw `text-white/*`, red, and pink values throughout JSX.
- Define text roles: display headings use primary text, body copy uses muted text, eyebrow labels and active states use the soft accent, calls to action use accent red, and metadata uses subtle text.
- Verify contrast for body text, navigation, cards, footer links, and buttons against both the animated background and glass surfaces.

## 2. Normalize Typography

- Keep `Dela Gothic One` for major display headings and strong statements.
- Use `Bebas Neue` for compact labels, navigation, metadata, and supporting copy where the current design already uses it.
- Use Geist only where a neutral readable paragraph or form treatment is needed; avoid introducing a fourth visual voice.
- Remove conflicting global starter typography from `index.css` so global `h1`, `h2`, `p`, background, and text rules do not fight page-level Tailwind classes.
- Define consistent heading sizes, line heights, tracking, and readable paragraph widths at desktop and mobile breakpoints.

## 3. Create A Shared Page Frame

- Make `PageShell` the canonical layout for `/mission`, `/services`, `/work`, `/about`, and `/contact`.
- Give every page the same structure: fixed menu layer, animated background layer, constrained content column, page transition, and footer.
- Add shared container and spacing rules so sections align to one horizontal grid instead of each page choosing unrelated max widths and top margins.
- Establish responsive gutters: compact mobile padding, medium tablet padding, and a capped desktop content width.
- Keep decorative backgrounds behind content with predictable z-indexes and prevent them from affecting document flow.
- Ensure the footer begins cleanly after page content and does not depend on route-specific spacing hacks.

## 4. Home Page Layout

- Preserve the home page as the immersive entry point with the Lanyard scene and splash screen.
- Treat the hero as a full viewport section with a clear content hierarchy: navigation, interactive 3D object, positioning statement, and technology loop.
- Place the technology logo loop after the hero as a transition into the studio offer.
- Follow it with a concise positioning section, offer teaser, and a clear contact call to action before the footer.
- Keep the 3D canvas isolated from normal content flow and preserve lower-cost mobile settings; avoid adding heavy effects to non-hero sections.
- Make the first meaningful text and primary action usable if the splash animation is delayed or disabled.

## 5. Interior Page Layouts

- Use a shared page header pattern: eyebrow, display title, supporting paragraph, and optional transition label.
- `/mission`: lead statement, commitments, proof/stat row, values, and a final contact action.
- `/services`: service disciplines, offer cards, package rules, fit guidance, and quote CTA. Keep offer data sourced from `src/data/site.js`.
- `/work`: case-study grid or stack, clearly distinguish illustrative examples, and provide a route to contact.
- `/about`: studio positioning, values/process, and team or capability content without duplicating the services page.
- `/contact`: direct contact details, concise qualification prompt, and a focused contact action/form treatment.
- Use the same section rhythm on every interior page: generous top offset, section heading, content block, then consistent vertical spacing.
- Prefer grids that collapse to one column on mobile and two or more columns only when content remains readable.

## 6. Components And Data Boundaries

- Put site-wide colors, typography, containers, buttons, cards, and focus states in shared CSS/Tailwind conventions.
- Keep route content and navigation labels in `src/data/site.js`; do not duplicate offer names, social links, or contact details in page components.
- Reuse `PageShell`, `Footer`, menu, CTA, card, and section-heading patterns before creating page-specific variants.
- Keep component-specific animation styles beside their components, but use the shared semantic color tokens.
- Preserve the existing `@` alias for `src` and `.glb` asset handling in Vite.

## 7. Responsive And Accessibility Pass

- Check layouts at narrow mobile, tablet, and desktop widths; no section should require horizontal scrolling.
- Make touch targets sufficiently large and keep menu, links, and buttons visibly focusable.
- Respect `prefers-reduced-motion` for splash, page transitions, hover effects, logo loops, and 3D/decorative animation where practical.
- Provide readable fallback content if WebGL or animated assets fail to load.
- Check text contrast after the animated background is enabled, not only against a flat color.

## 8. Implementation Order

1. Replace conflicting global color and typography variables with semantic dark-theme tokens.
2. Normalize shared container, section spacing, heading, paragraph, button, card, and focus styles.
3. Refactor `PageShell` and `Footer` to use the shared layout and color system.
4. Bring each interior route into the shared page structure, starting with Services because it has the most layout patterns.
5. Tune the Home hero and below-hero sections without disturbing the existing 3D interaction.
6. Remove duplicated raw colors and obsolete starter CSS after all routes use the new tokens.
7. Verify with `npm run lint`, then `npm run build`, followed by manual desktop and mobile checks in `npm run dev`.

## Acceptance Criteria

- All routes use the same intentional dark palette and text hierarchy.
- No starter light-theme variables or conflicting global heading/text colors remain.
- Sections align to a shared grid and use consistent spacing across desktop and mobile.
- Primary actions and navigation have clear hover, focus, and active states.
- Home 3D interactions remain functional and interior pages remain readable when animation is reduced or unavailable.
- `npm run build` passes; existing lint issues must be resolved or explicitly documented before treating lint as clean.
