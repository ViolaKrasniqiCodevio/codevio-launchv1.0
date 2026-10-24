import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import StaggeredMenu from './StaggeredMenu';
import Grainient from './Grainient';
import ErrorBoundary from './ErrorBoundary';
import { NAV_ITEMS, PAGE_THEME, SOCIAL_ITEMS } from '../data/site';

import logo from '../assets/logo.png';
import logoAlt from '../assets/logo_alt.png';
import cardGLB from '../assets/card.glb?url';

import './Lanyard.css';

// The scene chunk (three.js, rapier, meshline) is the heaviest part of the
// page. Start fetching it as soon as this module evaluates, and warm the card
// model too, so the 3D side loads in parallel with the background and the
// rest of the page instead of waiting until the hero actually mounts.
const lanyardScenePromise = import('./LanyardScene');

if (typeof window !== 'undefined') {
  fetch(cardGLB)
    .then(response => response.arrayBuffer())
    .catch(() => {});
}

const LanyardScene = lazy(() => lanyardScenePromise);

gsap.registerPlugin(ScrollTrigger);

function SplitWord({ text, className = '' }) {
  return (
    <span
      className={`lanyard-deco__word ${className}`}
      style={{ display: 'block', overflow: 'hidden' }}
    >
      <span className="char" style={{ display: 'inline-block' }}>
        {text}
      </span>
    </span>
  );
}

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [sceneReady, setSceneReady] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [sceneOnScreen, setSceneOnScreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [showScene, setShowScene] = useState(false);
  const sceneVisible = sceneOnScreen && pageVisible;

  const wrapperRef = useRef(null);
  const leftDecoRef = useRef(null);
  const rightDecoRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setSceneOnScreen(entry.isIntersecting),
      { threshold: 0 }
    );

    if (wrapper) observer.observe(wrapper);

    const handleVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    // Mount the 3D scene only after the first paint. The chunk itself is
    // already downloading (see lanyardScenePromise above), but mounting runs
    // rapier's WASM init and the first compiles, which must not compete with
    // the initial paint (LCP) under CPU throttling.
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setShowScene(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== undefined) cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!sceneReady) return;

    const t = setTimeout(() => setSpinning(false), 4000);
    return () => clearTimeout(t);
  }, [sceneReady]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const leftChars = leftDecoRef.current?.querySelectorAll('.char') ?? [];
    const rightChars = rightDecoRef.current?.querySelectorAll('.char') ?? [];
    const allChars = [...leftChars, ...rightChars];

    if (!wrapper || !allChars.length) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(allChars, { opacity: 1, yPercent: 0 });
      return undefined;
    }

    gsap.set(allChars, {
      opacity: 0,
      yPercent: 40,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=250',
        scrub: 0.6,
      },
    });

    tl.to(allChars, {
      opacity: 1,
      yPercent: 0,
      ease: 'power2.out',
      stagger: 0.06,
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <>
      <div className="pixelblast-bg">
        <Grainient
          color1={PAGE_THEME.backgroundColor}
          color2={PAGE_THEME.gradientColors[1]}
          color3={PAGE_THEME.gradientColors[2]}
          timeSpeed={0.2}
          warpStrength={1.2}
          warpFrequency={4.5}
          warpSpeed={1.8}
          warpAmplitude={60}
          blendAngle={15}
          blendSoftness={0.08}
          rotationAmount={400}
          noiseScale={2.5}
          grainAmount={0.08}
          grainAnimated={true}
          contrast={1.4}
          saturation={1.1}
          zoom={0.9}
        />
      </div>

      <div ref={wrapperRef} className="lanyard-scroll-wrapper">
        <div className="lanyard-sticky">
          <div className="lanyard-nav lanyard-nav--fixed">
            <StaggeredMenu
              position="right"
              items={NAV_ITEMS}
              socialItems={SOCIAL_ITEMS}
              displaySocials={true}
              logoUrl={logo}
              logoOpenUrl={logoAlt}
              displayItemNumbering={true}
              colors={PAGE_THEME.menuColors}
              menuButtonColor={PAGE_THEME.menuButtonColor}
              openMenuButtonColor={PAGE_THEME.openMenuButtonColor}
              menuTextColor={PAGE_THEME.menuTextColor}
              menuHoverColor={PAGE_THEME.menuHoverColor}
              accentColor={PAGE_THEME.accentColor}
              closeOnClickAway={true}
              isFixed={false}
            />
          </div>

          <div className="lanyard-deco lanyard-deco--left" ref={leftDecoRef}>
            <SplitWord text="WEBSITES" className="lanyard-deco__word--outlined" />
            <SplitWord text="MARKETING" className="lanyard-deco__word--ghost" />
            <SplitWord text="BRANDING" className="lanyard-deco__word--solid" />
          </div>

          <div className="lanyard-wrapper">
            <div className="lanyard-deco lanyard-deco--right" ref={rightDecoRef} />

            {showScene && (
              <Suspense fallback={null}>
                <ErrorBoundary fallback={null}>
                  <LanyardScene
                    position={position}
                    gravity={gravity}
                    fov={fov}
                    transparent={transparent}
                    isMobile={isMobile}
                    spinning={spinning}
                    visible={sceneVisible}
                    onReady={() => setSceneReady(true)}
                  />
                </ErrorBoundary>
              </Suspense>
            )}
          </div>

          <div className="lanyard-textbox">
            ENGINEERING DIGITAL EXCELLENCE. TRANSFORMING VISIONS INTO POWERFUL,
            LASTING BRAND EXPERIENCES.
          </div>
          
        </div>
      </div>
    </>
  );
}
