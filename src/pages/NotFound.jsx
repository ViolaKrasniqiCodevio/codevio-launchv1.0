import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import PageShell from '../components/PageShell';
import { enter } from '../lib/motion';
import { ROUTE_META } from '../data/seo';

export default function NotFound() {
  useEffect(() => {
    // The 404 shell already ships a robots meta; reuse it rather than adding a
    // second one, and put the original value back when this route unmounts so a
    // client-side navigation away from a soft 404 does not leave "noindex" on
    // the page the visitor lands on.
    const existing = document.querySelector('meta[name="robots"]');
    const addedRobots = !existing;
    const meta = existing ?? document.createElement('meta');
    const previousRobots = existing?.getAttribute('content') ?? null;

    if (addedRobots) {
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');

    // A soft 404 renders inside the shell the visitor arrived on, so the
    // canonical in <head> would still advertise that page.
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.remove();

    return () => {
      if (addedRobots) meta.remove();
      else if (previousRobots !== null) meta.setAttribute('content', previousRobots);

      if (canonical) document.head.appendChild(canonical);
    };
  }, []);

  return (
    <PageShell
      title={ROUTE_META['/404'].title}
      description={ROUTE_META['/404'].description}
      canonical={false}
    >
      <section className="relative z-10 mx-auto max-w-3xl pt-14 text-center sm:pt-28">
        <motion.span
          {...enter()}
          className="block font-['Bebas_Neue'] text-sm uppercase tracking-[0.3em] text-[#f5b8c4]"
        >
          Error 404
        </motion.span>

        <motion.h1
          {...enter(0.05)}
          className="mx-auto mt-6 max-w-2xl text-4xl leading-tight max-sm:mt-3 sm:text-5xl"
          style={{ fontFamily: "'Dela Gothic One', sans-serif" }}
        >
          This page doesn&rsquo;t exist.
        </motion.h1>

        <motion.p
          {...enter(0.08)}
          className="mx-auto mt-6 max-w-xl text-lg text-white/70 max-sm:mt-4"
        >
          The link may be broken or the page may have moved. Head back home and
          pick up where you left off.
        </motion.p>

        <motion.div
          {...enter(0.1)}
          className="mt-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#fcdfe4]/40 px-6 py-3 font-['Bebas_Neue'] text-sm uppercase tracking-[0.16em] text-[#fcdfe4] transition-colors duration-300 hover:border-[#fcdfe4] hover:text-white max-sm:min-h-11"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back home
          </Link>
        </motion.div>
      </section>
    </PageShell>
  );
}
