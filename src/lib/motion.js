/**
 * Codevio brand motion identity.
 *
 * Single source of truth for animation timing, easing, and reveal patterns,
 * following the motion-design skill (LottieFiles):
 *
 * - ONE signature easing used for ~80% of animations (entrance = decelerate).
 * - THREE durations: quick (micro-feedback), standard (cards/sections),
 *   slow (hero / first-paint / page transitions).
 * - Entrance pattern: rise 20px + fade, hero first, total stagger < 500ms.
 * - Reduced motion is handled globally via `MotionConfig reducedMotion="user"`
 *   in App.jsx plus the `prefers-reduced-motion` guard in index.css — so these
 *   presets never need their own reduced-motion branches.
 */

export const EASE_SIGNATURE = [0.22, 1, 0.36, 1];
export const EASE_EXIT = [0.3, 0, 1, 1];

export const DURATION = {
  quick: 0.2,
  standard: 0.35,
  slow: 0.5,
};

/** Vertical travel for the standard entrance. Small = snappy, never 1/3 screen. */
export const REVEAL_Y = 20;

/**
 * Scroll-triggered reveal (secondary content, cards, sections).
 * Total per-element time caps at 0.5s when delay <= 0.15 (stagger budget).
 */
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: REVEAL_Y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: DURATION.standard, delay, ease: EASE_SIGNATURE },
});

/**
 * First-paint entrance (above-the-fold heroes, 404, case-study header).
 * Uses `animate` instead of `whileInView` so it plays on mount.
 */
export const enter = (delay = 0) => ({
  initial: { opacity: 0, y: REVEAL_Y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.slow, delay, ease: EASE_SIGNATURE },
});

/**
 * Capped stagger delay for lists/grids. Keeps the whole sequence inside the
 * 500ms stagger budget no matter how many items the list holds.
 */
export const stagger = (index, step = 0.05, cap = 0.15) =>
  Math.min(index * step, cap);

/**
 * Route-level content transition. Deliberately light (no full-screen overlay):
 * a short rise + fade keyed on pathname so navigation feels continuous.
 */
export const routeEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.standard, ease: EASE_SIGNATURE },
};
