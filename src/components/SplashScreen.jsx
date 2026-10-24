import { useEffect, useState } from 'react';

import logo from '../assets/logo.png';

import './SplashScreen.css';

// One fade-in (CSS, 500 ms), a brief hold, then the fade-out: ~1.4 s total.
// HOLD_MS must match the .splash__logo animation duration in SplashScreen.css,
// FADE_OUT_MS must match the .splash opacity transition duration.
const HOLD_MS = 1000;
const FADE_OUT_MS = 380;

export default function SplashScreen({ onComplete }) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // React's overlay is on screen from the first commit, so the pre-React
    // black cover (html.splash-hold, index.html) is no longer needed.
    document.documentElement.classList.remove('splash-hold');

    // Plain timeouts drive the whole sequence: there is no animation callback
    // to depend on, so the overlay cannot get stuck. Unmounting clears both.
    const hold = setTimeout(() => setLeaving(true), HOLD_MS);
    const finish = setTimeout(() => {
      setGone(true);
      onComplete?.();
    }, HOLD_MS + FADE_OUT_MS);

    return () => {
      clearTimeout(hold);
      clearTimeout(finish);
    };
  }, [onComplete]);

  if (gone) return null;

  return (
    <div className="splash" data-leaving={leaving || undefined} aria-hidden="true">
      <img className="splash__logo" src={logo} alt="" width="330" height="83" />
    </div>
  );
}
