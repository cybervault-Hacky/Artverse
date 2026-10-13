# ArtVerse

**Where Art Finds Its Universe.**

A global art marketplace for paintings, digital artwork, decorative lighting, handmade objects and
custom creations — built in phases, in the open.

**Status: Phase 3 delivered.** The repository contains the project foundation, the design system,
the shared component set, the route architecture, the complete editorial homepage with its
signature floating-art hero, and the immersive Explore Art discovery catalogue. It is still a
frontend build: there is no backend, no database, no authentication, no payments and no real
listings.

---

## Contents

- [What has been built](#what-has-been-built)
- [What is deliberately not included](#what-is-deliberately-not-included)
- [Stack](#stack)
- [Getting started](#getting-started)
- [The homepage](#the-homepage)
- [The discovery catalogue](#the-discovery-catalogue)
- [Route architecture](#route-architecture)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [The floating-art composition](#the-floating-art-composition)
- [Sample data and assets](#sample-data-and-assets)
- [Accessibility](#accessibility)
- [Responsive behaviour](#responsive-behaviour)
- [Verification](#verification)
- [Roadmap](#roadmap)

---

## What has been built

**Phase 1 — foundation and design system**

- React 19, TypeScript in strict mode, Vite, npm — no UI or animation libraries.
- A light-first design system: warm white (`#FAF9F6`), near-black text (`#171717`), one muted
  champagne accent (`#C8AD78`), all declared in `src/styles/tokens.css`.
- Twelve dedicated pages on real routes, with a responsive shared header and footer.
- Reusable components: button, text link, frames, cards, grids, headings, breadcrumb, empty state,
  loading indicator, phase note, not-found view, skip link.
- A live design-system reference at `/design-system`.
- Honest coming-soon states, keyboard-visible focus and reduced-motion support throughout.

**Phase 2 — premium homepage and floating-art experience**

- A five-section editorial homepage: hero, Five Creative Disciplines, artwork spotlight, Four
  Artistic Worlds, artist invitation band.
- The signature floating-art hero, rebuilt with per-work drift distance, duration and delay, a warm
  wash behind the dominant work, and a simplified three-work arrangement on phones.
- Homepage curation held in `src/data/homepage.ts`, so page components stay presentational.
- Four redesigned sample collections matching the homepage's artistic worlds.
- An `inverse` button variant for the charcoal contrast band, documented on `/design-system`.
- Phase numbering across the site brought back in line with what has actually shipped.

**Phase 3 — art universe and immersive discovery**

- `/discover` rebuilt as a three-part discovery catalogue: a discipline index, every sample record
  in one balanced grid, and the collection groupings.
- A new `DisciplineNav` component: an accessible navigation row for the five disciplines that gives
  each one a real, working destination instead of implying a filter that does not exist yet.
- The whole catalogue (all six records) in one pass, cropped to a single 4:5 frame so rows align,
  with the first row loading eagerly and the rest lazily.
- Collection pages gained a clear route back to the catalogue, and both catalogue surfaces gained
  honest empty states.
- Phase references realigned across the site so nothing misstates the plan: filtering and indexed
  search are Phase 4, not Phase 3.

## What is deliberately not included

Catalogue browsing with filters, sorting and pagination; indexed search; editorial curation tools;
artwork commerce (prices, availability, certificates, purchase); seller accounts, verification,
listing tools, orders and payouts. There is no backend, database, authentication, payment or AI
service anywhere in this repository, and no page simulates one.

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
| Animation | None | The signature effect is two slow CSS keyframe loops per work |

Requirements: **Node 22.12+** and npm. No other global tooling is needed.

## Getting started

```bash
npm install        # install dependencies
npm run dev        # development server on http://localhost:5173
npm run build      # type-check, then production build into dist/
npm run preview    # serve the built output on http://localhost:4173
npm run typecheck  # strict TypeScript project build
npm run lint       # ESLint, zero warnings tolerated
npm run verify:routes  # render every route and assert page, link and a11y basics
npm run validate   # typecheck + lint + build + route verification
```

Deployment is out of scope. When it happens, the host must rewrite unknown paths to `index.html`
(SPA fallback) so direct URLs and refreshes keep working.

## The homepage

Five sections, in this order, each its own component in `src/pages/HomePage/sections/`:

1. **Hero** — the eyebrow `Independent art · Worldwide`, the headline *Where Art Finds Its
   Universe.*, the supporting paragraph, and two real calls to action: **Explore Art** (`/discover`)
   and **Browse Artists** (`/artists`). Beside it, the floating-art composition.
2. **Five Creative Disciplines** — Fine Paintings, Digital Artwork, Decorative Lamps, Handmade
   Products and Custom Creations, each with a sample cover image and one sentence. Every item links
   to `/discover`: category filtering does not exist yet, so no filtered URL is implied. Five
   balanced columns on wide screens, three on tablets, two on large phones, and a compact
   image-and-text row on phones.
3. **Artwork spotlight** — one real sample record (*Ochre Field*) shown large, with its category,
   creator and creator location, description, medium, dimensions and year, an understated **View
   Artwork** action to its detail route, and a plain note that no price, availability or provenance
   is attached to it.
4. **Four Artistic Worlds** — Quiet Landscapes, Objects for Living, Contemporary Colour and Art for
   Thoughtful Spaces, each linking to its own collection route, presented two-up so the rows stay
   calm.
5. **Artist invitation** — a charcoal band with the headline *Share Your Creative Vision.*, one
   paragraph of intent, a **Become a Seller** action to `/sell`, and a line stating that seller
   accounts arrive in a later phase. One cropped work supplies material texture on wide screens.

Curation lives in `src/data/homepage.ts`: the hero slot order, the spotlight record, the four
collection ids and the invitation texture. Ids resolve through `getArtworksByIds` /
`getCollectionsByIds`, which skip anything unknown, so a missing record removes a slot instead of
rendering a broken image.

## The discovery catalogue

`/discover` is the art universe: what can be explored, then the works, then the groupings.

1. **Introduction** — one `h1` (*Explore Art*), a two-sentence editorial introduction naming all five
   disciplines and disclosing that every record is an illustrative placeholder. It stays short so the
   first artwork appears quickly on a phone.
2. **Explore by discipline** — a navigation row for the five disciplines. Phones get a snap-scrolling
   strip so the catalogue stays close; from 768px the same five items align into one row. Each entry
   opens a real, working destination and names the work it opens.
3. **The catalogue** — every valid record in the data layer, not a curated subset: one column on
   phones, two on tablets, three from 900px, all cropped to a consistent 4:5 frame. A quiet note
   underneath explains the crop and links to the studio directory.
4. **Collections to start from** — the same four collections the homepage introduces, each linking to
   its own collection page, with a link on to the full collections directory.
5. **Honest closure** — a note stating why there are no filter or sort controls yet, and what arrives
   with them.

### The routing decision behind the discipline row

ArtVerse has no per-discipline route, and the catalogue cannot be filtered by discipline until Phase
4. Rather than send all five disciplines to the same placeholder, or invent a query parameter that
silently does nothing, each discipline links to the artwork page of the work that represents it — and
the link is labelled with that work's title, so the destination is never a surprise:

| Discipline | Opens |
| --- | --- |
| Fine Paintings | *Layered Light, Study I* |
| Digital Artwork | *Arc of Quiet Light* |
| Decorative Lamps | *Sandstone Table Lamp* |
| Handmade Products | *Speckled Stoneware Vessel* |
| Custom Creations | *Carved Oak Relief Panel* |

The section says plainly that filtering arrives with the later phase, so nothing here implies a
filter that does not exist. Full functional filtering is Phase 4.

### Collection pages

`/discover/:collectionId` renders the collection's editorial description, the works it holds in the
same consistent crop, and two clear routes onward — **Back to Explore Art** and **All collections**.
An unknown id renders the shared not-found experience with the requested id shown back to the
visitor, so a stale link is never mistaken for a real page.

## Route architecture

| Route | Page component | Status |
| --- | --- | --- |
| `/` | `HomePage` | Complete (Phase 2) — five editorial sections and the floating-art hero |
| `/discover` | `DiscoverPage` | Complete (Phase 3) — discipline index, full catalogue, collections |
| `/discover/:collectionId` | `CollectionDetailPage` | Complete (Phase 3) — collection, its works, route back |
| `/artwork/:artworkId` | `ArtworkDetailPage` | Foundation — full metadata, no commerce |
| `/artists` | `ArtistsPage` | Foundation — editorial directory list |
| `/artists/:artistId` | `ArtistProfilePage` | Foundation — placeholder profile and its records |
| `/collections` | `CollectionsPage` | Foundation — collection directory |
| `/sell` | `SellPage` | Foundation — seller intent, no form or account |
| `/about` | `AboutPage` | Complete — what ArtVerse is and what has shipped |
| `/search` | `SearchPage` | Foundation — URL-driven search over sample records |
| `/design-system` | `DesignSystemPage` | Complete — internal token and component reference |
| `/404`, any unknown path | `NotFoundPage` | Complete — also used for unknown artwork, collection and artist ids |

Paths are declared once in `src/app/routes.ts` and registered in `src/app/AppRoutes.tsx`. Unknown
detail ids render the same not-found experience as an unknown URL, so a stale link is never mistaken
for a real page.

## Project structure

```
src/
├── app/          Application shell: route tree, path registry, navigation config, scroll handling
├── components/   Reusable UI, each with a colocated CSS Module (incl. DisciplineNav)
├── data/         Illustrative sample records, homepage curation, design-system documentation
├── hooks/        useDocumentTitle, useReducedMotion
├── layouts/      MainLayout — skip link, header, routed page, footer
├── pages/        One folder per destination; the homepage is split into five section files
├── styles/       tokens.css, base.css and the global entry point
├── types/        Shared domain types
└── utils/        Small helpers: cn, aspect ratios, text formatting
public/
├── artworks/     Six project-generated sample images
├── favicon.svg   Brand symbol
└── robots.txt    Crawling stays disabled until launch
scripts/
└── verify-routes.mjs   Route, link and accessibility render checks
```

## Design system

Tokens live in `src/styles/tokens.css` and are the only place raw values are declared. Component
styles consume variables; a scan of every CSS Module confirms **no hard-coded colours** outside the
token file.

**Colour** — canvas `#FAF9F6`, ink `#171717`, muted ink `#6E6B66`, hairline `#E5E2DC`, champagne
accent `#C8AD78` (with `#8A6F35` for accent text at 4.5:1), charcoal `#1E1D1B` used for exactly one
homepage band. The brand's soft neutral grey `#77746F` was nudged to `#6E6B66` for secondary text so
body copy clears an AA contrast ratio; both values are documented on `/design-system`.

**Typography** — Playfair Display for display, page titles, section headings and artwork titles;
Inter for body copy, controls, labels and metadata. Nine tokens cover hero headline through caption,
and long headlines use `clamp()` so nothing dominates a phone screen.

**Spacing, radii, elevation** — a 4px spacing scale plus two clamped section tokens, six radii,
three soft shadows, and seven motion tokens.

Visit `/design-system` for the live reference: palette, type scale, spacing, radii, buttons (all four
variants), links, navigation, frames, cards, grids, states, the floating-art prototype with controls,
responsive behaviour and the route table.

## The floating-art composition

`src/components/FloatingArtwork/` renders the homepage's signature visual: one dominant painting,
a smaller artwork floating higher, a sculptural vessel low and to the left, and a lamp holding the
right edge.

- **Positioning** — a fixed 1:1 stage with every work placed by percentage insets inside an
  `overflow: hidden` wrapper. The stage can never widen the page, and insets are chosen to stay clear
  of the drift distances, so no work is ever clipped at an edge.
- **Motion** — two independent loops per work: a left-to-right drift on `transform`, and a vertical
  float on the separate `translate` property. Because the browser composes them independently,
  neither cancels the other. Distances (0.9%–1.9%), durations (30s–46s horizontal, 26s–39s vertical)
  and delays all differ per slot, and every loop uses `alternate` with `ease-in-out`, so each work
  decelerates into its turnaround instead of stopping dead. Negative delays mean the first paint
  already looks settled.
- **Depth** — a soft shelf shadow per work, three delicate orbit lines, a single champagne dot and a
  barely-there warm wash behind the dominant piece.
- **Weight** — only `transform`, `translate` and `opacity` animate. Four images, three orbit lines,
  no canvas and no JavaScript per frame, so mid-range Android devices composite rather than repaint.
- **Phones** — the arrangement drops to three works with shorter travel and a narrower stage.
- **Reduced motion** — every animation stops, leaving the same arrangement perfectly still. Hover
  lifts and transitions collapse too.

## Sample data and assets

`src/data/` holds clearly flagged illustrative records: six sample works across all five
disciplines, five placeholder creators (with placeholder locations), and four sample collections.
Every record carries `sample: true` or `illustrative: true`, and pages label them as placeholders.

The six images in `public/artworks/` were generated for this project as visual stand-ins so frames,
grids, crops and ratios could be designed and reviewed. They are single-resolution files (752 kB in
total, all reused across sections and cached after first load) and are intended to be replaced with
genuine studio photography — and multiple resolutions — in a later phase.

No real artists, prices, sales, verified sellers, testimonials or marketplace activity are
represented anywhere in this repository.

## Accessibility

- Semantic landmarks: one `header`, one `main`, one `footer`, one `h1` per page; heading levels never
  skip a step (verified per route).
- A skip link that appears on focus.
- Visible focus rings on every interactive element, via one global `:focus-visible` rule.
- Buttons and header controls are at least 44px tall; the hero CTAs are 52px.
- Descriptive `alt` text on every image, plus intrinsic `width` and `height` on every image so
  nothing shifts while it loads (both verified per route).
- Breadcrumbs on nested routes with the current page marked `aria-current="page"`.
- The mobile navigation is a disclosure (`aria-expanded` / `aria-controls`) that closes on navigation
  or `Escape` — it never traps focus.
- The floating composition is decorative: announced once through its figure label, with each work
  keeping its own alternative text, and removed from the tab order.
- Card links carry a visually hidden action suffix, so a link's purpose is clear when read aloud.
- `prefers-reduced-motion` is honoured globally and specifically in the floating composition.

## Responsive behaviour

Designed and checked against 360, 390, 430, 768, 1024 and 1440 pixel widths. Grid columns step at
540px (artwork), 640px (disciplines), 700px (collections), 900px and 1140px (disciplines, five up);
desktop navigation appears at 1024px; the content container caps at 1200px so line length stays
readable on large screens. No layout uses `100vw`, every viewport-relative value sits inside a
`clamp()` with a minimum and maximum, and no element sets a fixed width wider than a 360px viewport.

## Verification

Executed in this repository:

| Check | Command | Result |
| --- | --- | --- |
| Dependency install | `npm install` | 166 packages, no vulnerabilities reported by npm |
| Type check | `npm run typecheck` | Passes, strict mode, no errors |
| Lint | `npm run lint` | Passes, zero errors and zero warnings |
| Production build | `npm run build` | Passes — `dist/` JS ≈ 351 kB (≈ 109 kB gzip), CSS ≈ 55 kB (≈ 10 kB gzip) |
| Dev server | `npm run dev` | Serves on `0.0.0.0:5173`; every route returns HTTP 200 |
| Route rendering | `npm run verify:routes` | 30 route cases (including every artwork and creator id in the data layer), all assertions pass |
| Internal links | included above | 300 links resolved against the route table and the data layer — no broken destinations |
| Catalogue completeness | included above | All 6 artwork titles and all 4 collection titles render on `/discover` |
| Consistent crops | included above | `/discover` contains no square or 2:3 frames; the catalogue is uniformly 4:5 |
| Eager loading | included above | The first 3 catalogue images load eagerly, every other image lazily |
| Empty and invalid ids | included above | Unknown artwork, collection and artist ids all reach the not-found experience |
| Asset integrity | script over `src/data` | All 6 referenced image paths exist in `public/` |
| CSS Module integrity | script over `src/**` | 309 `styles.*` references resolve; no stale class names |
| Heading outline | script over 8 routes | One `h1` per route, no skipped levels |
| Layout geometry | computed from the stylesheets | Grid arithmetic at 360/390/430/768/1024/1440px: every grid fits its content box, no column below 115px |
| Reduced motion | inspection of built CSS | Every animated selector is covered by a `prefers-reduced-motion` block |
| Overflow audit | grep over layout CSS | No `100vw`, no fixed width wider than the smallest viewport, no unguarded `1fr` tracks |
| Secret and local-path scan | grep over tracked files | No credentials, keys, `.env` files or machine paths found |

`verify:routes` renders the real route tree for every destination — every route, plus every artwork
and creator id in the data layer — and asserts: the intended page renders for each path, unknown
paths and unknown detail ids reach the not-found experience, each page has exactly one `h1`, no
element ids are duplicated, every image has descriptive `alt` text and intrinsic dimensions, the
shared skip link and footer are present, and **every internal link resolves to a destination that
genuinely exists** — parameterised links are matched against the actual artwork, collection and
creator records, so a link to a record that does not exist fails the build check.

**Not executed — stated plainly:** there is still no browser binary in this environment (no Chromium,
Firefox, Playwright or Puppeteer), so no screenshot, visual regression, Lighthouse or cross-browser
pass was performed. Rendering is verified at the markup, link and layout-rule level, and the grid
arithmetic above is computed from the stylesheet values rather than measured in a rendered page.
Motion was verified by inspecting the generated CSS, not by watching it. A manual pass at the six
widths — including scrolling the discipline strip on a phone and toggling the OS reduced-motion
setting — remains the recommended next step.

One SPA characteristic worth knowing: every route returns HTTP 200 from the dev server, including
unknown ids, because the not-found view renders client-side. A production deployment would need to
return a real 404 status at the edge; that is deliberately out of scope here (no deployment).

## Roadmap

- **Phase 1 — Foundation and design system** _(delivered)_: setup, tokens, components, routes, page
  shells, design-system preview.
- **Phase 2 — Homepage and floating art** _(delivered)_: the editorial homepage, the floating-art
  hero, the five disciplines, the artwork spotlight and the artist invitation.
- **Phase 3 — Art universe and immersive discovery** _(delivered)_: the discovery catalogue, the
  discipline index, the full sample catalogue and the collection groupings.
- **Phase 4**: catalogue filtering, sorting, pagination and indexed search.
- **Phase 5**: collections and curation — editorial collections, studio series, curation tools.
- **Phase 6**: artwork detail and commerce — provenance, certificates, availability, purchase flow.
- **Phase 7**: studios and sellers — seller accounts, studio profiles, listing tools, orders, payouts.

## Scripts reference

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the built output locally |
| `npm run typecheck` | Strict TypeScript build of both projects |
| `npm run lint` | ESLint over the repository |
| `npm run verify:routes` | Render every route and assert page, link and accessibility basics |
| `npm run validate` | All of the above, in order |
