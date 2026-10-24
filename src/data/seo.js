// Single source of truth for route metadata.
// Titles are the FINAL document titles (including the "— Codevio" suffix the
// useDocumentTitle hook would add). Consumed by the page components and by
// scripts/generate-pages.mjs (postbuild). Keep this file dependency-free so
// Node can import it directly.

export const ROUTE_META = {
  '/': {
    title: 'Codevio',
    description:
      'Codevio is a small launch studio. Two to three senior designers and engineers ship brand, website, and product in fixed sprints — from blank page to paying customers.',
  },
  '/services': {
    title: 'Services — Codevio',
    description:
      'Services and packages for landing pages, websites, e-commerce, brand identity, AI automation, product MVPs, and monthly retainers.',
  },
  '/about': {
    title: 'About — Codevio',
    description:
      'Codevio is a small launch studio — two to three senior designers and engineers shipping brand, website, product, AI, and growth work in fixed sprints.',
  },
  '/contact': {
    title: 'Contact — Codevio',
    description:
      'Tell Codevio about your idea and deadline. We reply within one business day.',
  },
  '/404': {
    title: 'Page not found — Codevio',
    description:
      'The page you are looking for does not exist. Head back to the Codevio home page.',
  },
};
