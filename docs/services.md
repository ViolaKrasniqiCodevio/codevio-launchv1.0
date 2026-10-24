# Codevio — Core Services & Service Packages

> Note: the pricing in this document is historical. The shipped source of truth is `src/data/site.js`.

Working doc for the two ClickUp tasks: **Define core services** and **Define service packages**.

Companion to `agency-strategy.md`. That doc sets mission, market, ICP, and positioning; this one defines *what we sell* (core services) and *how it is packaged* (service packages). Section 6 of the strategy doc summarizes the packages — this file is the source of truth.

Decisions locked in:

- Core services are described by **discipline** (strategy, design, engineering, iteration).
- Packages bundle disciplines into **fixed-scope, fixed-timeline outcomes**.
- Package menu is four: **Landing Page Sprint** (entry), **Website Sprint**, **MVP Sprint**, **Launch Retainer**.
- Prices are permanent list prices, published on the site. List: Landing Page Sprint €500 · Website Sprint €750 · MVP Sprint €1,000 · Launch Retainer €1,500–2,000/mo · scoping deep-dive €750 (credited on booking).
- Category vocabulary: **studio** (not "agency") everywhere.

---

## 1. Core services

Core services are the disciplines we sell. Every package is a bundle drawn from these.

### 1.1 Strategy & brand direction

- **What it is**: positioning, messaging, and the visual system that makes a launch look credible.
- **Included**: brand direction and visual system, logo / typography / color direction, copy support and content shaping, launch messaging.
- **Not included**: ongoing campaign strategy, paid media planning, research reports, print-heavy collateral.
- **Artifacts**: brand mini-guide, logo / type / color files, messaging doc.
- **Delivered by**: senior designer (with founder input at kickoff).
- **Feeds**: Landing Page Sprint (light), Website Sprint, Launch Retainer.

### 1.2 Product & interface design

- **What it is**: the UX and UI work that turns an idea into an interface people can use.
- **Included**: product scoping, user flows, wireframes, UI design and design systems, motion and interaction design, clickable prototypes.
- **Not included**: native app design, illustration-only engagements, presentation/deck design.
- **Artifacts**: Figma file with user flows, wireframes, UI and design system, clickable prototype.
- **Delivered by**: senior designer.
- **Feeds**: Landing Page Sprint (light), Website Sprint, MVP Sprint, Launch Retainer.

### 1.3 Engineering

- **What it is**: production front-end and full-stack build, shipped on a stack the client can keep building on.
- **Included**: React / Next.js front-end, full-stack features (auth, payments, APIs, databases), AI/LLM integrations (chat, RAG, automation), integrations, deploy and handover, documentation, performance pass.
- **Not included**: native mobile apps, standalone infrastructure/DevOps contracts, legacy code rescue as a standalone offer.
- **Stack**: React, Next.js, TypeScript, Tailwind, Node, Supabase / Postgres, Figma. Python when the product calls for it.
- **Artifacts**: production repo, deploy + docs, Loom handover walkthrough.
- **Delivered by**: senior engineer.
- **Feeds**: Website Sprint, MVP Sprint, Launch Retainer.

### 1.4 Post-launch & iteration support

- **What it is**: the post-launch work that keeps momentum after v1 ships.
- **Included**: analytics setup, performance and conversion tuning, new pages and feature iterations, design and engineering on demand.
- **Not included**: paid ads management, SEO content retainers, social media management.
- **Delivered by**: same team that shipped the sprint.
- **Feeds**: Launch Retainer (plus the 30-day support window in the full sprints and the 7-day window in the Landing Page Sprint).

### Retired / not core

Say no to these, or route them to a partner:

- Paid ads and performance marketing
- SEO content retainers and social media management
- Generic "digital marketing" packages
- Native mobile development
- Framer / Webflow-only builds — we ship real code, not no-code sites
- Print-heavy branding engagements
- Maintenance-only contracts and lowest-bidder work

Route declines to partners where possible (ads, SEO, mobile, no-code). Partner referrals earn a 10% referral fee.

---

## 2. Service packages

Four packages, all fixed scope and fixed timeline. Rules that apply to every package:

- **Scope locks at kickoff.** Deliverables, timeline, and ship date are agreed before we start.
- **Anything outside scope becomes the next sprint** — never an open-ended edit.
- **Two revision rounds per phase**, with feedback consolidated within two business days.
- **30 days of post-launch support** included in both full sprints (7 days in the Landing Page Sprint).
- **Prices are published on the site**; every engagement still gets a written quote via `/contact` confirming scope.
- **Payment terms**: Landing Page Sprint 100% upfront · Website and MVP sprints 50% at kickoff, 50% at ship · retainer monthly upfront.
- **Client lateness rule**: if inputs or feedback arrive later than the agreed window, the ship date shifts day-for-day.
- **Booking policy**: a deposit secures the sprint slot; we run a maximum of 1–2 sprints concurrently, first booked, first served.
- **Proof rights**: every package includes permission to publish the work and a testimonial request.
- **Ship-date guarantee**: if we miss the agreed ship date for reasons within our control, the client gets 10% back or a free retainer week.
- We only book work we can ship inside the package timeline. No exceptions.
- **Entry-offer credit**: the Landing Page Sprint fee (€500) is credited toward a Website Sprint or MVP Sprint booked within 30 days.
- **Scoping deep-dive**: complex MVPs can start with a paid deep-dive (€750), credited toward the sprint if booked within 30 days.

