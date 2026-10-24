import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';

import PageShell from '../components/PageShell';
import SpecularButton from '../components/SpecularButton';
import { CORE_SERVICES, OFFERS } from '../data/site';
import { ROUTE_META } from '../data/seo';
import { reveal, stagger } from '../lib/motion';

const DELA = { fontFamily: "'Dela Gothic One', sans-serif" };
const MotionLink = motion.create(Link);

const twoDigit = (value) => String(value).padStart(2, '0');

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const groupOffersByCategory = (offers) =>
  offers.reduce((groups, offer) => {
    const existing = groups.find((group) => group.category === offer.category);
    if (existing) existing.items.push(offer);
    else groups.push({ category: offer.category, items: [offer] });
    return groups;
  }, []);

// Presentation copy for the package sections: the category heading, tagline,
// CTA line, and the timeline shown beside the package rows. Deliverables and
// timelines always come from OFFERS in site.js.
const PACKAGE_SECTIONS = {
  Launch: {
    title: 'Launch packages',
    tagline:
      'Brand, landing page, or the full package — a credible launch, live in weeks.',
    cta: 'Launch with direction',
    timeline: '1–5 weeks',
  },
  Websites: {
    title: 'Websites & e-commerce',
    tagline:
      'Marketing sites, premium builds, and online stores that sell — designed and engineered by one team.',
    cta: 'Build a site that performs',
    timeline: '2–5 weeks',
  },
  'Monthly Retainers': {
    title: 'Ongoing support',
    tagline:
      'Keep momentum after launch with senior design, development, and AI hours every month.',
    cta: 'Keep things moving',
    timeline: 'Monthly · 3-month minimum',
  },
};

// AI, Product, and Custom are the three smallest categories — four services in
// total. They share one compact section: an intro column beside a 2x2 grid of
// service cards, instead of the accordion rows the larger categories use.
const MERGED_CATEGORIES = ['AI', 'Product', 'Custom'];

const MERGED_SECTION = {
  category: 'AI, product & custom',
  title: 'AI, product & custom builds',
  tagline:
    'Focused agents, connected workflows, and working products — scoped as a sprint or a statement of work.',
  cta: 'Discuss your project',
};

const buildPackageSections = () => {
  const mergedItems = OFFERS.filter((offer) =>
    MERGED_CATEGORIES.includes(offer.category)
  );
  const sections = [];

  for (const group of groupOffersByCategory(OFFERS)) {
    if (group.category === MERGED_CATEGORIES[0]) {
      sections.push({ ...MERGED_SECTION, items: mergedItems, merged: true });
    } else if (!MERGED_CATEGORIES.includes(group.category)) {
      sections.push({
        category: group.category,
        items: group.items,
        merged: false,
      });
    }
  }

  return sections;
};

const PACKAGE_GROUPS = buildPackageSections();

