// Pre-React paint guard for the splash screen (src/components/SplashScreen.jsx).
//
// Loaded synchronously in <head>, before the first paint: the splash shows on
// every full document load — first visit or refresh, on any route — so <html>
// paints black straight away and the page underneath never flashes before the
// React overlay takes over (the html.splash-hold rule lives in index.html's
// inline <style>). The React component removes the class as soon as it mounts;
// the timer below is a failsafe so a bundle that never loads cannot leave the
// page black.
//
// The reduced-motion condition must mirror shouldShowSplash() in
// src/lib/splash.js: no cover when the splash itself is skipped.
(function () {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('splash-hold');
    window.setTimeout(function () {
      document.documentElement.classList.remove('splash-hold');
    }, 5000);
  } catch {
    /* fail open: worst case is the same brief background flash as before */
  }
})();
