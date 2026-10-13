# ArtVerse

**Where Art Finds Its Universe.**

A global art marketplace for paintings, digital artwork, decorative lighting, handmade objects and
custom creations — built in phases, in the open.

**Status: Phase 1 delivered.** This repository currently contains the project foundation, the design
system, the shared component set, the route architecture and the page shells for every destination.
It is a frontend foundation, not a working marketplace: there is no backend, no database, no
authentication, no payments and no real listings.

---

## Contents

- [What Phase 1 delivers](#what-phase-1-delivers)
- [What Phase 1 deliberately does not include](#what-phase-1-deliberately-does-not-include)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Route architecture](#route-architecture)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [The signature floating-art prototype](#the-signature-floating-art-prototype)
- [Sample data and assets](#sample-data-and-assets)
- [Accessibility](#accessibility)
- [Responsive behaviour](#responsive-behaviour)
- [Verification](#verification)
- [Roadmap](#roadmap)

---

## What Phase 1 delivers

- **A working frontend foundation** — React 19, TypeScript in strict mode, Vite, npm.
- **A light-first, premium design system** — warm white (`#FAF9F6`), near-black text (`#171717`),
  one muted champagne accent (`#C8AD78`), declared once in `src/styles/tokens.css`.
- **Twelve dedicated pages on real routes** — no single giant page simulating multiple destinations
  with sections or tabs.
- **A responsive shared header and footer** — desktop navigation from 1024px, an accessible
  disclosure panel below it, and a footer that lists only destinations that genuinely exist.
- **Reusable foundational components** — button, text link, frames, cards, grids, headings,
  breadcrumb, empty state, loading indicator, phase note, not-found view.
- **A professional design-system preview** at `/design-system` — live specimens, not screenshots.
- **A lightweight floating-art prototype** — pure CSS, no animation library.
- **Honest coming-soon states** — later-phase work is described, never faked.
- **Reduced-motion support** and keyboard-visible focus throughout.

## What Phase 1 deliberately does not include

The complete homepage content, full Explore/catalogue browsing with filters, artwork detail
commerce, artist directory features, seller onboarding, account systems, certificates, checkout,
payouts, databases and AI services all belong to later phases. Where a visitor would expect one of
those features, the page says so plainly rather than simulating it.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| UI | React 19 | Component model, concurrent rendering, `useSyncExternalStore` |
| Language | TypeScript 5.9 (strict) | Type safety across data, routes and components |
| Build | Vite 8 | Fast dev server, small production output, SPA history fallback |
| Routing | react-router-dom 7 | Real URLs, browser history, direct links, refresh support |
| Styling | CSS Modules + custom properties | Scoped styles with tokens centralised in one file |
| Fonts | Fontsource (self-hosted) | Playfair Display + Inter with no third-party requests |
| Linting | ESLint 10 flat config, typescript-eslint, react-hooks | Catches real mistakes, no formatting noise |
| Animation | None | The signature effect is two slow CSS keyframe loops |

Requirements: **Node 22.12+** and npm. No other global tooling is needed.

## Getting started

```bash
npm install        # install dependencies
npm run dev        # development server on http://localhost:5173
npm run build      # type-check, then production build into dist/
npm run preview    # serve the built output on http://localhost:4173
npm run typecheck  # strict TypeScript project build
npm run lint       # ESLint, zero warnings tolerated
npm run verify:routes  # render every route and assert page, heading and a11y basics
npm run validate   # typecheck + lint + build + route verification
```

Deployment is out of scope for Phase 1. When it does happen, the host must rewrite unknown paths to
`index.html` (SPA fallback) so direct URLs and refreshes keep working.

## Route architecture

| Route | Page component | Phase 1 status |
| --- | --- | --- |
| `/` | `HomePage` | Foundation — editorial hero, floating-art prototype, stated scope |
| `/discover` | `DiscoverPage` | Foundation — sample catalogue and category overview |
| `/discover/:collectionId` | `CollectionDetailPage` | Foundation — collection with its works |
| `/artwork/:artworkId` | `ArtworkDetailPage` | Foundation — full metadata, no commerce |
| `/artists` | `ArtistsPage` | Foundation — editorial directory list |
| `/artists/:artistId` | `ArtistProfilePage` | Foundation — placeholder profile and its records |
| `/collections` | `CollectionsPage` | Foundation — collection directory |
| `/sell` | `SellPage` | Foundation — seller intent, no form or account |
| `/about` | `AboutPage` | Complete — what ArtVerse is and what Phase 1 covers |
| `/search` | `SearchPage` | Foundation — URL-driven search over sample records |
| `/design-system` | `DesignSystemPage` | Complete — internal token and component reference |
| `/404`, any unknown path | `NotFoundPage` | Complete — also used for unknown artwork, collection and artist ids |

Paths are declared once in `src/app/routes.ts` and registered in `src/app/AppRoutes.tsx`. Unknown
detail ids (`/artwork/…`, `/discover/…`, `/artists/…`) render the same not-found experience as an
unknown URL, so a stale link is never mistaken for a real page.

## Project structure

```
src/
├── app/          Application shell: route tree, path registry, navigation config, scroll handling
├── components/   Reusable UI, each with a colocated CSS Module
├── data/         Illustrative sample records and design-system documentation
├── hooks/        useDocumentTitle, useReducedMotion
├── layouts/      MainLayout — skip link, header, routed page, footer
├── pages/        One folder per destination, each with its own styles
├── styles/       tokens.css, base.css and the global entry point
├── types/        Shared domain types
└── utils/        Small helpers: cn, aspect ratios, text formatting
public/
├── artworks/     Six project-generated sample images
├── favicon.svg   Brand symbol
└── robots.txt    Crawling stays disabled until launch
scripts/
└── verify-routes.mjs   Route and accessibility render checks
```

## Design system

Tokens live in `src/styles/tokens.css` and are the only place raw values are declared. Component
styles consume variables; a scan of every CSS Module confirms **no hard-coded colours** outside the
token file.

**Colour** — canvas `#FAF9F6`, ink `#171717`, muted ink `#6E6B66`, hairline `#E5E2DC`, champagne
accent `#C8AD78` (with `#8A6F35` for accent text at 4.5:1), charcoal `#1E1D1B` reserved for
occasional contrast sections. The brand's soft neutral grey `#77746F` was nudged to `#6E6B66` for
secondary text so body copy clears an AA contrast ratio; both values are documented on
`/design-system`.

**Typography** — Playfair Display for display, page titles, section headings and artwork titles;
Inter for body copy, controls, labels and metadata. Nine tokens cover hero headline through
caption, and long headlines use `clamp()` so nothing dominates a phone screen.

**Spacing, radii, elevation** — a 4px spacing scale plus two clamped section tokens, six radii,
three soft shadows, and seven motion tokens.

Visit `/design-system` for the live reference: palette, type scale, spacing, radii, buttons, links,
navigation, frames, cards, grids, states, the floating-art prototype with controls, responsive
behaviour and the route table.

## The signature floating-art prototype

The homepage hero pairs editorial copy with a floating composition: one dominant work surrounded by
smaller pieces inside a 1:1 stage.

- **Positioning** — works are placed with percentage insets inside an `overflow: hidden` wrapper, so
  the composition scales with the stage and can never widen the page or overlap the headline and
  buttons.
- **Motion** — each work runs two independent, very slow loops: a 34-second horizontal drift driven
  by `transform`, and a ~29-second vertical float driven by the separate `translate` property. They
  compose instead of cancelling each other, and negative delays stagger every element so the first
  paint already looks settled.
- **Performance** — only `transform` and `translate` animate, with four small images and three orbit
  lines, so cheap Android devices composite rather than repaint.
- **Mobile** — below 768px the composition narrows and drops to three works.
- **Reduced motion** — `prefers-reduced-motion: reduce` stops the drift entirely and parks each work
  in a deliberately composed still arrangement. Hover lifts and transitions collapse too.

## Sample data and assets

`src/data/` holds clearly flagged illustrative records: six sample works across painting, digital
artwork, decorative lighting, handmade objects and a custom piece, five placeholder creators, three
sample collections. Every record carries `sample: true` or `illustrative: true`, and pages label
them as placeholders.

The six images in `public/artworks/` were generated for this project as visual stand-ins so frames,
grids and ratios could be designed and reviewed. They are not real artworks and are intended to be
replaced with genuine studio imagery in a later phase.

No real artists, prices, sales, verified sellers, testimonials or marketplace activity are
represented anywhere in this repository.

## Accessibility

- Semantic landmarks: one `header`, one `main`, one `footer`, one `h1` per page (verified per route).
- A skip link that appears on focus.
- Visible focus rings on every interactive element, via one global `:focus-visible` rule.
- Buttons and header controls are at least 44px tall; text links keep comfortable targets.
- Descriptive `alt` text on every image (verified per route); the decorative floating arrangement is
  announced once through its figure label, and each work keeps its own description.
- Breadcrumbs on nested routes with the current page marked `aria-current="page"`.
- The mobile navigation is a disclosure (`aria-expanded` / `aria-controls`) that closes on
  navigation or `Escape` — it never traps focus.
- `prefers-reduced-motion` is honoured globally and specifically in the floating composition.

## Responsive behaviour

Designed and checked against 360, 390, 430, 768, 1024 and 1440 pixel widths. Grid columns step at
540px (two) and 900px (three); collection grids step at 700px; desktop navigation appears at 1024px;
the content container caps at 1200px so line length stays readable on large screens. No layout uses
`100vw`, and every viewport-relative value sits inside a `clamp()` with a minimum and maximum, so
horizontal overflow is designed out rather than hidden.

## Verification

Executed in this repository:

| Check | Command | Result |
| --- | --- | --- |
| Dependency install | `npm install` | 166 packages, no vulnerabilities reported by npm |
| Type check | `npm run typecheck` | Passes, strict mode, no errors |
| Lint | `npm run lint` | Passes, zero errors and zero warnings |
| Production build | `npm run build` | Passes — `dist/` JS ≈ 342 kB (≈ 106 kB gzip), CSS ≈ 47 kB (≈ 8.9 kB gzip) |
| Dev server | `npm run dev` | Serves on `0.0.0.0:5173`; every route returns HTTP 200 with the app shell |
| Route rendering | `npm run verify:routes` | 19 route cases rendered through Vite's SSR pipeline, all assertions pass |
| Assets | `curl` against the dev server | `/favicon.svg`, `/artworks/*.jpg`, `/robots.txt` all HTTP 200 |
| Secret and local-path scan | grep over tracked files | No credentials, keys, `.env` files or machine paths found |
| Token audit | grep over CSS Modules | No hard-coded colours outside `tokens.css` |

`verify:routes` renders the real route tree for every destination and asserts: the intended page
renders for each path, unknown paths and unknown detail ids reach the not-found experience, each
page has exactly one `h1`, no element ids are duplicated, every image has descriptive `alt` text,
and the shared skip link and footer are present.

**Not executed:** no automated browser session, visual regression suite, Lighthouse run or
cross-browser matrix was available in this environment, so rendering has been verified at the markup
and layout-rule level rather than by screenshot. Treat a manual pass at the six widths above as the
next step before Phase 2 builds on these pages.

## Roadmap

- **Phase 1 — Foundation and design system** _(delivered)_: setup, tokens, components, routes, page
  shells, design-system preview, floating-art prototype.
- **Phase 2**: the complete homepage, real catalogue browsing with filters, sorting and pagination.
- **Phase 3**: editorial collections, curation, studio series.
- **Phase 4**: artwork detail depth — provenance, certificates, availability and purchase flow.
- **Phase 5**: seller accounts, studio profiles, listing tools, orders and payouts.

## Scripts reference

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the built output locally |
| `npm run typecheck` | Strict TypeScript build of both projects |
| `npm run lint` | ESLint over the repository |
| `npm run verify:routes` | Render every route and assert page and accessibility basics |
| `npm run validate` | All of the above, in order |
