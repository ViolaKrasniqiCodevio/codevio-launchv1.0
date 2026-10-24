import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { MISSION, SITE, STATS } from '../data/site';
import { reveal } from '../lib/motion';

const CAPABILITIES = [
  'Brand & identity',
  'Websites & online stores',
  'SaaS & web products',
  'AI agents & automation',
];

export default function PositioningStrip() {
  return (
    <section className="home-positioning relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-col justify-center-safe px-4 py-8 text-center text-white sm:min-h-screen sm:px-10 sm:py-12 md:px-12">
      {/* Mobile keeps the original centred stack; from lg the tagline + CTA sit
          left and the supporting copy + stats run down the right column. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-2 lg:text-left">
        <motion.h1
          {...reveal(0.05)}
          className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-center mx-auto mt-3 mb-2 max-w-5xl text-5xl leading-tight sm:mt-6 sm:text-6xl md:text-7xl lg:mx-0 lg:mt-0 lg:text-left"
          style={{ fontFamily: "'Dela Gothic One', sans-serif" }}
        >
          {SITE.tagline}
        </motion.h1>

        <motion.p
          {...reveal(0.1)}
          className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center mx-auto mt-3 max-w-3xl text-xl leading-relaxed text-white/80 sm:mt-8 sm:text-2xl lg:mt-0"
        >
          {MISSION.body}
        </motion.p>

        <motion.div
          {...reveal(0.15)}
          className="lg:col-start-1 lg:row-start-3 mx-auto mt-16 w-full max-w-3xl border-t border-white/10 pt-8 text-left max-sm:mt-10 lg:mx-0 lg:mt-12"
        >
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.24em] text-[#f5b8c4]">
              What we ship
            </p>

            <Link
              to="/services"
              className="group inline-flex min-h-11 items-center gap-1.5 font-['Bebas_Neue'] text-sm uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:text-[#f5b8c4] lg:min-h-0"
            >
              All services
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:rotate-45"
                aria-hidden="true"
              />
            </Link>
          </div>

          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10">
            {CAPABILITIES.map((capability, i) => (
              <li
                key={capability}
                className="flex items-baseline gap-5 border-t border-white/10 py-3.5"
              >
                <span className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-white/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-['Bebas_Neue'] text-lg uppercase tracking-[0.06em] text-white/80">
                  {capability}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          {...reveal(0.15)}
          className="lg:col-start-2 lg:row-start-3 mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 border-t border-white/10 pt-8 max-sm:mt-10 max-sm:gap-6 max-sm:pt-6 sm:grid-cols-3 lg:mx-0 lg:mt-12"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p
                className="text-3xl text-white sm:text-4xl"
                style={{ fontFamily: "'Dela Gothic One', sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="mt-2 font-['Bebas_Neue'] text-base uppercase tracking-[0.1em] text-white/65">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
