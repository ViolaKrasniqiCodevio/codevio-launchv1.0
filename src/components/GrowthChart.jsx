import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { GROWTH_CHART } from '../data/site';
import { enter, reveal, EASE_SIGNATURE } from '../lib/motion';

import './GrowthChart.css';

// Plot geometry in SVG user units; the svg scales to its container and the
// label sizes step up on small screens in GrowthChart.css.
const W = 1000;
const H = 430;
const PAD = { top: 54, right: 48, bottom: 58, left: 92 };
const X_WEEKS = 13;
const Y_MAX = 100;
const Y_TICKS = [0, 25, 50, 75, 100];
const X_TICKS = [0, 2, 4, 6, 8, 10, 12];

const x = (week) => PAD.left + (week / X_WEEKS) * (W - PAD.left - PAD.right);
const y = (value) => H - PAD.bottom - (value / Y_MAX) * (H - PAD.top - PAD.bottom);

const toPath = (points) =>
  points
    .map(([week, value], i) => `${i === 0 ? 'M' : 'L'}${x(week).toFixed(1)} ${y(value).toFixed(1)}`)
    .join(' ');

const toArea = (points) => {
  const [firstWeek] = points[0];
  const [lastWeek] = points[points.length - 1];
  return `${toPath(points)} L${x(lastWeek).toFixed(1)} ${y(0)} L${x(firstWeek).toFixed(1)} ${y(0)} Z`;
};

function useIsCompact() {
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsCompact(query.matches);

    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  return isCompact;
}

export default function GrowthChart() {
  const reduceMotion = useReducedMotion();
  const isCompact = useIsCompact();

  const lastPoint = GROWTH_CHART.withLine[GROWTH_CHART.withLine.length - 1];
  const peaks = [...GROWTH_CHART.milestones, { week: lastPoint[0], value: lastPoint[1] }];

  // The solid line draws itself in once the plot scrolls into view; reduced
  // motion gets the finished line. On phones the chart reveals on mount, because
  // viewport-triggered SVG path animations can stall and leave the plot blank
  // in mobile Safari.
  const draw = reduceMotion
    ? {}
    : {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 1.5, ease: EASE_SIGNATURE, delay: 0.2 },
      };

  const fade = (delay) =>
    reduceMotion
      ? {}
      : isCompact
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.7, delay },
          }
        : {
            initial: { opacity: 0 },
            whileInView: { opacity: 1 },
            viewport: { once: true, amount: 0.4 },
            transition: { duration: 0.7, delay },
          };

  const lineMotion = reduceMotion ? {} : isCompact ? fade(0.2) : draw;

  // On phones every part of the section enters on mount instead of on scroll,
  // so a missed IntersectionObserver can't leave the section blank.
  const sectionReveal = (delay = 0) => (isCompact ? enter(delay) : reveal(delay));

  return (
    <section className="growth relative z-10 mx-auto mt-14 w-full max-w-7xl border-t border-white/10 px-6 pt-12 text-white sm:mt-16 sm:px-10 sm:pt-20 md:px-12">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start">
        <motion.div {...sectionReveal()}>
          <span className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.24em] text-[#f5b8c4]">
            {GROWTH_CHART.eyebrow}
          </span>

          <h2 className="mt-3 max-w-xl text-3xl leading-tight sm:text-4xl">
            {GROWTH_CHART.heading}
          </h2>
        </motion.div>

        <motion.p {...sectionReveal(0.05)} className="text-lg leading-relaxed text-white/75 md:pt-2">
          {GROWTH_CHART.body}
        </motion.p>
      </div>

      <motion.div {...sectionReveal(0.1)} className="mt-10 sm:mt-14">
        <div className="growth__legend">
          <span className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-white/85">
            <span className="growth__swatch growth__swatch--with" aria-hidden="true" />
            {GROWTH_CHART.withLabel}
          </span>
          <span className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-white/50">
            <span className="growth__swatch growth__swatch--without" aria-hidden="true" />
            {GROWTH_CHART.withoutLabel}
          </span>
        </div>

        <svg
          className="growth__svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="growth-chart-title growth-chart-desc"
        >
          <title id="growth-chart-title">Launch momentum over the first 12 weeks</title>
          <desc id="growth-chart-desc">
            With Codevio, launch momentum climbs through rising peaks at each ship date — +2, +5,
            +9 and +12 weeks — dipping briefly between ships and ending on the launch peak at
            about 95 percent. Going it alone drifts with stalls and reaches about 24 percent.
            Illustrative model, not a forecast.
          </desc>

          <defs>
            <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#db364e" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#db364e" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient
              id="growth-drop"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={y(95)}
              x2="0"
              y2={y(0)}
            >
              <stop offset="0%" stopColor="#db364e" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#db364e" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {Y_TICKS.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                className="growth__grid"
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                className="growth__tick"
                x={PAD.left - 12}
                y={y(tick) + 4}
                textAnchor="end"
              >
                {tick}%
              </text>
            </g>
          ))}

          {X_TICKS.map((tick) => (
            <text
              key={`x-${tick}`}
              className={`growth__tick${tick === 0 ? ' growth__tick--origin' : ''}`}
              x={x(tick)}
              y={H - PAD.bottom + 26}
              textAnchor="middle"
            >
              {tick === 0 ? 'Week 0' : tick}
            </text>
          ))}

          <text
            className="growth__tick growth__tick--weeks"
            x={W - PAD.right}
            y={H - PAD.bottom + 26}
            textAnchor="end"
          >
            weeks →
          </text>

          <text className="growth__axis-title" x={PAD.left} y={26}>
            Launch momentum
          </text>

          <motion.path
            className="growth__area"
            d={toArea(GROWTH_CHART.withLine)}
            fill="url(#growth-fill)"
            {...fade(1.1)}
          />

          <motion.path
            className="growth__line growth__line--without"
            d={toPath(GROWTH_CHART.soloLine)}
            {...fade(0.9)}
          />

          {peaks.map((peak, i) => (
            <motion.line
              key={`drop-${peak.week}`}
              className="growth__drop"
              x1={x(peak.week)}
              x2={x(peak.week)}
              y1={y(peak.value)}
              y2={y(0)}
              {...fade(0.7 + i * 0.15)}
            />
          ))}

          <motion.path
            className="growth__line growth__line--with"
            d={toPath(GROWTH_CHART.withLine)}
            {...lineMotion}
          />

          {peaks.map((peak, i) => (
            <motion.g key={`peak-${peak.week}`} {...fade(0.6 + i * 0.2)}>
              <circle
                className="growth__dot"
                cx={x(peak.week)}
                cy={y(peak.value)}
                r="7"
              />
            </motion.g>
          ))}

          {GROWTH_CHART.milestones.map((milestone) => (
            <text
              key={`label-${milestone.week}`}
              className="growth__marker-label"
              x={x(milestone.week)}
              y={y(milestone.value) - 24}
              textAnchor="middle"
            >
              {milestone.label}
            </text>
          ))}
        </svg>

        <p className="mt-4 text-sm leading-snug text-white/45">{GROWTH_CHART.footnote}</p>
      </motion.div>
    </section>
  );
}