### 2.1 Landing Page Sprint (entry offer)

| | |
|---|---|
| **Promise** | Idea → live landing page in 1 week. |
| **Trigger** | Validating an idea, testing messaging, a campaign or waitlist deadline. |
| **Fit** | Founders who want to see how we work before committing to a full sprint. |
| **Fixed scope** | One high-converting landing page · copy shaping and messaging · responsive build and analytics · deploy and launch checklist · 7 days post-launch support. |
| **Client inputs** | One decision-maker on the kickoff call · copy and asset direction within 1 business day · domain and hosting access · one consolidated feedback round. |
| **Excludes** | Multi-page sites · brand identity from scratch · paid media and ongoing content. |
| **Add-ons** | Extra page · blog / CMS setup · advanced motion pass. |
| **Next step** | Website Sprint or MVP Sprint. |
| **Price** | €500 (published on the site). |

### 2.2 Website Sprint

| | |
|---|---|
| **Promise** | Idea → live website in 2–3 weeks. |
| **Trigger** | Launching a product, a rebrand, or a first real website; demo day or conference deadline. |
| **Fit** | Founders who need to look credible on a fixed date. |
| **Fixed scope** | Brand direction and visual system · 5–7 page responsive site · copy support and content shaping · analytics and launch checklist · 30 days post-launch support. |
| **Client inputs** | One decision-maker on the kickoff call · copy and assets direction within 2 business days · domain and hosting access · one consolidated feedback pass per round. |
| **Excludes** | Logo-only or print-only projects · paid media and ongoing content · full e-commerce builds · multilingual sites (add-on). |
| **Add-ons** | Extra pages · blog / CMS setup · advanced motion pass · additional language. |
| **Next step** | Launch Retainer. |
| **Price** | €750 (published on the site). |

### 2.3 MVP Sprint

| | |
|---|---|
| **Promise** | Idea → working product in 4–6 weeks. |
| **Trigger** | Pre-seed / seed round, upcoming demo day, pilot with design partners. |
| **Fit** | Teams that need working software before the next round. |
| **Fixed scope** | Product scoping and user flows · auth, payments, and the core feature set · admin or dashboard view · deploy, handover, and documentation · 30 days post-launch support. |
| **Client inputs** | Decision-maker available weekly · one core flow prioritized at kickoff · access to existing brand assets · feedback within 2 business days. |
| **Excludes** | Native mobile apps · unlimited feature lists (scope locks at kickoff) · integrations beyond the agreed set. |
| **Add-ons** | Additional user roles · extra integrations · landing pages · analytics dashboard. |
| **Next step** | Launch Retainer. |
| **Price** | €1,000 (published on the site). |

### 2.4 Launch Retainer

| | |
|---|---|
| **Promise** | Keep shipping after launch. |
| **Trigger** | Launched and needs continuous iteration without hiring. |
| **Fit** | Teams that launched with us, or post-launch teams with an existing product. |
| **Monthly scope** | 20 hours per month of senior design + engineering capacity · new pages and product iterations · performance and conversion tuning · design and engineering on demand · priority turnaround, same team. |
| **Client inputs** | A prioritized backlog · one point of contact for requests · timely feedback on shipped increments. |
| **Term** | 3-month minimum, then month-to-month with 30 days notice. Capacity does not roll over between months. |
| **Excludes** | Paid media management · work beyond the agreed monthly capacity · staffing or body-shop arrangements. |
| **Add-ons** | Extra capacity block · dedicated sprint for a new initiative. |
| **Next step** | Renew monthly, or return to a sprint for a defined initiative. |
| **Price** | €1,500–2,000 per month (published on the site). |

---

## 3. Core services × packages

| Discipline | Landing Page Sprint | Website Sprint | MVP Sprint | Launch Retainer |
|---|---|---|---|---|
| Strategy & brand direction | light | ✓ | light | ✓ |
| Product & interface design | light | ✓ | ✓ | ✓ |
| Engineering | ✓ | ✓ | ✓ | ✓ |
| Launch & iteration support | 7-day window | 30-day window | 30-day window | ✓ |

---

## 4. Qualification

Book a call when all of these are true (from the ICP checklist in `agency-strategy.md`):

- [ ] Budget in sprint range
- [ ] Decision-maker on the call
- [ ] A real launch date or trigger event
- [ ] Scope describable in one sentence
- [ ] Values speed over endless polish loops

Otherwise decline politely and, where possible, refer.

---

## 5. Open items

- Add-on pricing: quote per request until further notice.
- Retainer capacity: set at 20 h/month for now; confirm after the first two retainers.
