// Splash gate, evaluated once per full document load.
//
// The splash shows on every hard load — first visit or refresh, on any route —
// and never on client-side navigation: App mounts it once per document, and a
// route change does not remount App. The reduced-motion condition must mirror
// public/splash-boot.js, which paints the pre-React black cover under the same
// condition.
export const shouldShowSplash = () => {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
};
