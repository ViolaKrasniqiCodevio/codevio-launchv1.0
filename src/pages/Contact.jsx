import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import Footer from '../components/Footer';
import Grainient from '../components/Grainient';
import StaggeredMenu from '../components/StaggeredMenu';
import ContactForm from '../components/ContactForm';
import SocialIcon from '../components/SocialIcon';

import useDocumentTitle from '../lib/useDocumentTitle';
import { reveal } from '../lib/motion';
import { NAV_ITEMS, PAGE_THEME, SOCIAL_ITEMS, SITE } from '../data/site';
import { ROUTE_META } from '../data/seo';

import logo from '../assets/logo.png';
import logoAlt from '../assets/logo_alt.png';

import '../components/Lanyard.css';

export default function Contact() {
  useDocumentTitle(ROUTE_META['/contact'].title, ROUTE_META['/contact'].description);

  return (
    <>
        <main id="main" tabIndex={-1} className="compact-layout relative min-h-screen overflow-hidden px-6 py-14 text-white sm:py-24">
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

        {/* A div, not a section: index.css forces `section` to 1080px on desktop. */}
        <div className="relative z-10 mx-auto max-w-6xl pt-14 pb-8 sm:pt-28 min-[1024px]:pt-[84px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
            <div className="text-left">
              <motion.p
                {...reveal()}
                className="flex items-center gap-3 font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
              >
                <span className="h-px w-8 bg-[#f5b8c4]/60" aria-hidden="true" />
                Get in touch
              </motion.p>

              <motion.h1
                {...reveal(0.05)}
                className="editorial-hero-title mt-6 text-white"
                style={{ fontFamily: "'Dela Gothic One', sans-serif" }}
              >
                Tell us the idea and the deadline
                <span
                  aria-hidden="true"
                  className="ml-2 inline-block size-3.5 bg-[#db364e]"
                />
              </motion.h1>

              <motion.a
                {...reveal(0.1)}
                href={`mailto:${SITE.email}`}
                className="mt-10 block border-b border-white/15 pb-3 font-['Bebas_Neue'] text-lg uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-[#f5b8c4]/60 hover:text-[#f5b8c4]"
              >
                {SITE.email}
              </motion.a>

              <motion.p
                {...reveal(0.15)}
                className="mt-6 max-w-md text-base leading-snug text-white/70"
              >
                Share where you are headed and what is already decided — a
                website, an online store, a product build, or an AI workflow.{' '}
                {SITE.responseTime}
              </motion.p>

              <motion.div
                {...reveal(0.2)}
                className="mt-8 flex flex-wrap gap-x-5 gap-y-1"
              >
                {SOCIAL_ITEMS.map((social) => (
                  <a
                    key={social.label}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 font-['Bebas_Neue'] text-sm uppercase tracking-[0.16em] text-white/75 transition-colors duration-300 hover:text-[#f5b8c4]"
                  >
                    <SocialIcon label={social.label} className="size-4 shrink-0" />
                    {social.label}
                  </a>
                ))}
              </motion.div>

              <motion.div {...reveal(0.2)}>
                <Link
                  to="/"
                  className="group mt-10 inline-flex items-center gap-2 border-b border-white/20 pb-2 font-['Bebas_Neue'] text-sm uppercase tracking-[0.16em] text-white/80 transition-colors duration-300 hover:border-[#f5b8c4]/60 hover:text-[#f5b8c4]"
                >
                  <ArrowLeft
                    className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                  Back to home
                </Link>
              </motion.div>
            </div>

            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
