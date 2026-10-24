import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import PageShell from '../components/PageShell';
import SpecularButton from '../components/SpecularButton';
import { MISSION, SITE, STATS, VALUES } from '../data/site';
import { ROUTE_META } from '../data/seo';
import { enter, reveal, stagger } from '../lib/motion';

const DELA = { fontFamily: "'Dela Gothic One', sans-serif" };

const twoDigit = (value) => String(value).padStart(2, '0');

function MacWindowControls() {
  return (
    <>
      <style>{`
        .mac-window-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mac-window-control {
          position: relative;
          display: grid;
          width: 1.25rem;
          height: 1.25rem;
          margin: -0.25rem;
          place-items: center;
          border-radius: 9999px;
        }

        .mac-window-control__surface {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: inherit;
          box-shadow:
            inset 0 0 0 0.5px rgba(35, 0, 0, 0.12),
            inset 0 1px 1px rgba(255, 255, 255, 0.2),
            inset 0 -1px 1px rgba(0, 0, 0, 0.12);
          transition: filter 160ms ease-out;
        }

        .mac-window-control--close .mac-window-control__surface {
          background:
            radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.16), transparent 58%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.035)),
            #ff5f56;
        }

        .mac-window-control--minimize .mac-window-control__surface {
          background:
            radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.2), transparent 58%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.045)),
            #ffbd2e;
        }

        .mac-window-control--maximize .mac-window-control__surface {
          background:
            radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.18), transparent 58%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.04)),
            #28c840;
        }

        .mac-window-control--close:hover .mac-window-control__surface {
          filter: brightness(1.08);
        }

        .mac-window-control--minimize:hover .mac-window-control__surface {
          filter: brightness(1.07);
        }

        .mac-window-control--maximize:hover .mac-window-control__surface {
          filter: brightness(1.08);
        }

        .mac-window-control__symbol {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 7px;
          height: 7px;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.85);
          transform-origin: center;
          transition:
            opacity 160ms ease-out,
            transform 160ms ease-out;
          pointer-events: none;
        }

        .mac-window-control__symbol path {
          vector-effect: non-scaling-stroke;
        }

        .mac-window-control:hover .mac-window-control__symbol {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        .code-line {
          display: block;
          clip-path: inset(0 100% 0 0);
          animation: code-type 500ms steps(28, end) forwards;
          animation-delay: var(--code-line-delay);
        }

        @keyframes code-type {
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mac-window-control__surface,
          .mac-window-control__symbol {
            transition: none;
          }

          .mac-window-control__symbol {
            transform: translate(-50%, -50%);
          }

          .code-line {
            animation: none;
            clip-path: none;
            opacity: 1;
          }
        }
      `}</style>

      <div className="mac-window-controls" aria-hidden="true">
        {['close', 'minimize', 'maximize'].map((variant) => (
          <span
            className={`mac-window-control mac-window-control--${variant}`}
            key={variant}
          >
            <span className="mac-window-control__surface" />
            <svg
              className="mac-window-control__symbol"
              viewBox="0 0 8 8"
              fill="none"
              aria-hidden="true"
            >
              {variant === 'close' && (
                <path
                  d="M1.25 1.25 6.75 6.75M6.75 1.25 1.25 6.75"
                  stroke="white"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              )}
              {variant === 'minimize' && (
                <path
                  d="M1.25 3.75h5.5"
                  stroke="#674600"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              )}
              {variant === 'maximize' && (
                <path
                  d="M3.3 3.3 1.25 1.25M1.25 2.45v-1.2h1.2M4.7 3.3l2.05-2.05m-1.2 0h1.2v1.2M3.3 4.7l-2.05 2.05m0-1.2v1.2h1.2M4.7 4.7l2.05 2.05m-1.2 0h1.2v-1.2"
                  stroke="#176026"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </span>
        ))}
      </div>
    </>
  );
}

// Purely decorative snippet rendered in the "studio.js" panel.
// Each line is a list of { text, colorClass } tokens.
const KEYWORD = 'text-[#f5b8c4]';
const PROP = 'text-[#db364e]';
const STRING = 'text-[#f5b8c4]';
const PLAIN = 'text-white';
const MUTED = 'text-white/80';
const COMMENT = 'text-white/70';

const CODE_LINES = [
  [{ t: '// this is how we work', c: COMMENT }],
  [
    { t: 'const ', c: KEYWORD },
    { t: 'codevio', c: PLAIN },
    { t: ' = {', c: MUTED },
  ],
  [
    { t: '  crafts', c: PROP },
    { t: ': [', c: MUTED },
    { t: "'ideas'", c: STRING },
    { t: ', ', c: MUTED },
    { t: "'interfaces'", c: STRING },
    { t: '],', c: MUTED },
  ],
  [
    { t: '  cares', c: PROP },
    { t: ': ', c: MUTED },
    { t: "'about the details',", c: STRING },
  ],
  [{ t: '};', c: MUTED }],
  [],
  [
    { t: 'function ', c: KEYWORD },
    { t: 'ship', c: PLAIN },
    { t: '(idea) {', c: MUTED },
  ],
  [
    { t: '  const ', c: KEYWORD },
    { t: 'design', c: PLAIN },
    { t: ' = ', c: MUTED },
    { t: 'craft', c: PLAIN },
    { t: '(idea);', c: MUTED },
  ],
  [
    { t: '  const ', c: KEYWORD },
    { t: 'code', c: PLAIN },
    { t: ' = ', c: MUTED },
    { t: 'engineer', c: PLAIN },
    { t: '(design);', c: MUTED },
  ],
  [
    { t: '  return ', c: KEYWORD },
    { t: 'polish', c: PLAIN },
    { t: '(code);', c: MUTED },
  ],
  [{ t: '}', c: MUTED }],
  [],
  [
    { t: 'export default ', c: KEYWORD },
    { t: 'ship', c: PLAIN },
    { t: '(', c: MUTED },
    { t: "'your next idea'", c: STRING },
    { t: ');', c: MUTED },
  ],
];

export default function About() {
  const navigate = useNavigate();

  return (
    <PageShell
      title={ROUTE_META['/about'].title}
      description={ROUTE_META['/about'].description}
    >
      <section className="relative z-10 mx-auto max-w-6xl pt-14 pb-4 sm:pt-28">
        <motion.p
          {...enter()}
          className="text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          / About Codevio
        </motion.p>

        <motion.h1
          {...enter(0.05)}
          className="editorial-hero-title mt-6 max-w-5xl text-left text-white"
          style={DELA}
        >
          We design, build, and ship products people actually enjoy using.
        </motion.h1>

        <motion.div {...enter(0.1)} className="relative mt-8 w-full max-w-5xl">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-[#db364e]/10 blur-2xl" />
          <div className="liquid-glass overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <MacWindowControls />
              <span className="ml-3 text-xs text-white/70">studio.js</span>
            </div>

            <pre
              tabIndex={0}
              role="region"
              aria-label="Studio config"
              className="bg-black/55 p-6 text-left font-['Bebas_Neue'] text-sm leading-relaxed tracking-[0.04em]"
            >
              <code className="block">
                {CODE_LINES.map((line, i) => (
                  <span key={i} className="flex items-start gap-4">
                    <span className="w-4 shrink-0 select-none text-white/55">
                      {i + 1}
                    </span>
                    <span
                      className="code-line min-w-0 flex-1 whitespace-pre-wrap break-words"
                      style={{ '--code-line-delay': `${i * 500}ms` }}
                    >
                      {line.length === 0
                        ? '\u00A0'
                        : line.map((token, j) => (
                            <span key={j} className={token.c}>
                              {token.t}
                            </span>
                          ))}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.p
            {...enter(0.15)}
            className="max-w-xl text-left text-lg text-white/75"
          >
            No account layers, no handoffs, no months of back-and-forth. The
            same senior designers and engineers who scope your project are the
            ones who design it, build it, and ship it — in fixed sprints with
            clear deliverables and predictable timelines.
          </motion.p>

          <motion.div
            {...enter(0.2)}
            className="flex shrink-0 flex-wrap items-center gap-6"
          >
            <SpecularButton onClick={() => navigate('/contact')}>
              Start a project
            </SpecularButton>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-16 max-w-6xl sm:mt-24">
        <motion.p
          {...reveal()}
          className="text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          {twoDigit(1)} / Who we are
        </motion.p>

        <div className="editorial-split editorial-split--wide mt-4">
          <div className="text-left">
            <motion.h2
              {...reveal(0.05)}
              className="editorial-title text-white"
              style={DELA}
            >
              {MISSION.statement}
            </motion.h2>

            <motion.p
              {...reveal(0.1)}
              className="mt-5 max-w-xl text-lg leading-snug text-white/75"
            >
              {MISSION.body}
            </motion.p>
          </div>

          <div className="border-t border-white/10 text-left">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...reveal(stagger(i))}
                className="flex items-baseline justify-between gap-6 border-b border-white/10 py-5"
              >
                <p className="font-['Bebas_Neue'] text-4xl leading-none text-white sm:text-5xl">
                  {stat.value}
                </p>
                <p className="max-w-[11rem] text-right font-['Bebas_Neue'] text-sm uppercase tracking-[0.14em] text-white/60">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-16 max-w-6xl sm:mt-24">
        <motion.p
          {...reveal()}
          className="text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          {twoDigit(2)} / Our approach
        </motion.p>

        <motion.h2
          {...reveal(0.05)}
          className="editorial-title mt-4 text-left text-white"
          style={DELA}
        >
          What we optimize for
        </motion.h2>

        <div className="editorial-index-grid mt-10">
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              {...reveal(stagger(i))}
              className="border-t border-white/10 pt-6 pb-8 text-left"
            >
              <div className="flex items-start gap-4">
                <span className="pt-0.5 font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-[#f5b8c4]">
                  {twoDigit(i + 1)}
                </span>

                <div className="min-w-0">
                  <h3 className="text-2xl leading-snug text-white" style={DELA}>
                    {value.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-snug text-white/75">
                    {value.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-16 max-w-6xl sm:mt-24">
        <motion.p
          {...reveal()}
          className="text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          {twoDigit(3)} / What makes us different
        </motion.p>

        <motion.h2
          {...reveal(0.05)}
          className="editorial-title mt-4 text-left text-white"
          style={DELA}
        >
          Different by design
        </motion.h2>

        <div className="mt-10">
          {MISSION.commitments.map((item, i) => (
            <motion.div
              key={item}
              {...reveal(stagger(i))}
              className="flex items-baseline gap-5 border-t border-white/10 py-6 text-left"
            >
              <span className="shrink-0 font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-[#f5b8c4]">
                {twoDigit(i + 1)}
              </span>
              <p className="text-2xl leading-snug text-white sm:text-3xl" style={DELA}>
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-16 max-w-6xl sm:mt-24">
        <div className="flex flex-col gap-10 border-t border-white/10 pt-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div {...reveal()} className="max-w-3xl text-left">
            <p className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]">
              / Contact
            </p>
            <h2 className="editorial-title mt-5 text-white" style={DELA}>
              Have an idea that deserves to ship? Let&apos;s make it real — in
              weeks, not quarters.
            </h2>
          </motion.div>

          <motion.div
            {...reveal(0.08)}
            className="flex shrink-0 flex-col items-start gap-5 text-left"
          >
            <p className="max-w-xs text-base leading-snug text-white/70">
              {SITE.responseTime}
            </p>
            <SpecularButton onClick={() => navigate('/contact')}>
              Start a project
            </SpecularButton>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
