export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://codevio.net';

export const SITE = {
  name: 'Codevio',
  url: SITE_URL,
  tagline: 'From idea to launch, in weeks.',
  bottomLine: 'Small launch studio',
  email: 'info.codevio@gmail.com',
  responseTime: 'We reply within one business day.',
};

// The Formspree form ID is a public endpoint identifier, not a secret — it is
// already visible in the markup of the no-JS form fallback. Never put a
// Formspree API key, SMTP credential, or other secret in a VITE_* variable:
// those are inlined into the public client bundle.
export const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'xyeznlrj';

export const CONTACT_FORM = {
  provider: 'formspree',
  endpoint: `https://formspree.io/f/${FORMSPREE_FORM_ID}`,
  fallbackAction: `https://formspree.io/f/${FORMSPREE_FORM_ID}`,
};

export const PAGE_THEME = {
  backgroundColor: '#0a0a0f',
  gradientColors: ['#0a0a0f', '#db364e', '#7b2233'],
  menuColors: ['#fcdfe4', '#f5b8c4'],
  menuButtonColor: '#fcdfe4',
  openMenuButtonColor: '#1c1210',
  menuTextColor: '#1c1210',
  menuHoverColor: '#db364e',
  accentColor: '#db364e',
};

export const SOCIAL_ITEMS = [
  { label: 'Instagram', link: 'https://www.instagram.com/codev.io/' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/company/codevio00/' },
  { label: 'X', link: 'https://x.com/codevio_agency' },
];

export const NAV_ITEMS = [
  { label: 'Home', link: '/' },
  { label: 'Services', link: '/services' },
  { label: 'About', link: '/about' },
  { label: 'Contact', link: '/contact' },
];

export const MISSION = {
  eyebrow: 'Our Mission',
  statement: 'We turn ideas into brands, products, and experiences that are ready for the real world.',
  body: 'Codevio is a small launch studio. Two senior designers and engineers. One fixed sprint plan per client. We take ideas from blank page to paying customers — brand, website, product, and the AI and growth work that keeps them moving.',
  commitments: [
    'Clear scope. You know exactly what we’re building before we start.',
    'Focused execution. Small teams, direct communication, and fewer unnecessary handoffs.',
    'Design + technology. Branding, design, development, and AI working together.',
    'Built to last. We don’t just make things look good — we build them to work.',
    'Straightforward pricing. Clear project costs and no surprise invoices.',
  ],
};

export const STATS = [
  { value: '3–4', label: 'week launch sprints' },
  { value: '2', label: 'senior makers' },
  { value: '+30', label: 'days post-launch support' },
];

export const VALUES = [
  {
    title: 'Speed without cutting corners',
    body: 'Good work doesn’t need to take months. We use focused sprints, clear decisions, and a defined scope to move projects from idea to launch quickly.',
  },
  {
    title: 'Design that has a purpose',
    body: 'Great design isn’t decoration. Every interface, identity, interaction, and visual decision should make the product clearer and the brand stronger.',
  },
  {
    title: 'Technology that works for you',
    body: 'From websites to SaaS platforms and AI agents, we choose the right technology for the problem — not technology for the sake of technology.',
  },
  {
    title: 'One team, end to end',
    body: 'Strategy, branding, design, development, and AI stay connected throughout the project. No endless handoffs between different teams.',
  },
  {
    title: 'Built for the next stage',
    body: 'We don’t just think about launch day. We build foundations that can evolve as your business, customers, and ideas grow.',
  },
];

export const CORE_SERVICES = [
  {
    title: 'Website Design and Development',
    summary:
      'Custom-designed, responsive websites built to communicate clearly and convert — from a one-page launch site to a premium multi-page build.',
    includes: ['UX and UI design', 'CMS and forms', 'SEO basics', 'Analytics and deploy'],
    packageAnchor: 'websites',
  },
  {
    title: 'Shopify and E-commerce Development',
    summary:
      'Online stores that sell: catalog, product pages, cart and checkout, payments, and shipping — set up and handed over clean.',
    includes: ['Product catalog', 'Cart and checkout', 'Payments and shipping', 'Admin training'],
    packageAnchor: 'websites',
  },
  {
    title: 'SaaS and Web Application Development',
    summary:
      'Production-grade web applications on a stack you can keep building on — auth, payments, APIs, and databases included.',
    includes: ['Scoping and user flows', 'Auth, payments, APIs', 'Database and admin', 'Deploy and documentation'],
    packageAnchor: 'ai-product-custom',
  },
  {
    title: 'AI Solutions and Automation',
    summary:
      'Focused AI agents and connected workflows that plug into the tools your team already uses — with guardrails and a clean handover.',
    includes: ['AI assistants and FAQ bots', 'Lead qualification', 'Workflow automation', 'Dashboards and training'],
    packageAnchor: 'ai-product-custom',
  },
  {
    title: 'UI/UX Design',
    summary:
      'The interface work that turns an idea into something people can use — user flows, wireframes, design systems, and interaction design.',
    includes: ['Product scoping', 'Wireframes and flows', 'Design systems', 'Motion and interaction'],
    packageAnchor: 'ai-product-custom',
  },
  {
    title: 'Branding and Digital Experiences',
    summary:
      'Positioning, identity, and the visual system that makes a launch look credible — logo, palette, type, and social-ready assets.',
    includes: ['Logo and identity', 'Color and typography', 'Usage guidelines', 'Social avatar set'],
    packageAnchor: 'launch',
  },
];

// Home "growth" chart: launch momentum over the first three months, comparing
// shipping in fixed sprints with going it alone. The values are an illustrative
// model (percentage of launch momentum, not revenue) and the footnote says so.
export const GROWTH_CHART = {
  eyebrow: 'Why fixed sprints',
  heading: 'Momentum compounds when things ship',
  body: 'Each sprint leaves something live — a brand, a website, a working product — so every month starts from higher ground. Without ship dates on the calendar, the same work tends to drift.',
  withLabel: 'With Codevio',
  withoutLabel: 'Going it alone',
  // [week, value] pairs; the with-us line peaks at each ship date and dips
  // briefly while the next sprint is in flight, ending on the launch peak.
  withLine: [
    [0, 10], [2, 30], [2.8, 26], [5, 50], [5.8, 45],
    [9, 70], [9.8, 64], [12, 86], [12.6, 83], [13, 95],
  ],
  // The same twelve weeks solo: progress happens, but in fits and stalls.
  soloLine: [
    [0, 8], [2, 12], [3.5, 10], [6, 16], [7.5, 14], [10, 20], [13, 24],
  ],
  milestones: [
    { week: 2, value: 30, label: '+2 wks' },
    { week: 5, value: 50, label: '+5 wks' },
    { week: 9, value: 70, label: '+9 wks' },
    { week: 12, value: 86, label: '+12 wks' },
  ],
};

export const OFFERS = [
  {
    category: 'Launch',
    title: 'Starter — Landing',
    headline: 'A focused one-page website for your launch.',
    description: 'One custom, responsive landing page built to communicate your offer clearly — with analytics, deployment, and 30 days of post-launch support.',
    timeline: '1–2 weeks',
    deliverables: [
      '1 page, custom design',
      'Responsive build',
      'Contact/CTA sections',
      'Analytics',
      'Deploy',
      '30-day support',
    ],
    forWho: 'For launches, campaigns, and early-stage ideas.',
  },
  {
    category: 'Launch',
    title: 'Starter — Brand',
    headline: 'The essential identity to launch consistently.',
    description: 'A compact brand starter with the logo, palette, and type foundations your launch needs to show up consistently everywhere.',
    timeline: '1–2 weeks',
    deliverables: [
      'Logo system',
      'Color palette',
      'Typography',
      'Basic usage guide',
      'Social avatar set',
    ],
    forWho: 'For new businesses and early-stage launches.',
  },
  {
    category: 'Launch',
    title: 'Launch Lite',
    headline: 'Brand and landing page in one coherent launch.',
    description: 'Starter Brand + Starter Landing with one shared direction — a single, coherent launch instead of two disconnected pieces.',
    timeline: '2–3 weeks',
    deliverables: [
      'Starter — Brand',
      'Starter — Landing',
      'Shared creative direction',
      'One coherent launch',
    ],
    forWho: 'For first launches that need both brand and page.',
  },
  {
    category: 'Launch',
    title: 'Launch Pro',
    headline: 'Website, brand identity, and 3 months of care.',
    description: 'Standard Website + Complete Brand Identity + 3 months of Website Care — the full credible presence in one bundle.',
    badge: 'Most popular',
    timeline: '3–5 weeks',
    deliverables: [
      'Standard — Website',
      'Complete brand identity',
      '3 months Website Care',
      'One team end to end',
    ],
    forWho: 'For businesses that need the complete package.',
  },
  {
    category: 'Websites',
    title: 'Standard — Website',
    headline: 'A complete website for a growing business.',
    description: 'A custom multi-page website with CMS, forms, and the SEO basics needed to make your business credible online.',
    timeline: '2–3 weeks',
    deliverables: [
      '5–7 pages',
      'Custom UI/UX',
      'CMS',
      'Forms',
      'Analytics',
      'SEO basics',
      'Deploy',
    ],
    forWho: 'For service businesses and growing teams.',
  },
  {
    category: 'Websites',
    title: 'Premium — Website',
    headline: 'A high-end website with deeper functionality and polish.',
    description: 'A premium web experience for brands that need advanced interaction, integrations, and accessibility built in.',
    timeline: '3–5 weeks',
    deliverables: [
      '8–15 pages',
      'Advanced interactions',
      'CMS',
      'Integrations',
      'Performance + WCAG 2.2 baseline',
    ],
    forWho: 'For ambitious brands and complex marketing sites.',
  },
  {
    category: 'Websites',
    title: 'E-commerce',
    headline: 'A complete online store built for selling.',
    description: 'A responsive commerce build with the catalog, checkout, payments, and shipping your store needs to run.',
    timeline: '3–5 weeks',
    deliverables: [
      'Product catalog',
      'Product pages',
      'Cart + checkout',
      'Payments',
      'Shipping',
      'Admin training',
    ],
    forWho: 'For product businesses ready to sell online.',
  },
  {
    category: 'AI',
    title: 'AI Sprint',
    headline: 'One focused agent, shipped and tuned.',
    description: 'A single-purpose agent — assistant, FAQ, or lead qualification — integrated with guardrails and a clean handover.',
    timeline: '1–3 weeks',
    deliverables: [
      'One focused agent (assistant / FAQ / lead qualification)',
      'Integration',
      'Guardrails',
      'Handover',
      '30-day tuning',
    ],
    forWho: 'For teams starting with a focused AI use case.',
  },
  {
    category: 'AI',
    title: 'AI Automation',
    headline: 'Connected workflows that move work forward automatically.',
    description: 'AI automation connected to the tools, data, and workflows your team already uses.',
    timeline: '3–5 weeks',
    deliverables: [
      '2–4 connected workflows',
      'CRM / email / calendar integrations',
      'Dashboards',
      'Team training',
    ],
    forWho: 'For teams ready to automate multi-step processes.',
  },
  {
    category: 'Product',
    title: 'MVP Sprint',
    headline: 'From idea to a working product.',
    description: 'Scoping, core user flows, and a production build your first users can actually use — documented, deployed, and supported for 30 days.',
    timeline: '4–8 weeks',
    deliverables: [
      'Scoping + core UX flows',
      'Auth',
      'Database',
      'Payments',
      'Admin',
      'Deploy + docs',
      '30-day support',
    ],
    forWho: 'For founders building their first real product.',
  },
  {
    category: 'Custom',
    title: 'Custom / Enterprise',
    headline: 'Defined in a statement of work.',
    description: 'Engagement for complex or undefined scope, agreed in a statement of work.',
    timeline: 'Agreed per SOW',
    deliverables: [
      'Scope defined in the SOW',
      'Complex or undefined work',
      'Monthly or milestone cadence',
    ],
    forWho: 'For enterprise or open-ended engagements.',
  },
  {
    category: 'Monthly Retainers',
    title: 'Care',
    headline: 'Reliable maintenance for a healthy website.',
    description: 'Updates, monitoring, backups, and technical support, three hours a month.',
    timeline: 'Monthly · 3-month minimum',
    deliverables: [
      '3 hours / month',
      'Updates',
      'Monitoring',
      'Backups',
      'Minor changes',
      'Technical support',
    ],
    forWho: 'For businesses that need their website maintained.',
  },
  {
    category: 'Monthly Retainers',
    title: 'AI Care',
    headline: 'Keep your AI agents sharp.',
    description: 'Monthly tuning, guardrail updates, and monitoring for the AI agents we ship with you.',
    timeline: 'Monthly · 3-month minimum',
    deliverables: [
      '3–5 hours / month',
      'Agent tuning',
      'Guardrail updates',
      'Monitoring + support',
    ],
    forWho: 'For teams running a Codevio AI agent.',
  },
  {
    category: 'Monthly Retainers',
    title: 'Growth',
    headline: 'Content and performance support that compounds.',
    description: 'Content updates, minor design changes, and performance work for teams improving their website over time.',
    timeline: 'Monthly · 3-month minimum',
    deliverables: [
      '6 hours / month',
      'Content updates',
      'Minor design changes',
      'Analytics',
      'Performance monitoring',
      'Priority support',
    ],
    forWho: 'For businesses actively improving their digital presence.',
  },
  {
    category: 'Monthly Retainers',
    title: 'Development Partner',
    headline: 'Ongoing senior support across product and technology.',
    description: 'Development, design, and AI work on tap every month — your senior team on call without hiring one.',
    timeline: 'Monthly · 3-month minimum',
    deliverables: [
      '10 hours / month',
      'Development + design',
      'SaaS improvements',
      'AI automation',
      'Technical support',
    ],
    forWho: 'For teams that need ongoing technical momentum.',
  },
];

