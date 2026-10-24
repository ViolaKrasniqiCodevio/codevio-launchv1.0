import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import logo from '../assets/logo.png';
import SocialIcon from './SocialIcon';
import { NAV_ITEMS, SOCIAL_ITEMS, SITE } from '../data/site';

function MenuAnimation({ items, pathname }) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-8 gap-y-3 overflow-visible md:flex md:w-auto md:min-w-fit md:flex-col md:items-end">
      {items.map((item, index) => {
        const isActive =
          item.to === '/'
            ? pathname === '/'
            : pathname === item.to || pathname.startsWith(`${item.to}/`);

        return (
          <Link
            key={index}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className="group/menu flex min-h-11 items-center justify-center gap-2 py-1 no-underline md:min-h-0 md:justify-end"
          >
            <span className="z-10 translate-x-6 cursor-pointer font-['Dela_Gothic_One'] text-sm uppercase tracking-[0.08em] text-white/70 transition duration-300 ease-out group-hover/menu:translate-x-0 group-hover/menu:text-[#db364e] sm:text-base md:translate-x-7">
              {item.label}
            </span>

            <ArrowLeft className="size-4 translate-x-0 text-white opacity-0 transition duration-300 ease-out md:size-5 md:translate-x-full md:group-hover/menu:translate-x-0 md:group-hover/menu:text-[#db364e] md:group-hover/menu:opacity-100" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

export default function Footer() {
  const { pathname } = useLocation();
  const links = NAV_ITEMS.map(({ label, link }) => ({ label, to: link }));

  const socials = SOCIAL_ITEMS.map(({ label, link }) => ({ label, href: link }));

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <footer
      className="relative overflow-hidden bg-black text-white"
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      <style>{`
        .footer-something {
          position: relative;
          display: inline-block;
          color: #fff;
          -webkit-text-stroke: 1px #fff;
          text-shadow:
            -4px 4px 0 #1a1a2e,
            -5px 5px 0 #fff;
          transition:
            color 0.25s ease,
            text-shadow 0.25s ease,
            -webkit-text-stroke 0.25s ease;
        }

        .footer-something:hover {
          color: #db364e;
          -webkit-text-stroke: 1px #fff;
          text-shadow:
            -4px 4px 0 #1a1a2e,
            -5px 5px 0 #fff;
        }
      `}</style>

      <div className="compact-footer mx-auto flex min-h-[500px] w-full max-w-7xl flex-col justify-between px-6 pb-16 pt-8 text-center sm:px-8 md:min-h-[560px] md:px-10 md:py-10 md:text-left lg:px-12">
      <div className="flex flex-col items-start gap-6 sm:gap-10 md:flex-row md:items-start md:justify-between">
          <Link to="/" className="inline-flex min-h-11 w-fit items-center md:min-h-0">
            <img
              src={logo}
              alt="Codevio"
              width={330}
              height={83}
              loading="lazy"
              decoding="async"
              className="h-8 w-auto object-contain"
              draggable={false}
            />
          </Link>

          <nav aria-label="Footer navigation" className="w-full max-w-[240px] -translate-x-4 self-center md:w-auto md:max-w-none md:translate-x-0 md:self-auto">
            <MenuAnimation items={links} pathname={pathname} />
          </nav>
        </div>

        <div className="grid gap-6 sm:gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="hidden md:block">
              <p className="max-w-4xl text-center font-['Dela_Gothic_One'] text-[clamp(1.7rem,5.5vw,5rem)] font-bold uppercase leading-[0.95] tracking-[-0.02em] text-white md:text-left">
              <span className="whitespace-nowrap">Let&apos;s build</span>{' '}<br className="footer-desktop-break" />
              <Link to="/contact" className="footer-something">
                something
              </Link>{' '}<br className="footer-desktop-break" />
              <span className="whitespace-nowrap">that moves.</span>
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-5 text-center text-base tracking-[0.03em] sm:text-lg md:w-auto md:items-end md:text-right lg:min-w-[360px]">
            <div className="flex flex-col gap-2 text-white/80">
              <a
                href={`mailto:${SITE.email}`}
                className="min-h-11 whitespace-nowrap py-0.5 transition-colors duration-300 hover:text-[#db364e] md:min-h-0"
              >
                {SITE.email}
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-white/75 md:justify-end lg:flex-nowrap">
              {socials.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap py-1 font-['Bebas_Neue'] uppercase transition-colors duration-300 hover:text-[#db364e] md:min-h-0 md:min-w-0"
                >
                  <SocialIcon label={social.label} className="size-4 shrink-0" />
                  {social.label}
                </a>
              ))}
            </div>

          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-center font-['Dela_Gothic_One'] text-xs uppercase tracking-[0.14em] text-white/80 sm:flex-row sm:items-center sm:justify-between sm:pr-20 sm:text-left md:pr-24">
          <p>© {new Date().getFullYear()} Codevio</p>
          <p>{SITE.tagline}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className="absolute right-6 top-6 z-10 inline-flex size-12 items-center justify-center rounded-full border border-white/35 text-white/80 transition-colors duration-300 hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcdfe4] sm:right-8 md:top-auto md:right-8 md:bottom-8 md:size-14"
      >
        <ArrowUp className="size-5 md:size-6" aria-hidden="true" />
      </button>
    </footer>
  );
}
