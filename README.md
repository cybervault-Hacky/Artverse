# ArtVerse

**Where Art Finds Its Universe.**

A global art marketplace for paintings, digital artwork, decorative lighting, handmade objects and
custom creations — built in phases, in the open.

**Status: Phase 9 delivered.** The repository contains the project foundation, the design system,
the shared component set, the route architecture, the complete editorial homepage with its
signature floating-art hero, the Explore Art discovery catalogue with live search, discipline
filtering, sorting and honest empty states, an immersive artwork page for every record, a studio
directory with a profile for every creator, a collection directory whose pages open on one of the
collection's own works, the seller studio illustrated at `/sell/studio` — an overview of one
studio's records, its listings, a listing draft you can edit, and a profile preview — and the
commerce groundwork: a price shown only when a record genuinely carries one, a provenance section
that states what is held and what is not, and a seller certificate shown as a design preview marked
*not issued*. It is still a frontend build: there is no backend, no database, no authentication, no
accounts, no storage, no payments, no checkout and no real listings.

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
- [The collections directory and pages](#the-collections-directory-and-pages)
- [The seller studio preview](#the-seller-studio-preview)
- [Price, provenance and the certificate preview](#price-provenance-and-the-certificate-preview)
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
- Phase numbering follows the roadmap at the end of this file rather than the order the phases
  happened to be built in.

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

**Phase 8 — the seller studio preview**

This is the frontend of what the roadmap at the end of this file lists as Phases 9 and 10, shipped
ahead of its place in the plan and labelled as a preview on every screen — accounts, storage,
listing tools and publication are all still to come.

- `/sell` is now an honest entry point rather than a sign-up prompt: the four steps the studio
  workflow is built around, a hand-off into the workspace, and a plain list of everything that is
  not here yet — including that there is no seller account system to sign up to.
- A workspace at `/sell/studio` with three sections and one layout: an overview of the records one
  studio holds and which fields they carry, the listings, and a preview of the public profile.
- The listing editor lives at `/sell/studio/listings/new` and at
  `/sell/studio/listings/:artworkId`, which opens on that record's own values. The draft is held in
  the browser tab for as long as it is open — no account, no upload, no storage, no publication.
- Validation is real and only runs when asked: required fields, length limits, a four-digit year,
  a discipline from the data layer, an image that is one of the records that exist.
- `PreviewNotice`, `StatusTag` and `FormField` were added to the shared component set, and the
  workspace's sidebar becomes a scrolling row of links on narrow screens.
- Every workspace screen states what it is. Nothing in it claims a save, an upload, a publication,
  a verification or a sale, and no figure on it is invented.

**Phase 9 — commerce and provenance, as presentation**

- A price is shown only when a record carries a trustworthy amount *and* its ISO 4217 currency
  code. No sample record does, so every artwork page states that no price has been provided instead
  of showing a zero, a range, a “from” figure or a symbol on its own.
- Nothing is converted between currencies and nothing assumes two of them are interchangeable:
  amounts are written as `USD 2,400` — code first, always visible — and a value that cannot be
  parsed is not displayed at all.
- A **Price and provenance** section on every artwork page, built from what the catalogue holds:
  the attribution as a catalogue record rather than an authentication, the collections the work is
  held in, a plain statement that no verification, signature record, edition record or certificate
  is held, and the honest line that no provenance statement has been provided.
- The design preview of the **Seller Verification Certificate** at `/sell/studio/certificate`, with
  the status `Preview — Not Issued` written by the model. The recipient and studio lines can be
  typed into for the preview; the certificate ID and issue date can never be filled, and the space a
  verification code would occupy is an empty framework that says no code is generated.
- A price pair in the listing draft, validated together — an amount with no currency is reported as
  incomplete, and a currency with no amount likewise — with hint text that says what the value is
  not: published, converted, or buyable.

## What is deliberately not included

Catalogue pagination, medium/size/material filters and indexed search; editorial curation tools;
artwork commerce (real prices, availability, baskets, checkout, payment, orders or refunds); seller accounts, sign-in, seller
verification and approval; file uploads, stored listings, drafts that outlive the tab,
publication, orders, commissions and payouts; seller verification, issued certificates, certificate
identifiers, QR endpoints and PDF generation. There is no backend, database, authentication,
payment, storage or AI service anywhere in this repository, and no page simulates one — the seller
workspace at `/sell/studio` and the certificate design at `/sell/studio/certificate` are frontend
previews that say on every screen that they are.

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

`/discover/:collectionId` opens on one of the collection's own works, then renders its editorial
description, the works it holds in the same consistent crop, and two clear routes onward — **Back to
Explore Art** and **All collections**. An unknown id renders the shared not-found experience with
the requested id shown back to the visitor, so a stale link is never mistaken for a real page. See
[the collections directory and pages](#the-collections-directory-and-pages) for how the page is
composed.

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

### Why collection pages carry no controls

`/discover/:collectionId` shows a collection's own works and nothing else — searching inside a
three-work grouping would add a control that can only ever hide two of them. Phase 4's controls are
therefore scoped to `/discover`. Phase 7 composed those pages further but added no controls to
them: the works, the descriptions, the count and the routes back to the directory are all that is
there.

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

## The collections directory and pages

A collection is how ArtVerse holds work together across studios — by mood, material or a shared idea,
rather than by category. Four sample collections exist in this build, each holding three of the six
illustrative records, and a work can sit in more than one of them.

### `/collections` — the directory

Four collections do not justify filters, sorting or a category system, so the page carries none of
them. What it does instead is compose: the first collection is given a full-width moment — a wide
image beside its title, summary and full description — and the remaining three sit in a calmer grid
beneath it. The section copy states that this is a composition choice and not a ranking, because a
wider image is otherwise easy to read as a verdict. Every card links to its own collection and
carries an accurate count.

### `/discover/:collectionId` — the page

The collection pages keep their Phase 3 address: a collection is reached from the catalogue's
collection row as well as from the directory, and moving the route now would break existing links,
so the breadcrumb leads **Home → Collections → the collection** while the address stays under
`/discover/`.

The page is built from the collection's own artwork and metadata and nothing else — there is no
curator, no provenance and no collection story here, because the data holds none. It reads:

1. A breadcrumb: **Home → Collections → the collection's title**.
2. An editorial hero: the representative work running wide as a band, captioned with its own title,
   its medium and the plain statement that it is a sample image from the collection.
3. The title as the page `h1`, the full description when the record carries one, and the count of
   works actually rendered.
4. The works themselves, in the collection's own order and in the catalogue's consistent crop, each
   opening its own artwork page.
5. Two routes back: **All collections** and **Explore Art**.

An unknown id renders the shared not-found experience with the requested id shown back, exactly as
elsewhere in the app.

### One model, one source of membership

`collection.artworkIds` is the only membership the data holds — there is no second relationship array
and no duplicated id list. `src/utils/collections.ts` resolves it through `getArtworksForCollection`
and returns the works, the count, the representative work and the destination, so every surface reads
the same answer:

| Decision | Rule | Consequence |
| --- | --- | --- |
| What it holds | `artworkIds` resolved against the artwork records; an id with no record is skipped | The count can never overstate what the page renders |
| What represents it | The first work in the collection's own order that resolves **and** has a requestable image | Deterministic; no empty `src` is possible |
| Where it goes | A route is built only from a usable id | A card can never link to nowhere |

### When something is missing

- **No usable image** — the card renders a bordered panel saying how many works the collection holds
  and that no image is attached, and emits no `<img>` at all. The detail page drops the hero band
  entirely and opens on the title.
- **No description** — the card shows its summary only; the detail page says plainly that no
  description has been written yet rather than leaving a silent gap.
- **Empty collection** — the card reports "No works in this collection", the directory moves to the
  shared empty state, and the detail page shows its own empty state with a route to the catalogue.
- **No usable id** — the card renders as a static article rather than a link to a route that would
  fail.

## The seller studio preview

Five screens under `/sell/studio`, one layout, one draft model, and the same rule on all of them:
nothing here stores anything.

| Screen | What it shows |
| --- | --- |
| `/sell/studio` | The records this preview studio holds, which fields they carry, the three sections of the workspace, and what it deliberately does not do |
| `/sell/studio/listings` | The studio's own records — each linking to prepare a draft from it, and to its public page — plus any draft already prepared in this tab |
| `/sell/studio/listings/new` | A listing draft starting from nothing |
| `/sell/studio/listings/:artworkId` | The same editor, starting from that record's own values |
| `/sell/studio/profile` | The public profile as it renders today, beside what a seller would eventually edit and what is not built |

**Where a draft lives.** In the browser tab, in memory, held by the workspace layout's reducer and
shared with every screen underneath it, so stepping into the listings list and back does not lose
what was typed. Reloading or closing the tab discards it. No draft is sent anywhere, because there
is nowhere to send it, and the editor says so in its own words rather than implying a save.

**What validation means here.** `validateListingDraft` is a pure function over a pure draft, and the
editor reports exactly what it returns: a missing or too-short title, a medium over sixty
characters, a year outside 1800–2026, a discipline that is not one of the five in the data layer,
an image that is not one of the six records that exist. Nothing is checked until the reader asks,
and editing a field clears that field's own message rather than silently re-checking everything.

**What the workspace does not claim.** No account, no sign-in, no seller application or
verification, no file upload, no storage, no publication, no price, no availability, no order and
no payout. Every workspace screen carries the same preview notice, and the overview lists what is
missing in the same place it lists what exists — so the reader can see the shape of the thing
without being sold the thing.

**Why the profile preview reads the directory's model.** `buildStudioEntry` already turns a creator
record into the practice, location, note and works that the public profile shows, and the preview
calls that same function instead of describing the profile a second time. Two descriptions would
eventually disagree; one cannot.

## Price, provenance and the certificate preview

Three surfaces that make the same promise: show what the record holds, state what it does not, and
never imply a capability that has not been built.

**The price rules** live in `src/utils/pricing.ts`, and they are deliberately strict.

| Rule | Why |
| --- | --- |
| An amount is never shown without its currency code | A number alone is not a price, and a symbol alone is ambiguous |
| The code is always visible — `USD 2,400`, never `$2,400` | The reader should never have to infer which currency they are looking at |
| Nothing is converted | There is no exchange rate anywhere in this build, and inventing one would be a lie told in figures |
| Typed amounts are parsed strictly — digits, one decimal point, at most two places | `1,200` means different things in different places, so it is reported rather than guessed at |
| An unusable value renders nothing at all | A placeholder amount is worse than a stated absence |

The one amount in the repository, `USD 2,400`, belongs to no record: it exists on the
design-system page so the display can be reviewed, and its label says in as many words that no
record in the catalogue carries a price. The verification script asserts that no sample record has
one, that every artwork page states the absence, and that the illustrative amount is attached to
nothing.

**Provenance** is `src/utils/provenance.ts`, and its whole job is to keep attribution and
authentication apart. The attribution row names the studio the catalogue records and links to it;
the authenticity row says that nothing has examined or verified the work; the documents row says
that no signature record, edition record or certificate is held; the holding row comes from the
collection relationship the rest of the site already reads. No statement is ever generated — a
record without one shows the line that says so, and a record that genuinely carries one shows it
verbatim with its source. The artwork pages are checked against a list of words that would invent a
history: no “previously owned”, “acquired from”, “edition 1 of”, “exhibited at”, “signed by the
artist” or “certificate of authenticity” appears on any of them.

**The certificate preview** at `/sell/studio/certificate` draws the document a verified seller would
eventually receive. What makes it a preview rather than a claim is structural, not decorative: the
status `Preview — Not Issued` comes from the model and cannot be passed in; the certificate ID and
the issue date are bracketed placeholders that no code path fills; a typed recipient or studio name
lives in the tab and nowhere else; and the space for a future verification code is an empty dashed
frame labelled *QR placeholder*, with a sentence beside it explaining that no code is generated, that
nothing is scannable and that there is no endpoint to verify against. The document's fields are a
definition list with visible labels, which is both its screen-reader equivalent and what survives
printing. Printing drops the site header, the footer, the workspace navigation and the form
controls, and keeps the document's own rules — the design reads on plain paper and never depends on
a background printing.

## Route architecture

| Route | Page component | Status |
| --- | --- | --- |
| `/` | `HomePage` | Complete (Phase 2) — five editorial sections and the floating-art hero |
| `/discover` | `DiscoverPage` | Complete (Phase 4) — live search, discipline filters, sorting, full catalogue, collections |
| `/discover/:collectionId` | `CollectionDetailPage` | Complete (Phase 7) — editorial hero from its own work, description, its works only, route back to the directory |
| `/artwork/:artworkId` | `ArtworkDetailPage` | Complete (Phase 5, extended in Phase 9) — the work in full, its record, its studio, its price and provenance states, related works |
| `/artists` | `ArtistsPage` | Complete (Phase 6) — studio directory, every creator record |
| `/artists/:artistId` | `ArtistProfilePage` | Complete (Phase 6) — practice, location, note, own records |
| `/collections` | `CollectionsPage` | Complete (Phase 7) — the directory of the groupings this build holds |
| `/sell` | `SellPage` | Complete (Phase 8) — the studio workflow, and an honest account of what does not exist yet |
| `/sell/studio` | `StudioOverviewPage` | Preview (Phase 8) — the records this studio holds, the sections, and what the workspace does not do |
| `/sell/studio/listings` | `StudioListingsPage` | Preview (Phase 8) — the studio's own records, and any draft held in this tab |
| `/sell/studio/listings/new` | `StudioListingEditorPage` | Preview (Phase 8) — a listing draft starting from nothing |
| `/sell/studio/listings/:artworkId` | `StudioListingEditorPage` | Preview (Phase 8) — the same editor starting from that record's own values |
| `/sell/studio/profile` | `StudioProfilePreviewPage` | Preview (Phase 8) — the public profile, and what a seller would eventually edit |
| `/sell/studio/certificate` | `StudioCertificatePage` | Preview (Phase 9) — the seller verification certificate design, marked *Preview — Not Issued*, with placeholders the reader can fill for the preview only |
| `/about` | `AboutPage` | Complete — what ArtVerse is and what has shipped |
| `/search` | `SearchPage` | Foundation — direct destination for a search; Explore Art carries the fuller experience |
| `/design-system` | `DesignSystemPage` | Complete — internal token and component reference |
| `/404`, any unknown path | `NotFoundPage` | Complete — also used for unknown artwork, collection and artist ids |

Paths are declared once in `src/app/routes.ts` and registered in `src/app/AppRoutes.tsx`. The five
workspace screens are children of one `/sell` layout route, which is what lets the draft they share
survive navigation between them. Unknown detail ids render the same not-found experience as an
unknown URL, so a stale link is never mistaken for a real page — including an unknown artwork id in
the editor, which says so and offers a new draft instead of appearing to hold a record it does not.

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

The workspace previews the seller studio using those same records and nothing else. It shows the
records one sample studio holds, which fields they carry and which are missing — the only figures in
it are counts of records that exist, recomputed from the data. It carries no views, impressions,
sales, revenue, conversion, ranking or rating, because the build has no such information and will
not invent it.

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

**Phase 7 — collections and curated worlds**

- `/collections` rebuilt as an editorial directory: an introduction that says what a collection is
  in this build, the first collection at full scale with its wide image beside the title, summary
  and full description, and the remaining three in a calmer grid beneath it.
- The full-scale moment is composition, not a ranking — the section copy says plainly that the
  groupings appear in the order the build holds them and that nothing is measured, rated or
  endorsed, so a wider image is never read as a verdict on the collection.
- `/discover/:collectionId` now opens on its own editorial hero: one of the collection's own
  works as a wide band, captioned as a sample image, with the title, description and count beneath
  it — deliberately unlike the artwork page's side-by-side hero. Breadcrumbs lead
  **Home → Collections → collection**.
- `src/utils/collections.ts` added as the one model both surfaces read: the resolved works, the
  count, the representative work and the destination. A collection's count is the number of works
  it actually resolves to, so the number on a card, in the hero and in the grid cannot disagree.
- The representative work is the first of the collection's own records, in the collection's own
  order, that resolves and carries a requestable image — deterministic, drawn from the real
  relationship, and unable to ask the browser for an empty `src`.
- Degradation handled explicitly: a collection whose works carry no usable image renders a labelled
  panel instead of a frame and emits no `<img>` at all, a collection with no description says so
  rather than showing nothing, and a record with no usable id renders as a static card rather than
  a link to nowhere.
- The homepage's Four Artistic Worlds and the catalogue's collection row now resolve through the
  same model, so the homepage, the directory and the collection pages cannot drift apart.
- Roadmaps reconciled: the README and the About page now describe one twelve-phase plan, and every
  in-page "what comes later" note names the phase that actually owns that work.

On the collections directory, each card is a single link whose `aria-label` names its destination
(`Quiet Landscapes — open collection`); the grid is a labelled list; a card with no usable id is a
static `article` rather than a link to nowhere; and an imageless card states its count in text
instead of leaving an unlabelled gap. On a collection page the collection title is the `h1` with the
works under an `h2`, the representative work is a `figure` captioned as a sample image from the
collection, and the count sits beside the title as text rather than as a badge.

On the workspace screens, the sidebar navigation is a labelled list of links whose current
destination is marked `aria-current`; the preview notice is a paragraph with a visually hidden
"Preview:" prefix, so its meaning is not carried by the small tag alone; every field is named by its
own `<label for>`, and the image chooser is a radio group whose legend, hint and error are linked
from the `fieldset` — so the group is announced once with its instructions rather than as seven
unrelated radios. Validation messages appear in the page and are described, not only coloured, and a
field's message is cleared by editing that field. The draft summary is text, never a badge.

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

The collections directory steps in two tiers of its own. The opening composition — a wide image
beside the title, summary and description — is stacked on phones and becomes two columns at 768px,
with both tracks guarded by `minmax(0, …)` so it cannot overflow. The grid beneath it is one column
on phones, two from 700px and three from 1024px, where the cards settle at 282px within the 1200px
container and every card keeps its image above its text. On a collection page the hero band runs the
full content width — 320px on the smallest phone, 1104px on a large screen — retaining the work's own
proportions, so nothing is stretched or cropped by the composition.

The studio pages step in three tiers of their own. The directory is one column on phones, two from
640px and three from 1024px, with the cards' 4:5 images cropped from each studio's own lead work.
The profile is a single stacked column on phones — work, then identity — and a two-column masthead
from 768px, tightening its fact label column from 9rem to 7.5rem at that width so the values keep
their room, then widening the identity column to 1.15fr from 1024px. A studio with no records drops
the media column entirely rather than leaving a hole beside its name.

The seller workspace steps in two tiers. Below 1024px the sidebar is not a sidebar: the section
links become a horizontal row that scrolls within itself, so the content keeps the full width and
nothing is squeezed into a narrow column beside a list of three links. From 1024px the shell becomes
a 15rem column plus the content, the navigation turns into a sticky column, and the editor's live
preview sticks beside the form. The form itself is one column on phones and two from 768px, and the
image chooser is one tile per row on phones and two from 768px, so a radio target is never smaller
than a comfortable tap. At 360px the content box is 320px and the widest fixed width in the
workspace is a 15rem sidebar, which only exists above 1024px. On the `/sell` entry page the four
workflow steps run one per row on phones, two from 768px and four from 1024px, and the hand-off
panel becomes a wide column plus an action from 1024px.

## Verification

Executed in this repository:

| Check | Command | Result |
| --- | --- | --- |
| Dependency install | `npm ci` | 168 packages installed. Audits were disabled for this run, so no vulnerability audit was performed |
| Type check | `npm run typecheck` | Passes, strict mode, no errors |
| Lint | `npm run lint` | Passes, zero errors and zero warnings |
| Production build | `npm run build` | Passes — `dist/` JS 415.85 kB (125.43 kB gzip), CSS 90.04 kB (14.52 kB gzip) |
| Dev server | `npm run dev` | Serves on `0.0.0.0:5173`; all 24 swept URLs return HTTP 200 with the app shell — every destination, `/discover` with search, filter and sort parameters, all five workspace screens, and an unknown artwork, collection, artist or record id |
| Route rendering | `npm run verify:routes` | 71 route cases (including every artwork, creator and collection id in the data layer, and every seller workspace screen), all assertions pass |
| Internal links | included above | 960 links resolved against the route table and the data layer — no broken destinations |
| Price rules | included above | No sample record carries a price, and none is reported as carrying one; USD and INR format to different strings that each contain their own code; a symbol alone, a missing code, a non-numeric amount, a zero, a negative and a three-decimal amount all format to nothing |
| Typed price handling | included above | An amount with no currency and a currency with no amount each fail on their own field; separators, symbols and over-precise amounts are reported rather than stripped; a complete price and an empty one are both valid |
| Provenance rules | included above | For all 6 records: no statement is claimed, the attribution links to that work's own creator record or says none is recorded, the holding matches the collection relationship, and the authenticity and documents rows state what is not held |
| Provenance vocabulary | included above | No artwork page contains an invented history — no `Previously owned`, `Acquired from`, `Edition 1 of`, `Exhibited at`, `Signed by the artist`, `Certificate of Authenticity`, `Authenticated` or `Verified authentic` |
| Certificate status | included above | `/sell/studio/certificate` always renders `Preview — Not Issued`; the status is written by the model, is not a field, and cannot be set from the page |
| Certificate placeholders | included above | The recipient and studio lines show bracketed placeholders until something is typed, then show what was typed; the certificate ID and the issue date are placeholders in every state, contain no digits, and are asserted never to be generated |
| No scannable code | included above | The code space is an empty frame: the document renders no `svg`, no image and no embedded data, and no identifier or date pattern appears on the page |
| No verification claim | included above | No certificate page contains `Verified Artist`, `Officially Verified`, `Verified Studio`, `Signature`, `Accredited` or any saved/published/uploaded claim |
| Seller workspace | included above | All five workspace screens render with their preview notice; the overview's coverage figures and the studio's record count are recomputed from the raw data and must match; every section link resolves; nothing on any screen claims a save, an upload, a publication, a verification or a sale |
| Listing draft model | included above | A blank draft reports exactly the five required fields; every one of the 6 records prepares a valid draft carrying its own title, discipline, medium, year and image; 15 invalid entries each fail on their own field; a record with nothing in it produces no invented values; editing clears only that field's message; checking, resetting and origin-switching all behave; each image option is a real file on a real record |
| Wrong or missing record id | included above | `/sell/studio/listings/no-such-record` reaches the workspace's own "that record isn't in this build" state with a route to a new draft and to the listings, and it renders no image and no empty `src` |
| Draft survives navigation | asserted in the markup | `/sell/studio/listings/new` renders no image at all, while the two record-backed editors render exactly one — the image the draft starts on |
| No price, no availability | included above | No workspace screen contains a currency amount, a purchase phrase, or a `Publish`/`Upload`/`Save` control |
| Catalogue behaviour | included above | 29 search, filter, sort and empty-state cases, each naming the exact records it expects and the order it expects them in |
| Collection directory | included above | `/collections` renders all 4 collections with their titles, summaries and counts, links to all 4 collection routes, and contains no artwork route and no ranking language |
| Collection membership | included above | Each collection page renders exactly the works resolved from `artworkIds`, in the collection's own order, and asserts every artwork id from the other collections is absent |
| Collection counts | included above | The printed count equals the number of works that page renders, for all 4 collections; the model is also asserted directly against the data layer, including an id that resolves to nothing |
| Collection breadcrumbs | included above | Every collection page leads Home → Collections → its title, and both routes onward resolve |
| Collection degradation | included above | A collection whose works carry no image offers no representative work and still reports its count; a blank id produces no link; a blank summary is reported as absent |
| No collection claims | included above | No collection page contains a currency amount, a purchase phrase, or the words `Curated by`, `Featured collection`, `Most popular` or `Best seller` |
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
| Creator → artwork links | included above | Every profile's artwork links resolve through the same link resolver used for all 940 internal links |
| Studio model safety | included above | A synthetic creator with blank name, id and practice produces no link, falls back to the neutral name, and emits no empty fact row |
| Empty studio state | included above | The workless path is asserted through a synthetic creator, since all 5 sample creators hold at least one record |
| No rankings or claims | included above | No studio page contains a currency amount, a purchase phrase, or the words `Verified seller`, `Verified studio`, `Award-winning` |
| Artwork page loading | included above | Exactly one eager image per artwork page — the work itself; every related card is lazy |
| Asset integrity | script over `src/data` | All 6 referenced image paths exist in `public/` |
| CSS Module integrity | script over `src/**` | 53 modules, 602 `styles.*` references resolve; 17 further rules are variant tokens resolved through bracket access; 2 unused rules remain, both pre-existing in untouched files |
| Heading outline | script over 29 routes | One `h1` per route, no skipped levels (275 headings) — including the empty state, a filtered catalogue, an artwork page, every collection page and every workspace screen |
| Search and sort labelling | markup assertions | The search field and sort control are labelled, the result count is a polite live region, and each discipline tile exposes `aria-pressed` |
| Layout geometry | computed from the stylesheets | Catalogue control-bar and detail-page arithmetic at 360/390/430/768/1024/1440px: everything fits its content box, no column below 115px, every control at least 44px, and no stacked image taller than 1000px |
| Workspace layout | computed from the stylesheets | At 360/390/430px the shell is a single column with a scrolling nav row; from 1024px it is a 15rem sidebar beside the content with both the nav and the editor's preview sticky. Form columns run 1/1/1/2/2/2 and image tiles 1/1/1/2/2/2 across the six widths; the content box is 320px at the narrowest and every track is guarded by `minmax(0, …)` |
| Workspace tokens | script over the new stylesheets | 392 `var()` references, all defined in `tokens.css` — no colour literal, no undeclared token, no silently-falling-back value |
| Form labelling | markup assertions | Every rendered `input`, `textarea` and `select` on every workspace screen has an id and a `<label for>` that names it; the image chooser's legend, hint and error are linked from its `fieldset`, and the certificate's two preview inputs are labelled the same way |
| Contrast | computed from the tokens | Every foreground/background pair the new price, provenance and certificate rules can produce clears 4.5:1 — the lowest is 4.70:1 — including the italic placeholder, the field notes and the status line |
| Certificate geometry | computed from the stylesheets | At 360/390/430/768/1024/1440px the certificate's content box is 270/300/340/628/838/990px, its frame padding never drops below 24px, the code frame stays 120px and always fits, and the code note carries a minimum width so it wraps rather than squeezing the frame |
| Print stylesheet | inspection of the modules | Six modules carry `@media print` rules: the site header, the footer, the workspace navigation, the certificate page's controls and the document itself are dropped or restated. No print rule depends on a background image, a gradient or `print-color-adjust`, and the document's borders carry the structure |
| Image integrity | markup assertions | Every image on the workspace screens carries `width`, `height`, descriptive `alt` and an aspect-ratio frame; no screen emits an image without a `src`, and no element is wider than a 360px viewport |
| Workspace price field | markup assertions | The listing editor renders a labelled price pair (`id`/`for` asserted for both), the preview column shows the draft's price with its code or states that none has been entered, and no price-shaped value is rendered anywhere on the workspace screens |
| Collection layout | computed from the stylesheets | At the six widths the directory's grid runs 1/1/1/2/3/3 cards after a full-scale opening composition, the feature card splits at 768px only and with `minmax(0, …)` guards, cards stay 282px or wider, and every image on the collection pages is rendered inside an aspect-ratio frame — no page emits an image without a src, a size or alternative text |
| Reduced motion | inspection of built CSS | Every animated selector is covered by a `prefers-reduced-motion` block |
| Overflow audit | grep over layout CSS | No `100vw`, no fixed width wider than the smallest viewport, no unguarded `1fr` tracks |
| Secret and local-path scan | grep over tracked files | No credentials, keys, `.env` files or machine paths found |

`verify:routes` renders the real route tree for every destination — every route, plus every artwork,
collection and creator id in the data layer and every workspace screen — and asserts: the intended page renders for each path, unknown
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

Phase 7 added the collection assertions in the same spirit, this time against the model directly
rather than against a page: that a count equals the works that actually resolved, that the lead work
is always the collection's own and always carries a requestable image, and that a collection holding
an id with no record counts only what it finds.

Phase 8 does the same for the workspace, and it is the phase where the script earns its keep twice
over. The five workspace screens are ordinary cases — preview label present, the studio's own
records only, no save or publish claim anywhere — but the behaviour behind them is not markup: the
draft, the validator and the reducer are pure, so the script drives them directly. A blank draft
must report exactly its five required fields and no optional one; all six records must prepare a
draft that passes; fifteen separate invalid entries must each fail on their own field; a record with
nothing in it must not produce an invented value; editing one field must clear that field's error
and no other; checking, resetting and switching origin must all leave the draft where the reader
expects. The workspace's own arithmetic is recomputed from the raw data too, so the coverage figures
printed on the overview cannot drift from the catalogue they describe.

That sweep found a real defect before the phase was committed: the image chooser's `<label for>`
values named ids that did not exist, so although the tiles were visible, the radios inside them had
no accessible name at all. It is the kind of fault a screenshot cannot show and a model test cannot
reach, and it was fixed by pointing each label at its own control.

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

Phase 8 adds its own browser-only list, and it is the longest of the three, because the workspace is
the first part of the build whose behaviour is a form rather than a page: that typing in a field is
immediate and does not lose a character, that selecting an image with the arrow keys moves between
tiles and announces the right one, that the draft really does survive a step into the listings list
and back, that "check this draft" reports the fields it says it reports and that correcting one
field clears that field's message only, that the sticky sidebar and the sticky preview column behave
while the form is scrolled, that the section nav really does scroll sideways on a phone without
dragging the page with it, and that focus order through the editor's fourteen controls feels like
reading order.
The model behind each of those is asserted directly — the reducer, the validator, the origin
derivation and the coverage arithmetic are all tested against the raw data — but the interaction
itself was not watched.

One SPA characteristic worth knowing: every route returns HTTP 200 from the dev server, including
unknown ids, because the not-found view renders client-side. A production deployment would need to
return a real 404 status at the edge; that is deliberately out of scope here (no deployment).

## Roadmap

One plan in twelve phases. The About page presents the same twelve in the same order, so the two
never disagree about what a phase covers.

The numbering of the *work* and the numbering of the *plan* diverge once, and only here: the eighth
piece of work delivered is the seller studio preview, which is the frontend of what this plan lists
as Phases 9 and 10. It shipped ahead of its place in the plan and is labelled as a preview on every
screen, because the capability behind it — accounts, storage, listings, publication — is not built.
The plan below keeps its own numbering so the README and the About page continue to agree.

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
- **Phase 7 — Collections and curated worlds** _(delivered)_: the collection directory composed as an
  editorial spread, and a collection page that opens on its own work, with counts that always match
  the works actually rendered.
- **Phase 8 — Curation and catalogue growth**: editorial notes with context for each grouping,
  ordering controls, pagination and deeper filters as the catalogue outgrows one page. _Not
  started — the eighth piece of work delivered is the seller studio preview described above, which
  belongs to Phases 9 and 10._
- **Phase 9 — Studio and seller accounts**: seller onboarding with an honest verification step, and
  profiles the studios maintain themselves. _The workspace these will live in exists as a frontend
  preview — it holds no account and stores nothing._
- **Phase 10 — Listings and inventory**: listing tools for images, metadata, dimensions and
  availability, with drafts before anything is published. _The listing draft editor exists as a
  preview: it validates every field and saves none of them._
- **Phase 11 — Orders, fulfilment and payouts**: order handling, shipping options, fees stated
  plainly and payouts to the studios.
- **Phase 12 — Artwork commerce and provenance**: availability, pricing and currency handling;
  enquiry and purchase flows; certificates, edition records and provenance history.

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
