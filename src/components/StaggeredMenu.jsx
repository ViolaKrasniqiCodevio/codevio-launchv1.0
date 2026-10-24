import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import logo from '../assets/logo.png';

const SOCIAL_ICONS = {
  twitter: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.27 5.649zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  x: (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.27 5.649zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
),
  instagram: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  linkedin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  facebook: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  youtube: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
    </svg>
  ),
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  ),
  tiktok: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  ),
};

function getSocialIcon(label) {
  const key = label.toLowerCase().replace(/\s/g, '');
  return SOCIAL_ICONS[key] || (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

const StaggeredMenu = ({
  position = 'right',
  colors = ['#fcdfe4', '#f5b8c4'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = logo,
  logoOpenUrl = null,
  logoLink = '/',
  menuButtonColor = '#fcdfe4',
  openMenuButtonColor = '#1c1210',
  menuTextColor = '#1c1210',
  menuHoverColor = '#db364e',
  changeMenuColorOnOpen = true,
  isFixed = false,
  accentColor = '#db364e',
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openRef = useRef(false);
  const { pathname } = useLocation();
  const prefersReducedMotionRef = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);

  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const colorTweenRef = useRef(null);

  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;

      if (!panel || !plusH || !plusV || !icon) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map(el => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 120, rotate: 6 });
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity']: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.4, ease: 'power3.out' }, i * 0.045);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.045 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.03 : 0);
    const panelDuration = 0.48;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power3.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.18;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 0.5, ease: 'power3.out', stagger: { each: 0.04, from: 'start' } },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.3, ease: 'power2.out', ['--sm-num-opacity']: 1, stagger: { each: 0.03, from: 'start' } },
          itemsStart + 0.06
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.32;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.3, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: 'power3.out',
            stagger: { each: 0.035, from: 'start' },
            onComplete: () => gsap.set(socialLinks, { clearProps: 'opacity' })
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      if (prefersReducedMotionRef.current) {
        tl.progress(1, false).pause();
        busyRef.current = false;
      } else {
        tl.eventCallback('onComplete', () => {
          busyRef.current = false;
        });
        tl.play(0);
      }
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: prefersReducedMotionRef.current ? 0 : 0.26,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) gsap.set(itemEls, { yPercent: 120, rotate: 6 });

        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity']: 0 });

        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (prefersReducedMotionRef.current) {
      if (opening) {
        gsap.set(h, { rotate: 45 });
        gsap.set(v, { rotate: -45 });
      } else {
        gsap.set(h, { rotate: 0 });
        gsap.set(v, { rotate: 90 });
        gsap.set(icon, { rotate: 0 });
      }
      return;
    }

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(h, { rotate: 45, duration: 0.35 }, 0)
        .to(v, { rotate: -45, duration: 0.35 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.25 }, 0)
        .to(v, { rotate: 90, duration: 0.25 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: prefersReducedMotionRef.current ? 0 : 0.1, duration: prefersReducedMotionRef.current ? 0 : 0.2, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
  }, [playOpen, playClose, animateIcon, animateColor, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
    }
  }, [playClose, animateIcon, animateColor, onMenuClose]);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = event => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  React.useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const toggle = toggleBtnRef.current;
    if (!panel) return undefined;

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const firstItem = panel.querySelector(focusableSelector);
    firstItem?.focus();

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        toggle?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const nodes = [
        toggle,
        ...Array.from(panel.querySelectorAll(focusableSelector)),
      ].filter(Boolean);
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeMenu]);

  return (
    <div
      className={`sm-scope z-40 ${isFixed ? 'fixed top-0 left-0 w-screen h-screen overflow-hidden' : 'w-full h-full'}`}
    >
      <div
        className={
          (className ? className + ' ' : '') + 'staggered-menu-wrapper pointer-events-none relative w-full h-full'
        }
        style={{
          ['--sm-accent']: accentColor,
          ['--sm-menu-button']: menuButtonColor,
          ['--sm-surface']: colors?.[0] ?? '#fcdfe4',
          ['--sm-text']: menuTextColor,
          ['--sm-hover']: menuHoverColor,
        }}
        data-position={position}
        data-open={open || undefined}
      >
        <div
          ref={preLayersRef}
          className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
          aria-hidden="true"
        >
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ['#fcdfe4', '#f5b8c4'];
            let arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        <div className="sm-header-fade" aria-hidden="true">
          <div className={`sm-header-backdrop${scrolled ? ' is-scrolled' : ''}`} />
        </div>

        <header
          className={`staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between p-[2em] bg-transparent pointer-events-none z-20${scrolled ? ' is-scrolled' : ''}`}
          aria-label="Main navigation header"
        >
          <Link
            to={logoLink}
            className="sm-logo flex items-center select-none pointer-events-auto"
            aria-label="Codevio home"
            onClick={() => {
              closeMenu();
              if (window.location.pathname === logoLink) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <img
              src={(open && logoOpenUrl && window.innerWidth < 1024) ? logoOpenUrl : logoUrl}
              alt="Codevio"
              className="sm-logo-img block h-8 w-auto object-contain"
              draggable={false}
              width={110}
              height={24}
            />
          </Link>

          <button
            ref={toggleBtnRef}
            className="sm-toggle relative inline-flex items-center bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible pointer-events-auto"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              ref={iconRef}
              className="sm-icon relative w-[22px] h-[22px] shrink-0 inline-flex items-center justify-center [will-change:transform]"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2.5px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
              <span
                ref={plusVRef}
                className="sm-icon-line sm-icon-line-v absolute left-1/2 top-1/2 w-full h-[2.5px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
            </span>
          </button>
        </header>

        <nav
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel absolute top-0 right-0 h-full flex flex-col p-[6em_2em_2em_2em] overflow-y-auto z-10 pointer-events-auto"
          aria-label="Main"
          aria-hidden={!open}
          inert={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items && items.length ? (
                items.map((it, idx) => (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                    <Link
                      className="sm-panel-item relative font-semibold text-[4rem] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]"
                      to={it.link}
                      aria-label={it.ariaLabel}
                      onClick={closeMenu}
                      aria-current={
                        (it.link === '/' ? pathname === '/' : pathname === it.link || pathname.startsWith(`${it.link}/`))
                          ? 'page'
                          : undefined
                      }
                      data-index={idx + 1}
                    >
                      <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                        {it.label}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                  <span className="sm-panel-item relative font-semibold text-[4rem] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]">
                    <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems && socialItems.length > 0 && (
              <nav className="sm-socials mt-auto pt-8 flex flex-col gap-3" aria-label="Social links">
                <ul
                  className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap"
                  role="list"
                >
                  {socialItems.map((s, i) => (
                    <li key={s.label + i} className="sm-socials-item">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="sm-socials-link no-underline relative inline-flex items-center justify-center transition-[color,opacity] duration-300 ease-linear"
                      >
                        {getSocialIcon(s.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </nav>
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 40;
  pointer-events: none;
}

.sm-scope .staggered-menu-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 3vw, 2rem);
  background: transparent;
  pointer-events: none;
  z-index: 20;
  transition: padding 280ms ease;
}

/* Blurred top strip lives on its own layer so it can sit behind the menu panel
   (it stays visible while the menu is open) and feather out towards the bottom
   instead of ending on a hard line. The mask sits on the wrapper: applying it
   directly to the backdrop-filter element leaves the blur clipped to a visible
   edge in Chromium. */
.sm-scope .sm-header-fade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: clamp(5.5rem, 9vw, 8rem);
  pointer-events: none;
  z-index: 4;
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 38%,
    rgba(0, 0, 0, 0.72) 62%,
    rgba(0, 0, 0, 0.32) 82%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 38%,
    rgba(0, 0, 0, 0.72) 62%,
    rgba(0, 0, 0, 0.32) 82%,
    transparent 100%
  );
}

.sm-scope .sm-header-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 320ms ease;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 15, 0.92) 0%,
    rgba(10, 10, 15, 0.55) 45%,
    rgba(10, 10, 15, 0.18) 75%,
    rgba(10, 10, 15, 0) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.sm-scope .sm-header-backdrop.is-scrolled {
  opacity: 1;
}

.sm-scope .staggered-menu-header > * {
  pointer-events: auto;
}

/* Desktop: the header collapses to a slimmer strip once the page scrolls. */
@media (min-width: 1024px) {
  .sm-scope .staggered-menu-header.is-scrolled {
    padding-top: 0.9rem;
    padding-bottom: 0.9rem;
  }
}

/* Phones: there is no room to let content read through the header, so the
   backdrop turns near-solid over the logo row and keeps the soft fade below. */
@media (max-width: 767px) {
  .sm-scope .sm-header-fade {
    height: clamp(7rem, 32vw, 9rem);
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 62%,
      rgba(0, 0, 0, 0.9) 74%,
      rgba(0, 0, 0, 0.4) 88%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 62%,
      rgba(0, 0, 0, 0.9) 74%,
      rgba(0, 0, 0, 0.4) 88%,
      transparent 100%
    );
  }

  .sm-scope .sm-header-backdrop {
    background: linear-gradient(
      to bottom,
      #0a0a0f 0%,
      #0a0a0f 62%,
      rgba(10, 10, 15, 0.92) 74%,
      rgba(10, 10, 15, 0.55) 88%,
      rgba(10, 10, 15, 0) 100%
    );
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sm-scope .staggered-menu-header,
  .sm-scope .sm-header-backdrop {
    transition: none;
  }
}

.sm-scope .sm-logo {
  display: flex;
  align-items: center;
  user-select: none;
}

.sm-scope .sm-logo-img {
  display: block;
  height: clamp(24px, 4vw, 32px);
  width: auto;
  max-width: min(42vw, 160px);
  object-fit: contain;
}

.sm-scope .sm-toggle {
  position: relative;
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--sm-menu-button, #fcdfe4);
  font-weight: 500;
  line-height: 1;
  overflow: visible;
  padding: 0;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  box-sizing: border-box;
}

.sm-scope .sm-toggle:focus-visible {
  outline: 2px solid var(--sm-hover, #db364e);
  outline-offset: 4px;
  border-radius: 6px;
}

.sm-scope .sm-icon {
  position: relative;
  width: clamp(20px, 4vw, 26px);
  height: clamp(20px, 4vw, 26px);
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.sm-scope .sm-icon-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 2.5px;
  background: currentColor;
  border-radius: 2px;
  transform: translate(-50%, -50%);
  will-change: transform;
}

.sm-scope .staggered-menu-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: clamp(300px, 42vw, 460px);
  height: 100%;
  background: var(--sm-surface, #fcdfe4);
  display: flex;
  flex-direction: column;
  padding: clamp(5rem, 12vh, 7rem) clamp(1.25rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 2.5rem);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
  overscroll-behavior: contain;
}

.sm-scope [data-position='left'] .staggered-menu-panel {
  right: auto;
  left: 0;
}

.sm-scope .sm-prelayers {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: clamp(300px, 42vw, 460px);
  pointer-events: none;
  z-index: 5;
}

.sm-scope [data-position='left'] .sm-prelayers {
  right: auto;
  left: 0;
}

.sm-scope .sm-prelayer {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  transform: translateX(0);
}

.sm-scope .sm-panel-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
  min-height: 0;
}

.sm-scope .sm-panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.35rem, 1.5vw, 0.65rem);
}

.sm-scope .sm-panel-itemWrap {
  position: relative;
  overflow: hidden;
  line-height: 1;
}

.sm-scope .sm-panel-item {
  position: relative;
  color: var(--sm-text, #1c1210);
  font-weight: 600;
  font-size: clamp(1.8rem, 6vw, 3.2rem);
  cursor: pointer;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  -webkit-text-stroke: 0 transparent;
  paint-order: stroke fill;
  text-shadow: none;
  transition: color 0.25s, -webkit-text-stroke-color 0.25s, text-shadow 0.25s;
  display: inline-block;
  text-decoration: none;
  padding-right: 1.3em;
  max-width: 100%;
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: normal;
}

.sm-scope .sm-panel-itemLabel {
  display: inline-block;
  will-change: transform;
  transform-origin: 50% 100%;
}

.sm-scope .sm-panel-item:hover,
.sm-scope .sm-panel-item:focus-visible {
  color: var(--sm-hover, #db364e);
  -webkit-text-stroke: 1px var(--sm-text, #1c1210);
  text-shadow:
    -4px 4px 0 var(--sm-text, #1c1210),
    -5px 5px 0 #fff;
}

.sm-scope .sm-panel-list[data-numbering] {
  counter-reset: smItem;
}

.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
  counter-increment: smItem;
  content: counter(smItem, decimal-leading-zero);
  position: absolute;
  top: 0.08em;
  right: 0;
  font-size: clamp(0.7rem, 1.8vw, 1rem);
  font-weight: 400;
  color: var(--sm-accent, #db364e);
  letter-spacing: 0;
  pointer-events: none;
  user-select: none;
  opacity: var(--sm-num-opacity, 0);
}

.sm-scope .sm-socials {
  margin-top: auto;
  padding-top: clamp(1.5rem, 5vh, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sm-scope .sm-socials-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--sm-accent, #db364e);
}

.sm-scope .sm-socials-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(0.5rem, 2vw, 1rem);
  flex-wrap: wrap;
}

.sm-scope .sm-socials-link {
  color: var(--sm-text, #1c1210);
  text-decoration: none;
  position: relative;
  width: 44px;
  height: 44px;
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: 1;
  transition: color 0.3s ease, opacity 0.3s ease, background 0.2s ease;
}

.sm-scope .sm-socials-link:hover {
  color: var(--sm-hover, #db364e);
  background: color-mix(in srgb, var(--sm-hover, #db364e) 8%, transparent);
}

.sm-scope .sm-socials-link:focus-visible {
  outline: 2px solid var(--sm-hover, #db364e);
  outline-offset: 3px;
}

.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) {
  opacity: 0.35;
}

.sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) {
  opacity: 0.35;
}

@media (max-width: 1023.98px) {
  .sm-scope .staggered-menu-panel,
  .sm-scope .sm-prelayers {
    width: min(520px, 72vw);
  }

  .sm-scope .sm-panel-item {
    font-size: clamp(1.9rem, 6vw, 3.1rem);
  }
}

@media (max-width: 768px) {
  .sm-scope .staggered-menu-panel,
  .sm-scope .sm-prelayers {
    width: 100%;
    left: 0;
    right: 0;
  }

  .sm-scope .staggered-menu-panel {
    padding-top: 5.5rem;
  }

  .sm-scope .sm-logo {
    min-height: 44px;
  }

  .sm-scope .sm-panel-list {
    gap: 0.45rem;
  }

  .sm-scope .sm-panel-item {
    font-size: clamp(1.9rem, 10vw, 3.2rem);
    line-height: 0.92;
    letter-spacing: -0.025em;
    padding-right: 1.05em;
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
    white-space: nowrap;
  }

  .sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
    top: 0.12em;
    font-size: 0.78rem;
  }

  .sm-scope .sm-socials {
    padding-top: 2rem;
  }
}

@media (max-width: 480px) {
  .sm-scope .staggered-menu-header {
    padding: 0.85rem;
  }

  .sm-scope .staggered-menu-panel {
    padding: 5rem 1rem 1.25rem;
  }

  .sm-scope .sm-panel-item {
    font-size: clamp(1.6rem, 11vw, 2.7rem);
    padding-right: 0.9em;
    white-space: nowrap;
  }

  .sm-scope .sm-socials-link {
    width: 44px;
    height: 44px;
  }

  .sm-scope .sm-logo-img {
    max-width: 130px;
  }
}

@media (max-width: 360px) {
  .sm-scope .sm-panel-item {
    font-size: 1.55rem;
    letter-spacing: -0.015em;
    white-space: nowrap;
  }

  .sm-scope .staggered-menu-panel {
    padding-left: 0.85rem;
    padding-right: 0.85rem;
  }
}
`}</style>
    </div>
  );
};

export default StaggeredMenu;