function OfferRow({ offer, index, prefix, isOpen, onToggle }) {
  const panelId = `${prefix}-panel`;

  return (
    <motion.div
      {...reveal(stagger(index, 0.06, 0.18))}
      className="border-b border-white/10"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto_1rem] items-start gap-x-4 gap-y-1 py-4 text-left transition-colors duration-300 hover:bg-white/[0.02] sm:grid-cols-[2.25rem_minmax(0,1fr)_auto_1.25rem] sm:gap-x-6"
      >
        <span className="pt-0.5 font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-[#f5b8c4] transition-colors duration-300 group-hover:text-[#db364e]">
          {twoDigit(index + 1)}
        </span>

        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-3">
            <span
              className="editorial-row-title text-white transition-colors duration-300 group-hover:text-[#fcdfe4]"
              style={DELA}
            >
              {offer.title}
            </span>

            {offer.badge ? (
              <span className="rounded-full border border-[#db364e]/50 bg-[#db364e]/15 px-2.5 py-0.5 font-['Bebas_Neue'] text-[0.65rem] uppercase tracking-[0.14em] text-[#fcdfe4]">
                {offer.badge}
              </span>
            ) : null}
          </span>

          <span className="text-base leading-snug text-white/70">
            {offer.headline}
          </span>
        </span>

        <span className="pt-1 text-right font-['Bebas_Neue'] text-xs uppercase tracking-[0.14em] text-white/75">
          {offer.timeline}
        </span>

        <span className="pt-1 text-white/50 transition-colors duration-300 group-hover:text-[#fcdfe4]">
          <Plus
            className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      <div
        id={panelId}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`grid gap-x-10 gap-y-5 pb-6 transition-opacity duration-300 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div>
              <p className="font-['Bebas_Neue'] text-xs uppercase tracking-[0.18em] text-white/80">
                What&apos;s included
              </p>
              <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {offer.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-base leading-snug text-white/70"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#db364e]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-['Bebas_Neue'] text-xs uppercase tracking-[0.18em] text-white/80">
                Who it&apos;s for
              </p>
              <p className="mt-2 text-base leading-snug text-white/75">
                {offer.forWho}
              </p>
              <Link
                to="/contact"
                className="group mt-3 inline-flex min-h-11 items-center gap-2 font-['Bebas_Neue'] text-sm uppercase tracking-[0.16em] text-[#f5b8c4] transition-colors duration-300 hover:text-[#fcdfe4]"
              >
                Start this package
                <ArrowUpRight
                  className="size-4 transition-transform duration-300 group-hover:rotate-45"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const [openOffer, setOpenOffer] = useState(null);

  return (
    <PageShell
      title={ROUTE_META['/services'].title}
      description={ROUTE_META['/services'].description}
    >
      <section className="relative z-10 mx-auto max-w-6xl pt-14 pb-4 sm:pt-28">
        <motion.p
          {...reveal()}
          className="text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          / Services
        </motion.p>

        <motion.h1
          {...reveal(0.05)}
          className="editorial-hero-title mt-4 max-w-5xl text-left text-white"
          style={DELA}
        >
          Websites, products, brands, and ongoing support.
        </motion.h1>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            {...reveal(0.1)}
            className="max-w-2xl text-left text-lg text-white/75"
          >
            Packages for landing pages, websites, e-commerce, brand identity,
            AI automation, and product builds — plus monthly retainers. Scope
            is defined around your functionality, integrations, users, and
            technical requirements.
          </motion.p>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-6xl sm:mt-16">
        <motion.p
          {...reveal()}
          className="text-left font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          {twoDigit(1)} / Capabilities
        </motion.p>

        <motion.h2
          {...reveal(0.05)}
          className="editorial-title mt-4 text-left text-white"
          style={DELA}
        >
          What we do
        </motion.h2>

        <div className="editorial-index-grid mt-4">
          {CORE_SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              {...reveal(stagger(i))}
              className="border-t border-white/10 pt-5 pb-6 text-left"
            >
              <div className="flex items-start gap-4">
                <span className="pt-0.5 font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-[#f5b8c4]">
                  {twoDigit(i + 1)}
                </span>

                <div className="min-w-0">
                  <h3
                    className="text-2xl leading-snug text-white"
                    style={DELA}
                  >
                    {service.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-base leading-snug text-white/75">
                    {service.summary}
                  </p>

                  <p className="mt-2 font-['Bebas_Neue'] text-sm text-white/55">
                    {service.includes.join(' · ')}
                  </p>

                  {service.packageAnchor ? (
                    <a
                      href={`#packages-${service.packageAnchor}`}
                      className="group mt-3 inline-flex min-h-11 items-center gap-2 font-['Bebas_Neue'] text-sm uppercase tracking-[0.16em] text-[#f5b8c4] transition-colors duration-300 hover:text-[#fcdfe4]"
                    >
                      See packages
                      <ArrowDown
                        className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {PACKAGE_GROUPS.map((group, gi) => {
        const copy = group.merged
          ? group
          : (PACKAGE_SECTIONS[group.category] ?? {
              title: group.category,
              tagline: 'Packages scoped for this service.',
              cta: 'Start a project',
              timeline: 'Defined in the proposal',
            });
        const slug = slugify(group.category);

        return (
          <section
            key={group.category}
            id={`packages-${slug}`}
            className="relative z-10 mx-auto mt-12 max-w-6xl scroll-mt-24 sm:mt-16"
          >
            <div className="editorial-split">
              <motion.div {...reveal()} className="text-left">
                <p className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]">
                  {twoDigit(2 + gi)} / {group.category}
                </p>

                <h2
                  className="editorial-title mt-4 text-white"
                  style={DELA}
                >
                  {copy.title}
                </h2>

                <p className="mt-3 max-w-md text-lg leading-snug text-white/75">
                  {copy.tagline}
                </p>

                {copy.timeline ? (
                  <dl className="mt-6 flex max-w-sm items-baseline justify-between gap-4 border-y border-white/10 py-3">
                    <dt className="font-['Bebas_Neue'] text-xs uppercase tracking-[0.18em] text-white/60">
                      Timeline
                    </dt>
                    <dd className="font-['Bebas_Neue'] text-lg text-white">
                      {copy.timeline}
                    </dd>
                  </dl>
                ) : null}

                <Link
                  to="/contact"
                  className="group mt-6 flex w-full max-w-sm items-center justify-between gap-6 rounded-2xl border border-[#db364e]/40 bg-[#db364e]/10 px-6 py-4 transition-colors duration-300 hover:border-[#db364e]/70 hover:bg-[#db364e]/15"
                >
                  <span className="text-left">
                    <span className="block font-['Bebas_Neue'] text-xs uppercase tracking-[0.2em] text-[#fcdfe4]">
                      Start a project
                    </span>
                    <span
                      className="mt-1 block text-2xl text-white"
                      style={DELA}
                    >
                      {copy.cta}
                    </span>
                  </span>

                  <ArrowUpRight
                    className="size-5 shrink-0 text-[#fcdfe4] transition-transform duration-300 group-hover:rotate-45"
                    aria-hidden="true"
                  />
                </Link>
              </motion.div>

              {group.merged ? (
                <div className="editorial-index-grid">
                  {group.items.map((offer, i) => (
                    <motion.div
                      key={offer.title}
                      {...reveal(stagger(i))}
                      className="border-t border-white/10 pt-5 pb-6 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <span className="pt-0.5 font-['Bebas_Neue'] text-sm uppercase tracking-[0.18em] text-[#f5b8c4]">
                          {twoDigit(i + 1)}
                        </span>

                        <div className="min-w-0">
                          <h3
                            className="text-2xl leading-snug text-white"
                            style={DELA}
                          >
                            {offer.title}
                          </h3>
                          <p className="mt-2 max-w-xl text-base leading-snug text-white/75">
                            {offer.headline}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="services-rows border-t border-white/10 text-left">
                  {group.items.map((offer, i) => {
                    const key = offer.title;

                    return (
                      <OfferRow
                        key={key}
                        offer={offer}
                        index={i}
                        prefix={`${slug}-${i}`}
                        isOpen={openOffer === key}
                        onToggle={() =>
                          setOpenOffer((prev) => (prev === key ? null : key))
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section className="relative z-10 mx-auto mt-12 max-w-6xl sm:mt-16">
        <div className="flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div {...reveal()} className="max-w-3xl text-left">
            <p className="font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]">
              / Contact
            </p>
            <h2
              className="editorial-title mt-4 text-white"
              style={DELA}
            >
              Tell us the idea and the deadline We will tell you what is
              possible in a sprint.
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <MotionLink
            {...reveal()}
            to="/contact"
            className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/10 px-6 py-5 text-left transition-colors duration-300 hover:border-[#b02a3d]/70 sm:gap-6"
          >
            <span className="min-w-0">
              <span className="block font-['Bebas_Neue'] text-xs uppercase tracking-[0.2em] text-white/60">
                / Contact
              </span>
              <span
                className="mt-1 block break-words text-xl text-white sm:text-2xl"
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
            className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/10 px-6 py-5 text-left transition-colors duration-300 hover:border-[#b02a3d]/70 sm:gap-6"
          >
            <span className="min-w-0">
              <span className="block font-['Bebas_Neue'] text-xs uppercase tracking-[0.2em] text-white/60">
                / Next
              </span>
              <span
                className="mt-1 block break-words text-xl text-white sm:text-2xl"
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
    </PageShell>
  );
}
