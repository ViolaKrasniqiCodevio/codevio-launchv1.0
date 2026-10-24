import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import SpecularButton from './SpecularButton';
import { reveal } from '../lib/motion';

const DELA = { fontFamily: "'Dela Gothic One', sans-serif" };
const MotionLink = motion.create(Link);

// Closing call-to-action under the growth chart. Mirrors the Services page
// contact block — eyebrow, statement, and two quick links — with the copy
// adapted for the home page.
export default function HomeCta() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 mx-auto mt-14 w-full max-w-[1116px] px-6 pb-20 sm:mt-24 sm:pb-32 lg:px-[18px]">
      <div className="flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-[24px]">
        <motion.div {...reveal()} className="max-w-3xl text-left">
          <p className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]">
            / Contact
          </p>

          <h2 className="editorial-title mt-4 text-white lg:mt-[12px]" style={DELA}>
            Tell us what you are building. We will tell you what is possible in
            a sprint.
          </h2>
        </motion.div>

        <motion.div
          {...reveal(0.08)}
          className="flex shrink-0 flex-col items-start gap-4 text-left"
        >
          <SpecularButton onClick={() => navigate('/contact')}>
            Start a project
          </SpecularButton>
        </motion.div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-[24px]">
        <MotionLink
          {...reveal()}
          to="/contact"
          className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/10 px-6 py-5 text-left transition-colors duration-300 hover:border-[#b02a3d]/70 sm:gap-6 lg:gap-[18px] lg:p-[21px]"
        >
          <span className="min-w-0">
            <span className="block font-['Bebas_Neue'] text-xs uppercase tracking-[0.2em] text-white/60">
              / Contact
            </span>
            <span
              className="mt-1 block break-words text-xl text-white sm:text-2xl lg:text-[1rem] lg:leading-[24px]"
              style={DELA}
            >
              Get in Touch
            </span>
          </span>
          <ArrowUpRight
            className="size-5 shrink-0 text-[#f5b8c4] transition-transform duration-300 group-hover:rotate-45"
            aria-hidden="true"
          />
        </MotionLink>

        <MotionLink
          {...reveal(0.05)}
          to="/about"
          className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/10 px-6 py-5 text-left transition-colors duration-300 hover:border-[#b02a3d]/70 sm:gap-6 lg:gap-[18px] lg:p-[21px]"
        >
          <span className="min-w-0">
            <span className="block font-['Bebas_Neue'] text-xs uppercase tracking-[0.2em] text-white/60">
              / Next
            </span>
            <span
              className="mt-1 block break-words text-xl text-white sm:text-2xl lg:text-[1rem] lg:leading-[24px]"
              style={DELA}
            >
              About Codevio
            </span>
          </span>
          <ArrowUpRight
            className="size-5 shrink-0 text-[#f5b8c4] transition-transform duration-300 group-hover:rotate-45"
            aria-hidden="true"
          />
        </MotionLink>
      </div>
    </section>
  );
}
