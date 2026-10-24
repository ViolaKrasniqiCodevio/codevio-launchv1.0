import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// ~8s at 60fps: comfortably longer than the largest lazy chunk takes to arrive.
const MAX_FOCUS_FRAMES = 480;

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // A route change remounts the whole subtree (see PageTransition's keyed
    // motion.div), so the link the user activated no longer exists and focus
    // falls back to <body>: the next Tab restarts at the skip link and a screen
    // reader announces nothing. #main is tabIndex={-1} on every route, so moving
    // focus there gives keyboard and AT users the new page.
    let frame = null;
    let frameCount = 0;

    const focusMain = () => {
      const main = document.getElementById('main');

      if (main) {
        main.focus({ preventScroll: true });
        return;
      }

      // A lazy route commits the loading fallback first, and that fallback has no
      // #main while this effect does not re-run when the real page arrives. Poll
      // briefly so a cold navigation still lands focus on the content; the cap
      // stops the loop if a chunk never loads.
      if (frameCount < MAX_FOCUS_FRAMES) {
        frameCount += 1;
        frame = window.requestAnimationFrame(focusMain);
      }
    };

    focusMain();

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [pathname, navigationType]);

  return null;
}
