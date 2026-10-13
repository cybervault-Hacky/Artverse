# ArtVerse

**Where Art Finds Its Universe.**

A global art marketplace for paintings, digital artwork, decorative lighting, handmade objects and
custom creations — built in phases, in the open.

**Status: Phase 6 delivered.** The repository contains the project foundation, the design system,
the shared component set, the route architecture, the complete editorial homepage with its
signature floating-art hero, the Explore Art discovery catalogue with live search, discipline
filtering, sorting and honest empty states, an immersive artwork page for every record, and a studio
directory with a profile for every creator. It is still a frontend build: there is no backend, no
database, no authentication, no payments and no real listings.

---

## Contents

- [What has been built](#what-has-been-built)
- [What is deliberately not included](#what-is-deliberately-not-included)
- [Stack](#stack)
- [Getting started](#getting-started)
- [The homepage](#the-homepage)
- [The discovery catalogue](#the-discovery-catalogue)
- [Search, filtering and sorting](#search-filtering-and-sorting)
- [The artwork page](#the-artwork-page)
- [The studio directory and profiles](#the-studio-directory-and-profiles)
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

**Phase 4 — smart explore, search and filters**

- Live, unsubmitted search across the sample catalogue, matching word by word over the fields the
  data really carries: title, medium, dimensions, year, description, discipline and the creator's
  name, practice and location. Case and stray whitespace are ignored.
- The `DisciplineNav` row became the discipline filter: the same artwork covers, now six toggles
  (the five disciplines plus **All Art**) that narrow the catalogue for real, each carrying
  `aria-pressed` and a per-discipline count of what the current search can find.
- A polished control bar holding the search field, the sort control, the live result count and a
  single **Clear all**. Everything stays available in the empty state, so a dead end is always
  recoverable in one step.
- Sorting limited to what the data supports: the curated order, title A–Z and Z–A, and artist A–Z.
  Sorting works on a copy, so the shared dataset is never reordered.
- All criteria live in the address (`?q`, `?discipline`, `?sort`), parsed and validated: an unknown
  discipline or sort key falls back to the default instead of emptying the catalogue. Views are
  shareable, and back and forward step through them.

**Phase 5 — immersive artwork detail experiences**

- `/artwork/:artworkId` rebuilt as a gallery presentation: the work shown in full at its own
  intrinsic ratio, never cropped to a grid frame, with a caption that says so and gives the image's
  own pixel size.
- A record built only from fields the data actually carries. Blank fields produce no row at all;
  the studio is a block rather than a table row because it is the one part of the record that leads
  somewhere, and it links only when a creator record resolves.
- Related works chosen by a stated rule — the discipline the work belongs to, then the collections
  it appears in, most-recently-added first excluded, the work itself always excluded. No score, no
  weighting, no recommendation model, and the page says so.
- Breadcrumbs now include the collection a work belongs to, and its collections are linked in the
  record itself.
- Honest handling throughout: a missing creator reads "Studio not recorded" instead of being
  faked, an unusable image path renders a neutral panel instead of a broken image, and the closing
  note states that the record carries one image, so there is no gallery to navigate.
- Phase numbering realigned again to follow the brief's sequence: artwork detail is Phase 5,
  commerce and provenance Phase 6, collections and catalogue growth Phase 7, studios and sellers
  Phase 8.

**Phase 6 — artist directory and studio profiles**

- `/artists` rebuilt as a studio directory: every creator record, each card leading with that
  studio's own sample work and carrying its practice, location and record count.
- `/artists/:artistId` rebuilt as a studio profile: the practice, the location, the practice note,
  the record's own facts, and the sample works attributed to that creator — and nothing else.
- An optional `bio` field added to the creator records, authored for this build and explicitly
  illustrative: each note describes the sample pieces attributed to that entry and how they were
  made, never a person, a studio history, an exhibition or an award.
- `StudioCard` added as the directory's card, plus `src/utils/studioProfile.ts` holding the model
  both pages read, so creator data is never duplicated between them.
- The lead image is the studio's own work, captioned and labelled as a sample work rather than a
  portrait — the one image relationship the data holds, and the honest alternative to inventing
  portraits of people who do not exist.

## What is deliberately not included

Catalogue pagination, medium/size/material filters and indexed search; editorial curation tools;
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
2. **Explore by discipline** — the filter row: five disciplines plus **All Art**. Phones get a
   snap-scrolling strip so the catalogue stays close; from 768px the same six tiles align into one
   row. Each tile is a toggle that narrows the catalogue, and each carries the number of records the
   current search would find in it.
3. **The catalogue** — the control bar, then the matching records: one column on phones, two on
   tablets, three from 900px, all cropped to a consistent 4:5 frame. A quiet note underneath explains
   the crop and links to the studio directory.
4. **Collections to start from** — the same four collections the homepage introduces, each linking to
   its own collection page, with a link on to the full collections directory.
5. **Honest closure** — a note stating exactly what still needs a real catalogue behind it:
   medium and material filters, pagination, saved searches and indexed search.

### From index to filter

Phase 3's discipline row had to be an index: with no per-discipline route and no filtering, each
entry linked to the artwork that represented it rather than implying a filter that would silently do
nothing. The catalogue can now filter, so the row became the control itself — same covers, same
rhythm, now six real toggles — and **no representative-artwork link remains**. The section wording
was rewritten to match what the tiles actually do.

### Collection pages

`/discover/:collectionId` renders the collection's editorial description, the works it holds in the
same consistent crop, and two clear routes onward — **Back to Explore Art** and **All collections**.
An unknown id renders the shared not-found experience with the requested id shown back to the
visitor, so a stale link is never mistaken for a real page.

## Search, filtering and sorting

The catalogue engine is pure and lives in `src/utils/catalogue.ts`; the URL binding lives in
`src/hooks/useCatalogueParams.ts`. The page component only renders the result, which is what keeps
the behaviour testable without a browser.

### What search actually matches

| Field | Source | Example query that finds it |
| --- | --- | --- |
| Title | `artwork.title` | `Layered` |
| Medium | `artwork.medium` | `stoneware` (2 records) |
| Dimensions | `artwork.dimensions` | `60 × 90` |
| Year | `artwork.year` | `2023` |
| Description | `artwork.description` | `balance` |
| Discipline | label and id | `Digital Artwork` |
| Creator name | `creator.name` | `Illustrative Maker E` |
| Creator practice | `creator.discipline` | `Ceramics` |
| Creator location | `creator.location` | `Oaxaca` |

Matching is case-insensitive and word by word, so `ochre canvas` finds *Layered Light, Study I* —
a canvas described as ochre — even though the two words never sit next to each other. Leading and
trailing spaces are ignored, and a query of nothing but spaces is treated as no query at all.
There is deliberately no stemming, synonym expansion, fuzzy matching or ranking: a six-record sample
set does not justify pretending to that kind of intelligence, and a wrong confident match would be
worse than a plain one. Pasting a term with a missing optional metadata field anywhere cannot throw —
every field is read defensively.

### Filters and sort orders

- **Disciplines** — the five categories plus **All Art**. Selecting one filters the catalogue;
  the selection is shown by a ring, a check badge and an underlined label, and exposed as
  `aria-pressed`. Counts describe what the *current search* can find in each discipline, so a term
  with no hits in a category says so before you click.
- **Sort orders** — Curated order (the order the catalogue is written in), Title: A to Z,
  Title: Z to A, Artist: A to Z. There is no price, popularity, rating or "recently added" option,
  because the records carry no price, no sales and no engagement data to sort by.
- Sorting never mutates the shared dataset: `sortArtworks` sorts a copy, and the verification script
  asserts the curated order is intact after every sort path runs.

### Address state

| Parameter | Values | Default | Unknown values |
| --- | --- | --- | --- |
| `q` | free text | omitted | — |
| `discipline` | the five category ids | omitted (all) | ignored, falls back to all art |
| `sort` | `title-asc`, `title-desc`, `artist-asc` | omitted (curated) | ignored, falls back to curated |

An untouched catalogue keeps the clean `/discover` address. Typing writes with `replace`, so a search
does not bury the previous page under one history entry per letter; choosing a discipline, changing
the order or clearing pushes an entry, so the browser's back button walks those steps. Validation
happens on read, so a hand-edited or truncated link can never empty the catalogue.

### Reset behaviour

Search, discipline and sort are independent, and resetting one never disturbs the others: clearing
the search keeps the discipline, changing the discipline keeps the search, and re-sorting keeps both.
**Clear all** — offered only when something is set — returns everything to the default view in one
step, and does the same job from inside the empty state.

### Empty results

When nothing matches, the controls stay exactly where they are, the grid is replaced by the shared
`EmptyState`, and the copy names what was actually asked for — *“None of the 6 illustrative records
match “light” in the Handmade Products discipline.”* No fake results, no spinner, no dead end: one
button clears the criteria. The default catalogue keeps showing all six records.

### Why collection pages are unchanged

`/discover/:collectionId` shows a collection's own works and nothing else — searching inside a
three-work grouping would add a control that can only ever hide two of them. Phase 4's controls are
therefore scoped to `/discover`, and the collection pages keep their Phase 3 behaviour, descriptions,
links and back navigation untouched.

## The artwork page

`/artwork/:artworkId` is the work itself, presented the way a gallery would hang it: the image first
at full size and true proportion, the record beside it, then what the catalogue honestly knows about
how it relates to everything else.

| Zone | What it holds |
| --- | --- |
| Breadcrumb | Home → Explore Art → *the collection it sits in* → the work. The collection crumb only appears when the record really belongs to one |
| The work | `ArtworkFrame` at the record's intrinsic ratio, radius `md`, soft elevation, eager loading, `sizes` tuned to the two-column split. Nothing is cropped |
| Image caption | States that the sample image is shown in full rather than cropped to the catalogue frame, and gives its real pixel size |
| The record | Discipline eyebrow, `h1` title, editorial description, then the studio block and the metadata table |
| Studio block | Name (linked to the artist route when it resolves), practice and location, and the illustrative placeholder label these records ship with |
| Metadata | Medium, Dimensions, Year, Collections (linked), Reference — assembled from real fields only |
| Return | **Back to Explore Art** and **All collections** |
| Explore Related Art | Up to four other records, chosen by discipline then by shared collection |

### How the record is assembled, and what happens when something is missing

Every row comes from a field the sample record carries. Nothing is estimated, inferred or padded:

| Situation | What the page does |
| --- | --- |
| A field is blank or whitespace | No row is rendered at all — the label never appears over an empty value |
| `year` is not a finite number | The Year row is dropped |
| The work is in no collection | The Collections row and the collection breadcrumb are both dropped |
| The creator does not resolve, or has a blank name | The studio block reads **“Studio not recorded”**, with the practice, location and link all omitted — stated, not faked |
| The creator exists but has no practice or location | Those lines are omitted; the name and link remain |
| The image path is empty or unusable | A neutral panel replaces the image, sized to the record's own ratio, with the catalogued details still shown. No `<img>` is emitted, so there is no broken request and no re-request of the page itself |

The two decisions inside this page are made by pure functions in `src/utils/artworkDetail.ts` —
`buildArtworkDetails`, `buildStudioDetail`, `getRelatedArtworks`, `getCollectionsForArtwork`,
`hasDisplayableImage` — so the verification script can assert the rules directly rather than
inferring them from markup.

### Related works, and what is deliberately absent

Related works follow one fixed rule: **other records in the same discipline first, then works this
one is held alongside in a collection**, de-duplicated, in catalogue order, capped at four, with the
current work always excluded. The same work always produces the same list. The section states the
rule in its own words — *“No recommendation model is involved”* — because there is none: no score,
no weighting, no personalisation, no “you may also like”.

There is also **no purchase, favourite or share control anywhere on the page**. The record carries a
single image, so there is no gallery navigation, no thumbnails and no zoom. Both facts are stated on
the page rather than dressed up as actions that would do nothing.

## The studio directory and profiles

### `/artists` — the directory

Every creator record in the data layer is listed. It is the catalogue of studios rather than a
curated selection, so nothing is filtered, boosted or reordered, and there is no ranking of any kind
— no follower counts, no sales, no ratings and no "featured" placement, because none of that data
exists.

Each card leads with that studio's **own** sample work and carries its name, practice, location and
record count. The image is labelled *Sample work* on the card itself: this build holds no studio
photography, and a work is the one image relationship the data actually supports — the alternative
would be inventing portraits of people who do not exist.

| Element | Where it comes from |
| --- | --- |
| Name | `creator.name`, or **“Studio name not recorded”** when blank |
| Image | The creator's first record with a requestable image, in catalogue order |
| Practice · location | `creator.discipline`, `creator.location` — each omitted when missing |
| Record count | The artworks whose `creatorId` matches, counted from the data |
| Illustrative label | Every entry, because every creator record carries `illustrative: true` |
| Link | `NavRoutes.artist(creator.id)` — omitted entirely if the id is unusable |

### `/artists/:artistId` — the profile

| Section | What it holds |
| --- | --- |
| Breadcrumb | Home → Artists & Studios → the studio |
| Masthead | The studio's own work (captioned as a work in place of a portrait), the practice · location eyebrow, the name as `h1`, the practice note, the illustrative notice, the facts table, and two onward routes |
| Facts | Practice, Based in, Records in this build, Reference — assembled from real fields only |
| Sample records | `<h2>` heading with the count, then `ArtworkGrid` of exactly that creator's works |
| Closing note | What the profile will carry once studios maintain their own accounts |

### Missing information, handled explicitly

| Situation | What happens |
| --- | --- |
| No practice note (`bio`) | The profile says so: *“No practice note has been written for this record yet.”* It is never given invented copy |
| No name | Falls back to **“Studio name not recorded”**, and the profile keeps a usable `h1` |
| No practice or location | Both the eyebrow and the corresponding fact row are omitted |
| No id | No link is emitted — the card renders as static text instead of a route that would 404 |
| No records | The grid is replaced by an empty state that points at the catalogue, and the masthead loses its media column entirely |
| No studio photograph | A sample work stands in, captioned as such — never presented as a portrait |

The two pages read one model, `src/utils/studioProfile.ts` (`buildStudioDirectory`,
`buildStudioEntry`, `buildStudioFacts`, `getStudioLeadWork`, `studioPracticeLine`), so creator data
is never duplicated between the page components. Unknown ids render the shared not-found experience,
as everywhere else.

### Cross-page navigation

Every route in this chain is checked by the verification script:

1. Homepage → **Artists & Studios** (hero action, header nav, footer nav).
2. Directory → any studio profile (one link per card, `aria-label` naming the destination).
3. Artwork page → the studio behind it (the studio block links only when a creator resolves).
4. Studio profile → that studio's artwork (the grid, each card opening `/artwork/:id`).
5. Studio profile → the directory (breadcrumb and the **All artists & studios** action).
6. Studio artwork → artwork detail → back to the studio profile.

## Route architecture

| Route | Page component | Status |
| --- | --- | --- |
| `/` | `HomePage` | Complete (Phase 2) — five editorial sections and the floating-art hero |
| `/discover` | `DiscoverPage` | Complete (Phase 4) — live search, discipline filters, sorting, full catalogue, collections |
| `/discover/:collectionId` | `CollectionDetailPage` | Complete (Phase 3) — collection, its works, route back |
| `/artwork/:artworkId` | `ArtworkDetailPage` | Complete (Phase 5) — the work in full, its record, its studio, related works |
| `/artists` | `ArtistsPage` | Complete (Phase 6) — studio directory, every creator record |
| `/artists/:artistId` | `ArtistProfilePage` | Complete (Phase 6) — practice, location, note, own records |
| `/collections` | `CollectionsPage` | Foundation — collection directory |
| `/sell` | `SellPage` | Foundation — seller intent, no form or account |
| `/about` | `AboutPage` | Complete — what ArtVerse is and what has shipped |
| `/search` | `SearchPage` | Foundation — direct destination for a search; Explore Art carries the fuller experience |
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
├── hooks/        useDocumentTitle, useReducedMotion, useCatalogueParams
├── layouts/      MainLayout — skip link, header, routed page, footer
├── pages/        One folder per destination; the homepage is split into five section files
├── styles/       tokens.css, base.css and the global entry point
├── types/        Shared domain types
└── utils/        Small helpers: cn, aspect ratios, text formatting, the catalogue engine, the artwork detail and studio models
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

On the studio pages, the directory is a semantic list of cards, each card a single link whose
`aria-label` names its destination (`Illustrative Studio A — view studio profile`); the profile's
name is the page `h1` with the works under an `h2`; the facts table is a proper `dl`; the stand-in
image keeps its real artwork alt text and is captioned as a work; and the "Studio name not recorded"
and "No practice note" states are text rather than unlabelled placeholders.

On the artwork page, the studio link is the only link inside the record; the metadata is a proper
`dl`; the image carries its real descriptive alt text and intrinsic dimensions; the placeholder panel
and the “Studio not recorded” line are text rather than unlabelled graphics; and the related grid is a
labelled list whose cards keep the site-wide focus ring.

## Responsive behaviour

Designed and checked against 360, 390, 430, 768, 1024 and 1440 pixel widths. Grid columns step at
540px (artwork), 640px (homepage disciplines), 700px (collections), 900px (artwork, three up) and
1140px (homepage disciplines, five up); the discovery filter row becomes a row of six at 768px; the
catalogue control bar becomes a single line of search plus sort at 720px and stacks below that;
desktop navigation appears at 1024px; the content container caps at 1200px so line length stays
readable on large screens. No layout uses `100vw`, every viewport-relative value sits inside a
`clamp()` with a minimum and maximum, and no element sets a fixed width wider than a 360px viewport.
The narrowest discipline tile is 104px at 768px — enough for the longest label to wrap to two lines —
and every control keeps a touch target of at least 44px.

The artwork page steps in three tiers. On a phone the work fills the width and the record follows it
in reading order, so the image is 573–699px tall at 360–430px rather than overwhelming. From 480px
the image is capped at 30rem and centred, because a portrait record at full width would run past a
whole screen and push its own title out of sight. From 768px the work and its record sit side by
side — a 350px work beside a 317px record, with the metadata label column narrowed to 6.5rem to keep
the values readable. From 1024px the record column becomes sticky beside the image and widens its
label column back to 8rem; the panel is capped to the viewport height and scrolls inside itself if it
is taller, so its last row can always be reached instead of being clipped.

The studio pages step in three tiers of their own. The directory is one column on phones, two from
640px and three from 1024px, with the cards' 4:5 images cropped from each studio's own lead work.
The profile is a single stacked column on phones — work, then identity — and a two-column masthead
from 768px, tightening its fact label column from 9rem to 7.5rem at that width so the values keep
their room, then widening the identity column to 1.15fr from 1024px. A studio with no records drops
the media column entirely rather than leaving a hole beside its name.

## Verification

Executed in this repository:

| Check | Command | Result |
| --- | --- | --- |
| Dependency install | `npm ci` | 168 packages installed. Audits were disabled for this run, so no vulnerability audit was performed |
| Type check | `npm run typecheck` | Passes, strict mode, no errors |
| Lint | `npm run lint` | Passes, zero errors and zero warnings |
| Production build | `npm run build` | Passes — `dist/` JS ≈ 367 kB (≈ 113 kB gzip), CSS ≈ 66 kB (≈ 11 kB gzip) |
| Dev server | `npm run dev` | Serves on `0.0.0.0:5173`; every route returns HTTP 200, including each artwork page, `/discover` with search, filter and sort parameters, and an unknown artwork id |
| Route rendering | `npm run verify:routes` | 59 route cases (including every artwork and creator id in the data layer), all assertions pass |
| Internal links | included above | 740 links resolved against the route table and the data layer — no broken destinations |
| Catalogue behaviour | included above | 29 search, filter, sort and empty-state cases, each naming the exact records it expects and the order it expects them in |
| Search matching | included above | Title, medium, description, year, discipline, creator practice and creator location each find the right records; `OCHRE` and `  ochre  ` return the same two as `ochre` |
| Word-by-word search | included above | `ochre canvas` finds *Layered Light, Study I*, whose two words are not adjacent |
| Each discipline filter | included above | Painting 2, digital 1, decor 1, handmade 1, custom 1 — asserted from the rendered catalogue |
| Sorting | included above | Title A–Z, title Z–A and artist A–Z each produce the exact expected order; sorting keeps an active filter intact |
| URL validation | included above | Unknown discipline and sort keys fall back to the default; a whitespace-only query shows the whole catalogue; a default view writes no parameters at all |
| Dataset integrity | included above | Sorting never reorders `SAMPLE_ARTWORKS` — asserted after both sort paths run |
| Empty results | included above | `?q=zzzz` and `?q=light&discipline=handmade` render the empty state, drop to zero articles in the grid, and still render the search field and sort control |
| Catalogue completeness | included above | The untouched catalogue renders all 6 records in curated order, and the controls offer no sort option the data cannot support |
| Consistent crops | included above | `/discover` contains no square or 2:3 frames; the catalogue is uniformly 4:5 |
| Eager loading | included above | The first 3 catalogue images load eagerly, every other image lazily, and no image loads eagerly when nothing matches |
| Empty and invalid ids | included above | Unknown artwork, collection and artist ids all reach the not-found experience |
| Collection isolation | included above | `/discover/quiet-landscapes` and `/discover/objects-for-living` render their own three works and none of the other collection's |
| Artwork record completeness | included above | Each of the 6 records renders its title, description, medium, year, dimensions and creator name, and keeps its illustrative placeholder label |
| Artwork → studio link | included above | Every artwork page renders `href="/artists/<creatorId>"`, and the link resolver independently confirms it resolves to a real creator record |
| Studio links are impossible to break | included above | `buildStudioDetail` is asserted to emit no `href` for a missing creator, or for one with a blank name |
| Related works | included above | For each record the page renders exactly the expected related ids, in order, derived in the script from the raw data — discipline matches first, then shared collections |
| Self-exclusion | included above | No artwork page contains a link to its own route, asserted for all six records |
| Related limits | included above | The related list never exceeds four, never contains an id that does not exist, and is stable across repeated calls |
| Missing metadata | included above | A synthetic record with blank medium, dimensions and year produces no such rows and still shows its reference; a blank image path is never treated as displayable |
| Unusable image | included above | `imageAspectRatio` falls back to the frame ratio and `imagePixelLabel` returns nothing when the pixel size is unusable |
| No commerce on the artwork page | included above | No artwork page contains a currency-with-amount pattern or any of ten purchase phrases (`Add to cart`, `Buy now`, `Wishlist`, …) |
| Collection trail | included above | Every artwork page links to the first collection holding it, matching `SAMPLE_COLLECTIONS` order |
| Studio directory completeness | included above | `/artists` lists all 5 creators by name, practice and location, marks each as illustrative, and links to all 5 profile routes |
| Directory leads with own work | included above | Each directory card carries that studio's own lead image, asserted by alt text per creator |
| Directory is not an artwork list | included above | `/artists` contains 5 images but no artwork route at all — the cards link to profiles, not to works |
| Studio profile contents | included above | Each profile renders its name as `h1`, its discipline, its location, its practice note, its illustrative notice and the portrait-stand-in caption |
| Studio records are its own | included above | Each of the 5 profiles lists exactly its creator's works and asserts every other artwork id is absent |
| Studio lead image | included above | A profile's stand-in image is always one of that creator's own works, and a workless studio gets none |
| Creator → artwork links | included above | Every profile's artwork links resolve through the same link resolver used for all 740 internal links |
| Studio model safety | included above | A synthetic creator with blank name, id and practice produces no link, falls back to the neutral name, and emits no empty fact row |
| Empty studio state | included above | The workless path is asserted through a synthetic creator, since all 5 sample creators hold at least one record |
| No rankings or claims | included above | No studio page contains a currency amount, a purchase phrase, or the words `Verified seller`, `Verified studio`, `Award-winning` |
| Artwork page loading | included above | Exactly one eager image per artwork page — the work itself; every related card is lazy |
| Asset integrity | script over `src/data` | All 6 referenced image paths exist in `public/` |
| CSS Module integrity | script over `src/**` | 44 modules, 367 `styles.*` references resolve; 3 unused rules remain, all pre-existing in untouched files |
| Heading outline | script over 11 routes | One `h1` per route, no skipped levels — including the empty state, a filtered catalogue and an artwork page |
| Search and sort labelling | markup assertions | The search field and sort control are labelled, the result count is a polite live region, and each discipline tile exposes `aria-pressed` |
| Layout geometry | computed from the stylesheets | Catalogue control-bar and detail-page arithmetic at 360/390/430/768/1024/1440px: everything fits its content box, no column below 115px, every control at least 44px, and no stacked image taller than 1000px |
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

Phases 4 and 5 extended the same script rather than adding a parallel one. Twenty-nine of its cases
are catalogue queries, and each one names the exact records it expects **in the order it expects
them**, read out of the rendered page by following the artwork links. That makes search, filtering,
sorting, their combinations, the fallbacks and the empty state all testable without a browser — and
it is how the sort-only copy bug was caught: a reordered catalogue was briefly claiming “6 of 6
records match”, which reads as though something had been hidden.

The six artwork pages are asserted from the rendered markup too, with the expected related list
derived in the script from the raw data rather than from the page's own helper — so the rule as
documented is what gets checked, not a second copy of the implementation. Alongside that, the detail
page's decisions are asserted directly: no self-link, no related id outside the data layer, no
unstable ordering, no metadata row without a value, no link without a creator record, and no
currency or purchase phrase anywhere on the page.

Phase 6 applies the same idea to the studios. Every profile asserts that its artwork links are
exactly its own creator's records — with every other artwork id forbidden — and the directory
asserts the inverse: five studio images, five profile links, and no artwork route at all. The studio
model is checked directly for the things markup cannot show: that a studio is never credited with
somebody else's work, that its lead image comes from one of its own records, that an unusable id
produces no link, and that a creator with no records gets an empty list rather than a grid of
unrelated work.

**Not executed — stated plainly:** there is still no browser binary in this environment (no Chromium,
Firefox, Playwright or Puppeteer), so no screenshot, visual regression, Lighthouse or cross-browser
pass was performed, and no interaction was driven by hand. Rendering is verified at the markup, link
and layout-rule level, and the layout arithmetic above is computed from the stylesheet values rather
than measured in a rendered page. In particular the things a browser would prove and this environment
cannot: that typing in the field feels immediate, that the clear button actually clears, that the
browser's back button steps through filter changes, that focus rings are visible on every control and
that the strip scrolls smoothly on a phone. The logic behind each of those is asserted at the level it
can be — URL writing, parsing, validation and rendering — but the interaction itself was not watched.
A manual pass at the six widths remains the recommended next step — Phases 5 and 6 add to the list of
things only a browser can show: that the artwork record column stays beside the image while the work
is scrolled past, that it scrolls inside itself on a short viewport instead of clipping its last row,
that long collection names wrap gracefully in the metadata table, whether the *Sample work* pill
reads as a label rather than a caption over a busy image, that the 4:5 studio cards keep their
rhythm when one studio's lead work is square and another's is portrait, and that the directory's
five cards leave an intentional gap on the last row at three columns.

One SPA characteristic worth knowing: every route returns HTTP 200 from the dev server, including
unknown ids, because the not-found view renders client-side. A production deployment would need to
return a real 404 status at the edge; that is deliberately out of scope here (no deployment).

## Roadmap

- **Phase 1 — Foundation and design system** _(delivered)_: setup, tokens, components, routes, page
  shells, design-system preview.
- **Phase 2 — Homepage and floating art** _(delivered)_: the editorial homepage, the floating-art
  hero, the five disciplines, the artwork spotlight and the artist invitation.
- **Phase 3 — Art universe and immersive discovery** _(delivered)_: the discovery catalogue, the full
  sample catalogue and the collection groupings.
- **Phase 4 — Smart explore, search and filters** _(delivered)_: live search, discipline filtering,
  sorting and honest empty states, with the criteria carried in the address.
- **Phase 5 — Immersive artwork detail experiences** _(delivered)_: every work presented in full,
  its record assembled from real fields only, its studio linked, and related works chosen by
  discipline and shared collection.
- **Phase 6 — Artist directory and studio profiles** _(delivered)_: every creator listed and
  profiled from real fields, with its own records and a clear route back to the directory.
- **Phase 7**: collections, curation and catalogue growth — editorial collections with context,
  ordering controls, pagination and deeper filters.
- **Phase 8**: studios and sellers — seller accounts, studio-managed profiles, listing tools,
  orders, payouts.
- **Phase 9 — artwork commerce and provenance**: availability, pricing, enquiry and purchase flows,
  certificates and provenance history.

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
