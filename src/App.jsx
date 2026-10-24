import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';

import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/StackCard/PageTransition';
import SplashScreen from './components/SplashScreen';
import { shouldShowSplash } from './lib/splash';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Services = lazy(() => import('./pages/Services'));
const NotFound = lazy(() => import('./pages/NotFound'));

const SCROLL_INDICATOR_PADDING = 16;
const SCROLL_INDICATOR_MIN_HEIGHT = 56;

function ScrollIndicator() {
  const indicatorRef = useRef(null);

  useEffect(() => {
    let frame = null;

    const update = () => {
      frame = null;
      const indicator = indicatorRef.current;
      if (!indicator) return;

      const doc = document.documentElement;
      const viewportHeight = window.innerHeight;
      const pageHeight = doc.scrollHeight;
      const scrollRange = pageHeight - viewportHeight;

      if (scrollRange <= 1) {
        indicator.style.opacity = '0';
        return;
      }

      const availableHeight = viewportHeight - SCROLL_INDICATOR_PADDING * 2;
      const proportionalHeight = viewportHeight * (viewportHeight / pageHeight);
      const thumbHeight = Math.min(
        availableHeight,
        Math.max(SCROLL_INDICATOR_MIN_HEIGHT, proportionalHeight)
      );
      const travel = Math.max(0, availableHeight - thumbHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
      const offset = SCROLL_INDICATOR_PADDING + progress * travel;

      indicator.style.height = `${thumbHeight}px`;
      indicator.style.transform = `translate3d(0, ${offset}px, 0)`;
      indicator.style.opacity = '1';
    };

    const requestUpdate = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    const resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(requestUpdate) : null;
    const root = document.getElementById('root');

    resizeObserver?.observe(document.body);
    if (root) resizeObserver?.observe(root);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div
      ref={indicatorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 z-30 hidden w-[3px] rounded-full opacity-0 transition-opacity duration-200 will-change-transform md:block"
      style={{ backgroundColor: 'var(--scrollbar-thumb)' }}
    />
  );
}

function RouteFallback() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
    </div>
  );
}

function StaticFallback() {
  return (
    <div
      id="main"
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <p style={{ margin: 0, fontSize: '1.125rem' }}>
        Something went wrong while loading this page.
      </p>
      <p style={{ margin: 0 }}>
        <a href="/" style={{ color: '#fcdfe4' }}>Back to the home page</a>
        {' · '}
        <a href="mailto:info.codevio@gmail.com" style={{ color: '#fcdfe4' }}>
          info.codevio@gmail.com
        </a>
      </p>
    </div>
  );
}

export default function App() {
  // Decided once per app mount: shown on every full document load — first
  // visit or refresh, on any route — and never on client-side navigation
  // (route changes do not remount App). Skipped only under reduced motion.
  // The pre-React counterpart is public/splash-boot.js.
  const [splashActive, setSplashActive] = useState(shouldShowSplash);
  const handleSplashDone = useCallback(() => setSplashActive(false), []);

  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      {splashActive && <SplashScreen onComplete={handleSplashDone} />}

      {/* While the splash covers the page the shell is inert, so keyboard and
          assistive tech cannot land on content that is not visibly there. */}
      <div inert={splashActive}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ScrollToTop />
        <ScrollIndicator />

        <MotionConfig reducedMotion="user">
          <PageTransition>
            <ErrorBoundary fallback={<StaticFallback />}>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        </MotionConfig>
      </div>
    </BrowserRouter>
  );
}
