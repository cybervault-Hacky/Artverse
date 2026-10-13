/**
 * Route and link verification.
 *
 * Renders the real route tree for every destination through Vite's SSR pipeline
 * and asserts the things that are easy to get wrong: each route reaches its own
 * page, unknown ids reach the not-found experience, every page keeps one h1,
 * images carry alternative text and intrinsic dimensions, and — importantly —
 * every internal link points at a destination that genuinely exists, resolving
 * artwork, collection and artist ids against the actual data layer.
 *
 * It also drives the discovery catalogue the way a visitor does — searching,
 * filtering by discipline, reordering, and landing on nothing at all — and
 * asserts which records came back and in what order, so the search, filter and
 * sort behaviour is tested through the real page rather than through a second
 * implementation of it.
 *
 * This is markup verification, not a browser test: it does not check paint,
 * scrolling or visual layout.
 *
 * Run with: npm run verify:routes
 */
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const failures = []
const notes = []
let linksChecked = 0
let routesChecked = 0

function check(condition, message) {
  if (!condition) failures.push(message)
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { AppRoutes } = await server.ssrLoadModule('/src/app/AppRoutes.tsx')
  const routes = await server.ssrLoadModule('/src/app/routes.ts')
  const data = await server.ssrLoadModule('/src/data/index.ts')
  const catalogue = await server.ssrLoadModule('/src/utils/catalogue.ts')
  const detail = await server.ssrLoadModule('/src/utils/artworkDetail.ts')
  const studio = await server.ssrLoadModule('/src/utils/studioProfile.ts')
  const collections = await server.ssrLoadModule('/src/utils/collections.ts')
  const drafts = await server.ssrLoadModule('/src/utils/listingDraft.ts')
  const workspace = await server.ssrLoadModule('/src/utils/sellerStudio.ts')

  const artworkIds = new Set(data.SAMPLE_ARTWORKS.map((artwork) => artwork.id))
  const collectionIds = new Set(data.SAMPLE_COLLECTIONS.map((collection) => collection.id))
  const creatorIds = new Set(data.SAMPLE_CREATORS.map((creator) => creator.id))
  const disciplineCount = data.SAMPLE_DISCIPLINES.length

  const artworkLinks = [...artworkIds].map((id) => `/artwork/${id}`)
  const collectionLinks = [...collectionIds].map((id) => `/discover/${id}`)

  /**
   * Every internal destination the router actually serves. Parameterised
   * patterns resolve their id against the data layer, so a link to a record
   * that does not exist is caught here rather than producing a 404 in the wild.
   */
  const ROUTES = [
    { pattern: /^\/$/, resolve: () => true, label: 'home' },
    { pattern: /^\/discover$/, resolve: () => true, label: 'discover' },
    {
      pattern: /^\/discover\/([^/]+)$/,
      resolve: (id) => collectionIds.has(id),
      label: 'collection',
    },
    { pattern: /^\/artwork\/([^/]+)$/, resolve: (id) => artworkIds.has(id), label: 'artwork' },
    { pattern: /^\/artists$/, resolve: () => true, label: 'artists' },
    { pattern: /^\/artists\/([^/]+)$/, resolve: (id) => creatorIds.has(id), label: 'artist' },
    { pattern: /^\/collections$/, resolve: () => true, label: 'collections' },
    { pattern: /^\/sell$/, resolve: () => true, label: 'sell' },
    { pattern: /^\/sell\/studio$/, resolve: () => true, label: 'studio workspace' },
    { pattern: /^\/sell\/studio\/listings$/, resolve: () => true, label: 'studio listings' },
    // Registered before the parameterised editor route, which would otherwise
    // try to resolve “new” as an artwork id.
    { pattern: /^\/sell\/studio\/listings\/new$/, resolve: () => true, label: 'new listing draft' },
    {
      pattern: /^\/sell\/studio\/listings\/([^/]+)$/,
      resolve: (id) => artworkIds.has(id),
      label: 'listing draft',
    },
    { pattern: /^\/sell\/studio\/profile$/, resolve: () => true, label: 'studio profile preview' },
    { pattern: /^\/about$/, resolve: () => true, label: 'about' },
    { pattern: /^\/search$/, resolve: () => true, label: 'search' },
    { pattern: /^\/design-system$/, resolve: () => true, label: 'design system' },
    { pattern: /^\/404$/, resolve: () => true, label: 'not found' },
  ]

  function resolveInternalLink(href) {
    const path = href.split(/[?#]/)[0]
    for (const route of ROUTES) {
      const match = path.match(route.pattern)
      if (match) {
        return route.resolve(...match.slice(1))
          ? { ok: true }
          : { ok: false, reason: `no ${route.label} record for id “${match[1]}”` }
      }
    }
    return { ok: false, reason: 'no route matches this path' }
  }

  /*
   * Shared negative assertions. Nothing in ArtVerse is for sale yet, so no page
   * may show a price-shaped value or a purchase control — and no studio may be
   * described as verified or award-winning, because nothing verifies anybody.
   */
  const currencyPattern = /[£$€¥₹]\s?\d|\d\s?(?:GBP|USD|EUR|INR)/
  const purchasePhrases = [
    'Add to cart',
    'Add to basket',
    'Buy now',
    'Add to favourites',
    'Add to wishlist',
    'Wishlist',
    'Save for later',
    'Out of stock',
    'Sold out',
    'Enquire about this work',
  ]

  /**
   * The artwork cards the page actually rendered, in DOM order.
   *
   * Only the catalogue grid links to `/artwork/<id>` on these pages, so this is
   * a faithful reading of what a visitor would see — and of the order they
   * would see it in. Image preload tags point at `/artworks/…` and never match.
   */
  function renderedArtworkIds(html) {
    return [...html.matchAll(/href="\/artwork\/([^"]+)"/g)].map((match) => match[1])
  }

  /** Each case asserts a marker that only the intended page renders. */
  const CASES = [
    {
      path: '/',
      expect: 'Where Art Finds Its Universe.',
      expectAll: ['Five Creative Disciplines', 'Share Your Creative Vision.'],
    },
    {
      path: '/discover',
      expect: 'Explore Art',
      expectAll: [
        'Explore by discipline',
        'The catalogue',
        'Collections to start from',
        // All five disciplines are listed in the index row.
        'Fine Paintings',
        'Digital Artwork',
        'Decorative Lamps',
        'Handmade Products',
        'Custom Creations',
        // The whole catalogue, not a homepage subset.
        ...data.SAMPLE_ARTWORKS.map((artwork) => artwork.title),
        ...data.SAMPLE_COLLECTIONS.map((collection) => collection.title),
      ],
      expectLinks: [...artworkLinks, ...collectionLinks, '/artists', '/collections'],
      // The grid crops every work to one ratio, so the catalogue rows align.
      forbidAll: ['aspect-ratio:1 / 1', 'aspect-ratio:2 / 3'],
      expectEagerImages: 3,
    },
    { path: '/discover/quiet-landscapes', expect: 'Quiet Landscapes' },
    { path: '/discover/objects-for-living', expect: 'Objects for Living' },
    { path: '/discover/contemporary-colour', expect: 'Contemporary Colour' },
    { path: '/discover/thoughtful-spaces', expect: 'Art for Thoughtful Spaces' },
    { path: '/discover/unknown-collection-id', expect: 'We couldn’t find that collection' },
    {
      path: '/artists',
      // The h1 is “Artists & Studios”; the ampersand is escaped in markup.
      expect: 'Artists &amp; Studios',
      expectAll: [
        // The intro still carries the editorial line the page has always used.
        'The people behind the work',
        '5 illustrative entries',
        // Every creator record is listed, with its practice and location.
        ...data.SAMPLE_CREATORS.map((creator) => creator.name),
        ...data.SAMPLE_CREATORS.map((creator) => creator.discipline),
        ...data.SAMPLE_CREATORS.map((creator) => creator.location),
        // Each card is labelled as illustrative, and its image is named as a
        // sample work rather than a portrait.
        'Illustrative profile',
        'Sample work',
      ],
      // The directory links to profiles, never straight to artworks.
      expectArtworks: [],
      forbidArtworks: data.SAMPLE_ARTWORKS.map((artwork) => artwork.id),
      expectLinks: [
        ...data.SAMPLE_CREATORS.map((creator) => `/artists/${creator.id}`),
        '/discover',
        '/collections',
      ],
      forbidAll: ['Verified seller', 'Verified studio', 'Verification badge', 'Award-winning'],
      forbidPatterns: [currencyPattern],
      // One lead work per studio, so every card shows that studio's own image.
      expectEagerImages: 0,
      expectAllAlt: data.SAMPLE_CREATORS.map(
        (creator) =>
          data.SAMPLE_ARTWORKS.find((artwork) => artwork.creatorId === creator.id)?.image.alt,
      ),
    },
    {
      path: '/collections',
      expect: 'Curated Worlds',
      expectAll: [
        'The collections',
        '4 sample collections',
        // Every collection is listed with its title, summary and count.
        ...data.SAMPLE_COLLECTIONS.map((collection) => collection.title),
        ...data.SAMPLE_COLLECTIONS.map((collection) => collection.summary),
        // The composition is explained rather than left to imply a ranking.
        'That is a composition choice, not a ranking',
        'Open the collection',
      ],
      // The directory shows collection covers, never artwork links or the works
      // themselves — the cards open collections.
      expectArtworks: [],
      forbidArtworks: data.SAMPLE_ARTWORKS.map((artwork) => artwork.id),
      expectLinks: [
        ...collectionLinks,
        '/discover',
        '/artists',
      ],
      // No collection may be described as ranked, endorsed or measured.
      forbidAll: ['Featured collection', 'Most popular', 'Best seller', 'Editor’s pick'],
      expectEagerImages: 0,
      // Each card's cover is a real work from that collection.
      expectAllAlt: data.SAMPLE_COLLECTIONS.map(
        (collection) =>
          collection.artworkIds
            .map((id) => data.SAMPLE_ARTWORKS.find((artwork) => artwork.id === id))
            .find(Boolean)?.image.alt,
      ),
    },
    {
      path: '/sell',
      expect: 'Bring your work to a wider room',
      expectAll: [
        'For Artists',
        'The workflow this is being built for',
        // The four steps of the artist workflow, in the order they are stated.
        ...workspace.ARTIST_WORKFLOW.map((step) => step.step),
        ...workspace.ARTIST_WORKFLOW.map((step) => step.title),
        'See it in the workspace',
        'What is not here yet',
        ...workspace.WORKSPACE_NOT_INCLUDED,
        // The preview state is stated before anything is offered.
        'there is no seller account system to sign up to',
      ],
      expectLinks: ['/sell/studio', '/sell/studio/listings', '/artists', '/discover'],
      // No sign-up, no application, no seller claim, no money.
      forbidAll: ['Create account', 'Sign up', 'Apply now', 'Verified seller', 'Commission rate'],
      forbidPatterns: [currencyPattern],
    },
    { path: '/about', expect: 'A marketplace built calmly, in the open' },
    { path: '/search', expect: 'Find a work, a medium or a studio', maxImages: 0 },
    { path: '/search?q=ceramic', expect: 'for “ceramic”', minImages: 1 },
    { path: '/search?q=zzzz', expect: 'No sample records match', maxImages: 0 },
    {
      path: '/design-system',
      expect: 'Floating-art prototype',
      // The architecture table is generated from ROUTE_ARCHITECTURE, so every
      // declared route must appear on the page. A row added without a specimen
      // — or a route left out of the table — fails here.
      expectAll: [
        'Nothing is simulated with tabs or in-page sections',
        ...routes.ROUTE_ARCHITECTURE.map((row) => row.pattern),
        ...routes.ROUTE_ARCHITECTURE.map((row) => row.page),
      ],
    },
    { path: '/404', expect: 'Error 404' },
    { path: '/this-route-does-not-exist', expect: 'Error 404' },
    { path: '/artwork/unknown-artwork-id', expect: 'We couldn’t find that artwork' },
    { path: '/artists/unknown-artist-id', expect: 'We couldn’t find that artist or studio' },
  ]

  /*
   * ── Artwork detail, one case per record ─────────────────────────────────
   * The expectation for each work is derived here from the raw data — not from
   * the page's own helper — so the related list is checked against the rule as
   * written down, not against a second copy of the implementation.
   */
  for (const artwork of data.SAMPLE_ARTWORKS) {
    const creator = data.SAMPLE_CREATORS.find((entry) => entry.id === artwork.creatorId)
    const collections = data.SAMPLE_COLLECTIONS.filter((collection) =>
      collection.artworkIds.includes(artwork.id),
    )
    const primaryCollection = collections[0]

    // The documented rule: same discipline first, then works held in the same
    // collections, the work itself always excluded.
    const expectedRelated = []
    const addRelated = (candidate) => {
      if (candidate.id !== artwork.id && !expectedRelated.some((id) => id === candidate.id)) {
        expectedRelated.push(candidate.id)
      }
    }
    for (const candidate of data.SAMPLE_ARTWORKS) {
      if (candidate.category === artwork.category) addRelated(candidate)
    }
    for (const collection of collections) {
      for (const id of collection.artworkIds) {
        const candidate = data.SAMPLE_ARTWORKS.find((entry) => entry.id === id)
        if (candidate) addRelated(candidate)
      }
    }

    CASES.push({
      path: `/artwork/${artwork.id}`,
      expect: artwork.title,
      expectAll: [
        artwork.description,
        artwork.medium,
        String(artwork.year),
        artwork.dimensions,
        creator.name,
        'Explore Related Art',
        'Illustrative placeholder record',
      ],
      // The studio links, and the collection trail resolves.
      expectLinks: [
        `/artists/${artwork.creatorId}`,
        ...(primaryCollection ? [`/discover/${primaryCollection.id}`] : []),
      ],
      // Only the related works appear as artwork links — never the work itself.
      expectArtworks: expectedRelated.slice(0, 4),
      forbidAll: [...purchasePhrases, `href="/artwork/${artwork.id}"`],
      forbidPatterns: [currencyPattern],
      expectEagerImages: 1,
    })
  }

  // Every creator in the data layer must render its own profile, listing its
  // own records and nobody else's.
  for (const creator of data.SAMPLE_CREATORS) {
    const ownWorks = data.SAMPLE_ARTWORKS.filter((artwork) => artwork.creatorId === creator.id)
    const otherWorks = data.SAMPLE_ARTWORKS.filter((artwork) => artwork.creatorId !== creator.id)
    const leadWork = ownWorks.find((artwork) => artwork.image?.src)

    CASES.push({
      path: `/artists/${creator.id}`,
      expect: creator.name,
      expectAll: [
        creator.discipline,
        creator.location,
        creator.bio,
        'Sample records from this studio',
        'Illustrative placeholder profile',
        // The stand-in image is named as a work, never as a portrait.
        'shown in place of a portrait',
      ],
      // Its works are the only related/artwork links on the page, plus the
      // breadcrumb and the two onward routes.
      expectArtworks: ownWorks.map((artwork) => artwork.id),
      forbidArtworks: otherWorks.map((artwork) => artwork.id),
      expectLinks: ['/artists', '/discover'],
      forbidAll: [...purchasePhrases, 'Verified seller', 'Verified studio', 'Award-winning'],
      forbidPatterns: [currencyPattern],
      // One eager image when the studio has a work to show, none when it does not.
      expectEagerImages: leadWork ? 1 : 0,
    })
  }

  /*
   * ── The catalogue engine, checked directly ──────────────────────────────
   * Two rules cannot be seen in markup: that sorting never reorders the shared
   * dataset, and that values arriving from the address bar are validated.
   */
  const curatedOrder = data.SAMPLE_ARTWORKS.map((artwork) => artwork.id).join(',')
  catalogue.buildCatalogueView({ query: '', needle: '', discipline: 'all', sort: 'title-desc' })
  catalogue.buildCatalogueView({ query: '', needle: '', discipline: 'all', sort: 'artist-asc' })
  check(
    data.SAMPLE_ARTWORKS.map((artwork) => artwork.id).join(',') === curatedOrder,
    'catalogue: sorting mutated the shared artwork dataset',
  )

  const unknownValues = catalogue.parseCatalogueCriteria(
    new URLSearchParams('discipline=sculpture&sort=price-asc'),
  )
  check(
    unknownValues.discipline === 'all' && unknownValues.sort === 'curated',
    'catalogue: an unknown discipline or sort key was not ignored',
  )

  const blankQuery = catalogue.parseCatalogueCriteria(new URLSearchParams('q=%20%20'))
  check(
    blankQuery.needle === '' &&
      catalogue.buildCatalogueView(blankQuery).artworks.length === data.SAMPLE_ARTWORKS.length,
    'catalogue: a whitespace-only query did not fall back to the whole catalogue',
  )

  /*
   * ── Artwork detail helpers, checked directly ────────────────────────────
   * Rules that markup cannot demonstrate: that related works never include the
   * work itself, that a missing creator or a blank field produces no fabricated
   * content, and that a record with no usable image does not reach an <img>.
   */
  const detailArtworkIds = new Set(data.SAMPLE_ARTWORKS.map((artwork) => artwork.id))

  for (const artwork of data.SAMPLE_ARTWORKS) {
    const related = detail.getRelatedArtworks(artwork)

    check(!related.some((entry) => entry.id === artwork.id), `detail: ${artwork.id} relates to itself`)
    check(
      related.every((entry) => detailArtworkIds.has(entry.id)),
      `detail: ${artwork.id} relates to a record that does not exist`,
    )
    check(related.length <= detail.RELATED_LIMIT, `detail: ${artwork.id} exceeds the related limit`)
    check(
      related.map((entry) => entry.id).join(',') ===
        detail
          .getRelatedArtworks(artwork)
          .map((entry) => entry.id)
          .join(','),
      `detail: ${artwork.id} produces an unstable related list`,
    )
    check(
      detail.hasDisplayableImage(artwork),
      `detail: ${artwork.id} has no usable image path`,
    )

    // Discipline is the first signal, so any same-discipline sibling must lead.
    const sibling = data.SAMPLE_ARTWORKS.find(
      (candidate) => candidate.id !== artwork.id && candidate.category === artwork.category,
    )
    if (sibling) {
      check(
        related[0]?.id === sibling.id,
        `detail: ${artwork.id} does not lead with its discipline sibling ${sibling.id}`,
      )
    }

    const rows = detail.buildArtworkDetails(artwork)
    check(rows.length > 0, `detail: ${artwork.id} produced no metadata rows`)
    check(
      rows.every((row) => detail.hasText(row.value) || (row.links && row.links.length > 0)),
      `detail: ${artwork.id} produced an empty metadata row`,
    )
    check(
      rows.some((row) => row.label === 'Medium') &&
        rows.some((row) => row.label === 'Dimensions') &&
        rows.some((row) => row.label === 'Year'),
      `detail: ${artwork.id} is missing a metadata row the record carries`,
    )
    check(
      detail.getCollectionsForArtwork(artwork).length > 0,
      `detail: ${artwork.id} is in no collection, so the trail cannot be checked`,
    )
  }

  // A record with nothing but an id: no fabricated rows, no broken image.
  const bareRecord = {
    id: 'bare-record',
    title: 'Untitled',
    category: 'painting',
    medium: '',
    year: Number.NaN,
    dimensions: '   ',
    description: 'Record kept deliberately empty for this check.',
    image: { src: '', width: 0, height: 0, alt: '' },
    aspect: 'portrait',
    creatorId: 'no-such-creator',
    sample: true,
  }

  check(!detail.hasDisplayableImage(bareRecord), 'detail: an empty image path was treated as usable')
  check(
    detail.buildArtworkDetails(bareRecord).every(
      (row) => row.label !== 'Medium' && row.label !== 'Dimensions' && row.label !== 'Year',
    ),
    'detail: a blank field still produced a metadata row',
  )
  check(
    detail.buildArtworkDetails(bareRecord).some((row) => row.label === 'Reference'),
    'detail: the record reference was dropped',
  )
  // A record that is not in the catalogue still only ever links to real
  // records in it, and never to itself — the contract that matters for safety.
  const bareRelated = detail.getRelatedArtworks(bareRecord)
  check(
    bareRelated.every((entry) => detailArtworkIds.has(entry.id)),
    'detail: a record outside the catalogue produced related works that do not exist',
  )
  check(
    !bareRelated.some((entry) => entry.id === bareRecord.id),
    'detail: a record outside the catalogue related to itself',
  )
  check(
    detail.imageAspectRatio(bareRecord) === '4 / 5',
    'detail: an unusable image size did not fall back to the frame ratio',
  )
  check(
    detail.imagePixelLabel(bareRecord) === undefined,
    'detail: an unusable image size still produced a pixel caption',
  )

  // A studio that cannot be resolved is stated, never linked.
  check(
    detail.buildStudioDetail(undefined).name === 'Studio not recorded',
    'detail: a missing creator was not stated plainly',
  )
  check(
    detail.buildStudioDetail(undefined).href === undefined,
    'detail: a missing creator still produced a link',
  )
  check(
    detail.buildStudioDetail({ id: 'x', name: '  ', discipline: '', illustrative: true }).href ===
      undefined,
    'detail: a creator with a blank name still produced a link',
  )

  for (const creator of data.SAMPLE_CREATORS) {
    const studio = detail.buildStudioDetail(creator)
    check(studio.href === `/artists/${creator.id}`, `detail: ${creator.id} did not link to its profile`)
    check(studio.illustrative, `detail: ${creator.id} lost its illustrative placeholder label`)
  }

  /*
   * ── Collection pages, one case per record ───────────────────────────────
   * The expectation for each collection is derived here from the raw data: the
   * works it resolves to, the count the page must print, and the work that
   * represents it. The breadcrumb must lead back to the collection directory,
   * and nothing from another collection may appear.
   */
  for (const collection of data.SAMPLE_COLLECTIONS) {
    const works = collection.artworkIds
      .map((id) => data.SAMPLE_ARTWORKS.find((artwork) => artwork.id === id))
      .filter(Boolean)
    const leadWork = works.find((artwork) => artwork.image?.src)
    const otherWorks = data.SAMPLE_ARTWORKS.filter(
      (artwork) => !collection.artworkIds.includes(artwork.id),
    )

    CASES.push({
      path: `/discover/${collection.id}`,
      expect: collection.title,
      expectAll: [
        collection.description,
        // The count printed in the hero must be the resolved count.
        `${works.length} work${works.length === 1 ? '' : 's'} in this collection`,
        'Works in this collection',
        'Illustrative sample records',
        // The representative work is named as a sample image from the
        // collection, never presented as anything more.
        'A sample image from this collection',
      ],
      expectArtworks: works.map((artwork) => artwork.id),
      forbidArtworks: otherWorks.map((artwork) => artwork.id),
      // Breadcrumb to the directory, and both routes onward.
      expectLinks: ['/collections', '/discover', ...(leadWork ? [] : [])],
      forbidAll: [
        'Curated by',
        'Curator:',
        'Featured collection',
        'Most popular',
        'Best seller',
        'Editor’s pick',
        ...purchasePhrases,
      ],
      forbidPatterns: [currencyPattern],
      // One eager image — the hero band. The grid's first row is lazy here
      // because the hero already carries the opening image.
      expectEagerImages: leadWork ? 1 : 0,
    })
  }

  /*
   * ── The studio model, checked directly ──────────────────────────────────
   * Rules markup cannot demonstrate: that a studio is only ever credited with
   * its own records, that its stand-in image comes from one of them, and that a
   * record missing every optional field renders as text rather than as a link
   * to nowhere or a fabricated name.
   */
  const directoryEntries = studio.buildStudioDirectory()

  check(
    directoryEntries.length === data.SAMPLE_CREATORS.length,
    `studio: the directory lists ${directoryEntries.length} of ${data.SAMPLE_CREATORS.length} creators`,
  )
  check(
    directoryEntries.every((entry) => entry.href === `/artists/${entry.creator.id}`),
    'studio: a directory entry did not link to its own profile route',
  )

  for (const creator of data.SAMPLE_CREATORS) {
    const entry = studio.buildStudioEntry(creator)
    const expectedWorks = data.SAMPLE_ARTWORKS.filter((artwork) => artwork.creatorId === creator.id)

    check(
      entry.works.map((artwork) => artwork.id).join(',') ===
        expectedWorks.map((artwork) => artwork.id).join(','),
      `studio: ${creator.id} does not list exactly its own records, in order`,
    )
    check(
      entry.works.every((artwork) => artwork.creatorId === creator.id),
      `studio: ${creator.id} is credited with somebody else's work`,
    )
    check(
      entry.workCount === expectedWorks.length && entry.hasWorks === expectedWorks.length > 0,
      `studio: ${creator.id} reports the wrong work count`,
    )
    check(
      entry.leadWork ? entry.leadWork.creatorId === creator.id : true,
      `studio: ${creator.id} leads with a work that is not its own`,
    )
    check(entry.practice === creator.discipline, `studio: ${creator.id} lost its practice`)
    check(entry.location === creator.location, `studio: ${creator.id} lost its location`)
    check(entry.illustrative, `studio: ${creator.id} lost its illustrative label`)

    // The page's own facts must line up with the record.
    const facts = studio.buildStudioFacts(entry)
    check(
      facts.some((fact) => fact.label === 'Records in this build' && fact.value.includes(String(entry.workCount))),
      `studio: ${creator.id} does not report its record count as a fact`,
    )
  }

  // Every studio in this build holds at least one record, so the profile's
  // empty state is out of reach from data alone — it is asserted through a
  // synthetic creator instead of being left unverified.
  const worklessCreator = {
    id: 'sample-creator-with-no-work',
    name: 'Unattributed Studio',
    discipline: 'Practice not recorded',
    illustrative: true,
  }
  const workless = studio.buildStudioEntry(worklessCreator)

  check(workless.workCount === 0 && !workless.hasWorks, 'studio: a workless creator reported records')
  check(workless.works.length === 0, 'studio: a workless creator was given records')
  check(workless.leadWork === undefined, 'studio: a workless creator was given a lead image')
  check(workless.location === undefined, 'studio: a missing location was invented')
  check(workless.practiceNote === undefined, 'studio: a missing practice note was invented')

  // A creator with nothing usable at all: no link, no fabricated name.
  const blankCreator = { id: '   ', name: '  ', discipline: '', illustrative: true }
  const blank = studio.buildStudioEntry(blankCreator)

  check(blank.href === undefined, 'studio: a creator without a usable id still produced a link')
  check(
    blank.name === studio.UNNAMED_STUDIO,
    'studio: a creator without a name did not fall back to the neutral label',
  )
  check(blank.practice === undefined, 'studio: a blank practice was reported as a value')
  check(
    studio.studioPracticeLine(blank) === undefined,
    'studio: a blank practice and location still produced a practice line',
  )
  check(
    studio.buildStudioFacts(blank).every((fact) => fact.value !== ''),
    'studio: a fact row was rendered with an empty value',
  )

  /*
   * ── Catalogue behaviour through the page ────────────────────────────────
   * Each case names the exact records it expects, in order, so search, filter,
   * sort, their combinations and the empty state are all really exercised.
   */
  const paintingWorks = ['sample-painting-01', 'sample-painting-02']
  const ALL_IDS = data.SAMPLE_ARTWORKS.map((artwork) => artwork.id)
  const catalogueCasesStart = CASES.length

  CASES.push(
    {
      path: '/discover',
      expect: 'Showing all 6 sample records',
      expectAll: ['All Art', 'Curated order', 'Title: A to Z', 'Artist: A to Z'],
      expectArtworks: ALL_IDS,
      // Nothing is narrowed, so nothing offers to reset.
      forbidAll: ['Clear all'],
      expectEagerImages: 3,
    },
    // Search: title, medium, description, year, discipline and studio fields.
    { path: '/discover?q=Layered', expect: '1 of 6 sample records match', expectArtworks: ['sample-painting-01'] },
    {
      path: '/discover?q=stoneware',
      expect: '2 of 6 sample records match',
      expectArtworks: ['sample-decor-01', 'sample-handmade-01'],
    },
    { path: '/discover?q=balance', expect: '1 of 6 sample records match', expectArtworks: ['sample-painting-02'] },
    { path: '/discover?q=2023', expect: '1 of 6 sample records match', expectArtworks: ['sample-painting-02'] },
    // A creator field, not an artwork field.
    { path: '/discover?q=Oaxaca', expect: '1 of 6 sample records match', expectArtworks: ['sample-handmade-01'] },
    {
      path: '/discover?q=Digital%20Artwork',
      expect: '1 of 6 sample records match',
      expectArtworks: ['sample-digital-01'],
    },
    // Words match independently, so a non-adjacent pair still finds the work.
    {
      path: '/discover?q=ochre%20canvas',
      expect: '1 of 6 sample records match',
      expectArtworks: ['sample-painting-01'],
    },
    // Case and stray whitespace are both irrelevant.
    {
      path: '/discover?q=OCHRE',
      expect: '2 of 6 sample records match',
      expectArtworks: ['sample-painting-01', 'sample-painting-02'],
    },
    {
      path: '/discover?q=%20%20ochre%20%20',
      expect: '2 of 6 sample records match',
      expectArtworks: ['sample-painting-01', 'sample-painting-02'],
    },
    // A query of nothing but spaces is no query at all.
    {
      path: '/discover?q=%20%20',
      expect: 'Showing all 6 sample records',
      expectArtworks: ALL_IDS,
      forbidAll: ['Clear all'],
    },
    // Each discipline, filtered for real.
    { path: '/discover?discipline=painting', expect: '2 of 6 sample records match', expectArtworks: paintingWorks },
    { path: '/discover?discipline=digital', expect: '1 of 6 sample records match', expectArtworks: ['sample-digital-01'] },
    { path: '/discover?discipline=decor', expect: '1 of 6 sample records match', expectArtworks: ['sample-decor-01'] },
    {
      path: '/discover?discipline=handmade',
      expect: '1 of 6 sample records match',
      expectArtworks: ['sample-handmade-01'],
    },
    { path: '/discover?discipline=custom', expect: '1 of 6 sample records match', expectArtworks: ['sample-custom-01'] },
    // Unknown values fall back instead of emptying the catalogue.
    { path: '/discover?discipline=sculpture', expect: 'Showing all 6 sample records', expectArtworks: ALL_IDS },
    { path: '/discover?sort=price-asc', expect: 'Showing all 6 sample records', expectArtworks: ALL_IDS },
    // Search and a discipline together: “light” alone finds three records.
    {
      path: '/discover?q=light',
      expect: '3 of 6 sample records match',
      expectArtworks: ['sample-painting-01', 'sample-digital-01', 'sample-decor-01'],
    },
    {
      path: '/discover?q=light&discipline=painting',
      expect: '1 of 6 sample records match',
      expectArtworks: ['sample-painting-01'],
    },
    // Sorting, in both directions and by artist.
    {
      path: '/discover?sort=title-asc',
      expect: 'Showing all 6 sample records',
      expectArtworks: [
        'sample-digital-01',
        'sample-custom-01',
        'sample-painting-01',
        'sample-painting-02',
        'sample-decor-01',
        'sample-handmade-01',
      ],
    },
    {
      path: '/discover?sort=title-desc',
      expect: 'Showing all 6 sample records',
      expectArtworks: [
        'sample-handmade-01',
        'sample-decor-01',
        'sample-painting-02',
        'sample-painting-01',
        'sample-custom-01',
        'sample-digital-01',
      ],
    },
    {
      path: '/discover?sort=artist-asc',
      expect: 'Showing all 6 sample records',
      expectArtworks: [
        'sample-handmade-01',
        'sample-custom-01',
        'sample-painting-01',
        'sample-painting-02',
        'sample-digital-01',
        'sample-decor-01',
      ],
    },
    // Sorting must not drop an active filter.
    {
      path: '/discover?discipline=painting&sort=title-desc',
      expect: '2 of 6 sample records match',
      expectArtworks: ['sample-painting-02', 'sample-painting-01'],
    },
    {
      path: '/discover?q=light&discipline=digital&sort=title-asc',
      expect: '1 of 6 sample records match',
      expectArtworks: ['sample-digital-01'],
    },
    // Nothing matches: an honest empty state that keeps the controls in place.
    {
      path: '/discover?q=zzzz',
      expect: 'No works match these filters',
      expectAll: [
        '0 of 6 sample records match',
        'None of the 6 illustrative records match “zzzz”.',
        'Clear search and filters',
      ],
      expectArtworks: [],
      expectEagerImages: 0,
    },
    {
      path: '/discover?q=light&discipline=handmade',
      expect: 'No works match these filters',
      expectAll: [
        '0 of 6 sample records match',
        'None of the 6 illustrative records match “light” in the Handmade Products discipline.',
      ],
      expectArtworks: [],
    },
    // Collection pages keep their own works, and only their own.
    {
      path: '/discover/quiet-landscapes',
      expect: 'Quiet Landscapes',
      expectArtworks: ['sample-painting-02', 'sample-painting-01', 'sample-digital-01'],
      forbidArtworks: ['sample-decor-01', 'sample-handmade-01', 'sample-custom-01'],
    },
    {
      path: '/discover/objects-for-living',
      expect: 'Objects for Living',
      expectArtworks: ['sample-handmade-01', 'sample-decor-01', 'sample-custom-01'],
      forbidArtworks: paintingWorks,
    },  )

  const catalogueCasesEnd = CASES.length

  /*
   * ── The collection model, checked directly ──────────────────────────────
   * Rules markup cannot demonstrate: that a count always equals the works that
   * actually resolved, that the representative work is one of the collection's
   * own and has a requestable image, and that a missing id, a missing
   * description or an empty membership degrades instead of breaking.
   */
  const directory = collections.buildCollectionDirectory()

  check(
    directory.length === data.SAMPLE_COLLECTIONS.length,
    `collections: the directory lists ${directory.length} of ${data.SAMPLE_COLLECTIONS.length}`,
  )

  for (const collection of data.SAMPLE_COLLECTIONS) {
    const entry = collections.buildCollectionEntry(collection)
    const resolved = data.SAMPLE_ARTWORKS.filter((artwork) =>
      collection.artworkIds.includes(artwork.id),
    )

    check(
      entry.workCount === entry.works.length && entry.workCount === resolved.length,
      `collections: ${collection.id} reports ${entry.workCount}, resolves ${entry.works.length}, ` +
        `data holds ${resolved.length}`,
    )
    check(
      entry.works.every((artwork) => collection.artworkIds.includes(artwork.id)),
      `collections: ${collection.id} resolved a work it does not hold`,
    )
    check(entry.hasWorks === entry.workCount > 0, `collections: ${collection.id} hasWorks is wrong`)
    check(
      entry.href === `/discover/${collection.id}`,
      `collections: ${collection.id} did not link to its own page`,
    )
    check(
      entry.leadWork ? entry.leadWork.image.src.trim() !== '' : true,
      `collections: ${collection.id} leads with a work that has no image path`,
    )
    check(
      entry.leadWork ? entry.works.some((artwork) => artwork.id === entry.leadWork.id) : true,
      `collections: ${collection.id} leads with a work that is not its own`,
    )
    check(
      collections.leadArtworkFor(collection)?.id === entry.leadWork?.id,
      `collections: ${collection.id} is not represented deterministically`,
    )
    check(entry.summary === collection.summary, `collections: ${collection.id} lost its summary`)
    check(
      entry.description === collection.description,
      `collections: ${collection.id} lost its description`,
    )
  }

  // A collection holding an id with no record: the unknown id is skipped, so
  // the count cannot overstate what the page will render.
  const partlyUnknown = {
    id: 'collection-with-a-missing-work',
    title: 'Partly Resolved',
    summary: 'Summary',
    description: 'Description',
    artworkIds: ['sample-painting-01', 'no-such-artwork', 'sample-painting-02'],
    sample: true,
  }
  const partlyUnknownEntry = collections.buildCollectionEntry(partlyUnknown)

  check(
    partlyUnknownEntry.workCount === 2,
    `collections: an unresolvable artwork id was still counted (${partlyUnknownEntry.workCount})`,
  )
  check(
    partlyUnknownEntry.works.every((artwork) => artwork.id !== 'no-such-artwork'),
    'collections: an unresolvable artwork id reached the works list',
  )

  // A collection whose works carry no usable image: no representative work is
  // offered, but the count is still reported, so the card degrades to text
  // rather than to a broken frame.
  const imagelessCollection = {
    id: 'collection-without-images',
    title: 'Imageless',
    summary: 'Summary',
    description: 'Description',
    artworkIds: ['sample-painting-01'],
    sample: true,
  }
  const originalSrc = data.SAMPLE_ARTWORKS[0].image.src
  data.SAMPLE_ARTWORKS[0].image.src = ''
  const imageless = collections.buildCollectionEntry(imagelessCollection)
  data.SAMPLE_ARTWORKS[0].image.src = originalSrc

  check(
    imageless.leadWork === undefined,
    'collections: a collection whose works have no image still offered a lead work',
  )
  check(
    imageless.workCount === 1 && imageless.hasWorks,
    'collections: an imageless collection lost its work count',
  )
  check(
    collections.buildCollectionEntry(imagelessCollection).leadWork !== undefined,
    'collections: the image check did not restore the dataset',
  )

  // A blank id and blank copy: no link, and nothing reported as a value.
  const blankEntry = collections.buildCollectionEntry({
    id: '   ',
    title: 'No Route',
    summary: '   ',
    description: '',
    artworkIds: [],
    sample: true,
  })

  check(blankEntry.href === undefined, 'collections: a blank id still produced a link')
  check(blankEntry.summary === undefined, 'collections: a blank summary was reported as a value')
  check(
    blankEntry.description === undefined,
    'collections: a blank description was reported as a value',
  )
  check(
    blankEntry.workCount === 0 && !blankEntry.hasWorks && blankEntry.leadWork === undefined,
    'collections: an empty collection did not report itself as empty',
  )

  /*
   * ── The listing draft model, checked directly ───────────────────────────
   * The form itself cannot be driven without a browser, so its behaviour is
   * verified where it lives: the pure draft, validator and reducer that the
   * fields only dispatch into.
   */
  const blankDraft = drafts.emptyListingDraft()

  check(
    Object.values(blankDraft).every((value) => value === ''),
    'drafts: a new draft did not start empty',
  )
  check(
    Object.keys(blankDraft).length === drafts.LISTING_FIELDS.length,
    `drafts: the draft carries ${Object.keys(blankDraft).length} fields, the form defines ${drafts.LISTING_FIELDS.length}`,
  )

  const blankErrors = drafts.validateListingDraft(blankDraft)
  check(
    Object.keys(blankErrors).sort().join(',') === 'description,discipline,imageId,medium,title',
    `drafts: a blank draft reported [${Object.keys(blankErrors).sort().join(', ')}] instead of the five required fields`,
  )
  check(
    !blankErrors.dimensions && !blankErrors.year && !blankErrors.collectionId,
    'drafts: an optional field was treated as required',
  )
  check(
    Object.values(blankErrors).every((message) => message.trim() !== ''),
    'drafts: an error was reported without a message',
  )

  // Every record in the build is a valid starting point for a draft.
  const firstArtwork = data.SAMPLE_ARTWORKS[0]
  const validDraft = drafts.draftFromArtwork(firstArtwork)

  check(
    Object.keys(drafts.validateListingDraft(validDraft)).length === 0,
    `drafts: a draft prepared from ${firstArtwork.id} was reported as incomplete`,
  )

  for (const artwork of data.SAMPLE_ARTWORKS) {
    const prepared = drafts.draftFromArtwork(artwork)
    check(prepared.title === artwork.title, `drafts: ${artwork.id} lost its title`)
    check(prepared.discipline === artwork.category, `drafts: ${artwork.id} lost its discipline`)
    check(prepared.medium === artwork.medium, `drafts: ${artwork.id} lost its medium`)
    check(prepared.year === String(artwork.year), `drafts: ${artwork.id} lost its year`)
    check(prepared.imageId === artwork.id, `drafts: ${artwork.id} did not preselect its own image`)
    check(
      Object.keys(drafts.validateListingDraft(prepared)).length === 0,
      `drafts: a draft prepared from ${artwork.id} was reported as incomplete`,
    )
  }

  // Invalid entries: each one is reported against its own field.
  const invalidCases = [
    [{ title: '   ' }, 'title', 'a whitespace-only title'],
    [{ title: 'ab' }, 'title', 'a two-character title'],
    [{ title: 'x'.repeat(91) }, 'title', 'a 91-character title'],
    [{ discipline: 'not-a-discipline' }, 'discipline', 'an unknown discipline'],
    [{ medium: 'x'.repeat(61) }, 'medium', 'a 61-character medium'],
    [{ dimensions: 'wide' }, 'dimensions', 'dimensions without a measurement'],
    [{ dimensions: `${'x'.repeat(41)}1` }, 'dimensions', 'dimensions beyond the limit'],
    [{ year: '12' }, 'year', 'a two-digit year'],
    [{ year: 'abcd' }, 'year', 'a year that is not a number'],
    [{ year: '1799' }, 'year', 'a year before the range'],
    [{ year: String(drafts.LISTING_YEAR_MAX + 1) }, 'year', 'a year in the future'],
    [{ description: 'too short' }, 'description', 'a description below the minimum'],
    [{ description: 'x'.repeat(601) }, 'description', 'a description beyond the maximum'],
    [{ collectionId: 'no-such-collection' }, 'collectionId', 'an unknown collection'],
    [{ imageId: 'no-such-artwork' }, 'imageId', 'an unknown image'],
  ]

  for (const [patch, field, label] of invalidCases) {
    const errors = drafts.validateListingDraft({ ...validDraft, ...patch })
    check(Boolean(errors[field]), `drafts: ${label} was accepted`)
  }

  // Optional fields may be left blank, and a record with nothing in it must not
  // produce invented values.
  check(
    Object.keys(
      drafts.validateListingDraft({ ...validDraft, dimensions: '', year: '', collectionId: '' }),
    ).length === 0,
    'drafts: blank optional fields made a complete draft invalid',
  )

  const bareDraft = drafts.draftFromArtwork({
    id: 'bare-record',
    title: '',
    category: 'painting',
    medium: '',
    year: Number.NaN,
    dimensions: '',
    description: '',
    image: { src: '', alt: '', width: 0, height: 0 },
    aspect: 'portrait',
    creatorId: '',
    sample: true,
  })

  check(
    bareDraft.title === '' &&
      bareDraft.medium === '' &&
      bareDraft.dimensions === '' &&
      bareDraft.year === '' &&
      bareDraft.imageId === '',
    'drafts: a record without fields produced invented values',
  )
  // The record's discipline is the one field it does carry, so the draft is
  // missing exactly these four.
  check(
    Object.keys(drafts.validateListingDraft(bareDraft)).sort().join(',') ===
      'description,imageId,medium,title',
    `drafts: a record with only a discipline reported [${Object.keys(
      drafts.validateListingDraft(bareDraft),
    )
      .sort()
      .join(', ')}]`,
  )

  // The reducer: editing, resetting, checking and origin switching.
  const newState = drafts.initialListingDraftState({ kind: 'new' })

  check(drafts.listingDraftFilledCount(newState.draft) === 0, 'drafts: a new draft counted fields')
  check(drafts.listingDraftSummary(newState) === undefined, 'drafts: a new draft reported a status')
  check(!drafts.listingDraftIsDirty(newState), 'drafts: an untouched draft reported changes')

  const recordState = drafts.initialListingDraftState({
    kind: 'artwork',
    artworkId: firstArtwork.id,
  })

  check(
    recordState.draft.title === firstArtwork.title,
    'drafts: a record-backed draft did not start from the record',
  )
  check(
    !drafts.listingDraftIsDirty(recordState),
    'drafts: an untouched record-backed draft reported changes',
  )

  const edited = drafts.listingDraftReducer(recordState, {
    type: 'setField',
    field: 'title',
    value: 'A different title',
  })

  check(edited.draft.title === 'A different title', 'drafts: editing did not reach the draft')
  check(drafts.listingDraftIsDirty(edited), 'drafts: an edit was not reported as a change')
  check(
    edited.checked === false && edited.outcome === 'none',
    'drafts: an edit left the previous verdict standing',
  )

  const reset = drafts.listingDraftReducer(edited, { type: 'reset' })

  check(
    reset.draft.title === recordState.draft.title,
    'drafts: reset did not restore the values the draft started from',
  )
  check(!drafts.listingDraftIsDirty(reset), 'drafts: reset left the draft changed')

  const incomplete = drafts.listingDraftReducer(newState, { type: 'check' })

  check(
    incomplete.checked && incomplete.outcome === 'incomplete',
    'drafts: checking an empty draft did not report it incomplete',
  )
  check(
    Object.keys(incomplete.errors).length === 5,
    `drafts: an empty draft reported ${Object.keys(incomplete.errors).length} problems`,
  )

  const completeState = drafts.listingDraftReducer(
    { ...newState, draft: { ...validDraft } },
    { type: 'check' },
  )

  check(
    completeState.outcome === 'complete' && Object.keys(completeState.errors).length === 0,
    'drafts: a complete draft did not check out',
  )
  check(
    drafts.listingDraftSummary(completeState)?.label === 'Every field checks out',
    'drafts: the status did not reflect a passing check',
  )
  check(
    drafts.listingDraftFilledCount(validDraft) === drafts.LISTING_FIELDS.length,
    'drafts: a draft prepared from a full record did not count every field',
  )

  const fixing = drafts.listingDraftReducer(incomplete, {
    type: 'setField',
    field: 'title',
    value: 'Now it has a title',
  })

  check(fixing.errors.title === undefined, 'drafts: an error survived an edit to its own field')
  check(
    Object.keys(fixing.errors).length === 4,
    'drafts: editing one field cleared another field’s error',
  )

  // Reselecting the origin already held keeps the working draft.
  check(
    drafts.listingDraftReducer(edited, {
      type: 'selectOrigin',
      origin: { kind: 'artwork', artworkId: firstArtwork.id },
    }) === edited,
    'drafts: reselecting the same origin discarded the working draft',
  )
  check(
    drafts.listingDraftReducer(edited, { type: 'selectOrigin', origin: { kind: 'new' } }).draft
      .title === '',
    'drafts: switching origin did not start from the new origin',
  )

  // Images: only real records with real files, and nothing from a blank id.
  const imageOptions = drafts.listingImageOptions()

  check(
    imageOptions.length === data.SAMPLE_ARTWORKS.length,
    `drafts: ${imageOptions.length} images are offered for ${data.SAMPLE_ARTWORKS.length} records`,
  )
  check(
    imageOptions.every(
      (option) =>
        option.src.trim() !== '' &&
        option.alt.trim() !== '' &&
        option.width > 0 &&
        option.height > 0 &&
        artworkIds.has(option.id),
    ),
    'drafts: an image option is unusable or points at no record',
  )
  check(drafts.listingDraftImage(blankDraft) === undefined, 'drafts: a blank image id produced an image')
  check(
    drafts.listingDraftImage({ ...blankDraft, imageId: 'no-such-artwork' }) === undefined,
    'drafts: an unknown image id produced an image',
  )
  check(
    drafts.listingDraftImage(validDraft)?.id === firstArtwork.id,
    'drafts: the chosen image did not resolve',
  )

  /*
   * ── The workspace model, checked directly ───────────────────────────────
   * The workspace shows one studio's records and states how complete they are.
   * Both claims are computed here from the raw data and compared with what the
   * model returns, so a figure on screen cannot drift from the catalogue.
   */
  const previewEntry = workspace.getPreviewStudioEntry()

  check(Boolean(previewEntry), 'workspace: the preview studio did not resolve')
  check(
    previewEntry.creator.id === workspace.PREVIEW_STUDIO_ID,
    'workspace: the preview studio is not the record it names',
  )
  check(
    previewEntry.works.length > 0 && previewEntry.workCount === previewEntry.works.length,
    'workspace: the preview studio reported a count that does not match its records',
  )
  check(
    previewEntry.works.every((artwork) => artwork.creatorId === workspace.PREVIEW_STUDIO_ID),
    'workspace: the preview studio was credited with another studio’s work',
  )
  check(
    previewEntry.href === `/artists/${workspace.PREVIEW_STUDIO_ID}`,
    'workspace: the preview studio did not link to its public profile',
  )

  const overview = workspace.buildStudioOverview()

  check(
    overview.catalogueCount === data.SAMPLE_ARTWORKS.length,
    'workspace: the catalogue size is wrong',
  )
  check(
    overview.otherStudioCount === overview.catalogueCount - overview.workCount,
    'workspace: the records attributed to other studios are miscounted',
  )
  check(
    overview.coverage.every((row) => row.total === overview.workCount),
    'workspace: a coverage row counted records the studio does not hold',
  )
  check(
    overview.coverage.every((row) => row.recorded <= row.total),
    'workspace: a coverage row reported more records than it counted',
  )

  const expectedCoverage = {
    Description: (artwork) => Boolean(artwork.description && artwork.description.trim()),
    Medium: (artwork) => Boolean(artwork.medium && artwork.medium.trim()),
    Dimensions: (artwork) => Boolean(artwork.dimensions && artwork.dimensions.trim()),
    Year: (artwork) => typeof artwork.year === 'number' && Number.isFinite(artwork.year),
    Image: (artwork) => Boolean(artwork.image && artwork.image.src && artwork.image.src.trim()),
    'In a collection': (artwork) =>
      data.SAMPLE_COLLECTIONS.some((collection) => collection.artworkIds.includes(artwork.id)),
  }

  for (const row of overview.coverage) {
    const predicate = expectedCoverage[row.label]
    check(Boolean(predicate), `workspace: “${row.label}” is not one of the counted fields`)
    if (!predicate) continue
    const expected = overview.works.filter(predicate).length
    check(
      row.recorded === expected,
      `workspace: ${row.label} reported ${row.recorded}, the data holds ${expected}`,
    )
  }

  for (const section of workspace.STUDIO_SECTIONS) {
    const resolved = resolveInternalLink(section.to)
    check(resolved.ok, `workspace: the “${section.label}” section links nowhere — ${resolved.reason}`)
  }
  check(
    workspace.STUDIO_SECTIONS.length >= 3,
    'workspace: the workspace is missing one of its sections',
  )
  check(
    workspace.ARTIST_WORKFLOW.length === 4 &&
      workspace.ARTIST_WORKFLOW.every((step) => step.title.trim() !== '' && step.text.trim() !== ''),
    'workspace: the workflow is not stated in four complete steps',
  )
  check(
    workspace.WORKSPACE_NOT_INCLUDED.length >= 4 &&
      workspace.WORKSPACE_NOT_INCLUDED.every((line) => line.trim() !== ''),
    'workspace: the list of things this build does not do is incomplete',
  )
  check(
    workspace.WORKSPACE_PREVIEW_NOTICE.startsWith('Frontend preview'),
    'workspace: the preview notice no longer says what this is',
  )

  // The address decides which draft the workspace holds.
  check(
    workspace.originFromPath('/sell/studio/listings/new').kind === 'new' &&
      workspace.originFromPath('/sell/studio/listings').kind === 'new' &&
      workspace.originFromPath('/sell/studio/listings/').kind === 'new' &&
      workspace.originFromPath('/sell/studio/profile').kind === 'new' &&
      workspace.originFromPath('/sell/studio').kind === 'new',
    'workspace: a path without a record id did not start a new draft',
  )

  const recordOrigin = workspace.originFromPath(
    `/sell/studio/listings/${firstArtwork.id}`,
  )
  check(
    recordOrigin.kind === 'artwork' && recordOrigin.artworkId === firstArtwork.id,
    'workspace: a record path did not select that record',
  )

  // A malformed id must not throw — the editor reports it instead.
  let malformedOrigin
  try {
    malformedOrigin = workspace.originFromPath('/sell/studio/listings/%E0%A4%A')
  } catch (error) {
    malformedOrigin = undefined
    check(false, `workspace: a malformed record id threw — ${String(error)}`)
  }
  check(
    Boolean(malformedOrigin) && malformedOrigin.kind === 'artwork',
    'workspace: a malformed record id did not reach the editor for reporting',
  )

  /*
   * ── The seller workspace pages ──────────────────────────────────────────
   * One case per destination, with the workspace's own claims asserted: the
   * preview is labelled, the records shown are the preview studio's own, and
   * nothing anywhere claims a save, an upload, a publication or a sale.
   */
  const previewWorks = previewEntry.works
  const workspaceCasesStart = CASES.length
  const noSaveClaims = [
    'Saved to your account',
    'Saved successfully',
    'Published successfully',
    'Upload complete',
    'Publish listing',
    'Verified seller',
    'Total revenue',
    'Sales this month',
    'Earnings',
  ]

  CASES.push(
    {
      path: '/sell/studio',
      expect: 'Studio workspace',
      expectAll: [
        'Frontend preview',
        'no account, no sign-in and no storage',
        workspace.PREVIEW_STUDIO_NOTE,
        'The studio this preview shows',
        previewEntry.name,
        'What the records carry',
        'not sales, revenue, views or any other measure of a marketplace',
        'Three sections, all of them previews',
        ...workspace.STUDIO_SECTIONS.map((section) => section.label),
        'What this workspace does not do',
        ...workspace.WORKSPACE_NOT_INCLUDED,
      ],
      expectLinks: [
        '/sell/studio/listings',
        '/sell/studio/profile',
        `/artists/${workspace.PREVIEW_STUDIO_ID}`,
      ],
      forbidAll: noSaveClaims,
      forbidPatterns: [currencyPattern],
      minImages: 1,
      expectEagerImages: 0,
    },
    {
      path: '/sell/studio/listings',
      expect: 'Records attributed to',
      expectAll: [
        'Frontend preview',
        'Draft a new listing',
        'Sample record',
        'Prepare a draft from this record',
        'Open the public page',
        'there is no upload, no storage, no availability and no price',
        ...previewWorks.map((artwork) => artwork.title),
      ],
      // The page lists its own records and links to their public pages.
      expectArtworks: previewWorks.map((artwork) => artwork.id),
      expectLinks: [
        '/sell/studio/listings/new',
        ...previewWorks.map((artwork) => `/sell/studio/listings/${artwork.id}`),
      ],
      forbidAll: noSaveClaims,
      forbidPatterns: [currencyPattern],
      expectEagerImages: 0,
    },
    {
      path: '/sell/studio/listings/new',
      expect: 'New listing draft',
      expectAll: [
        'Frontend preview',
        // Every field of the listing model is on the screen.
        ...drafts.LISTING_FIELDS.map((field) => field.label),
        'Not chosen yet',
        'Not in a collection',
        'No image selected',
        'There is no price, availability or publication field here',
        'Nothing is checked until you ask',
      ],
      expectLinks: ['/sell/studio/listings'],
      // A draft with no image chosen renders no image at all — and no empty src.
      maxImages: 0,
      forbidAll: [...noSaveClaims, 'Publish', 'Upload image'],
      forbidPatterns: [currencyPattern],
    },
    {
      path: '/sell/studio/listings/no-such-record',
      expect: 'That record isn’t in this build',
      expectAll: ['No sample record has the id', 'Start a new draft', 'No record matches that id'],
      expectLinks: ['/sell/studio/listings', '/sell/studio/listings/new'],
      maxImages: 0,
      forbidAll: noSaveClaims,
      forbidPatterns: [currencyPattern],
    },
    {
      path: '/sell/studio/profile',
      expect: 'Studio profile preview',
      expectAll: [
        'Frontend preview',
        'What the public profile shows',
        'What a seller would edit',
        'Not built yet',
        'Sample record',
        'Editable profiles arrive with seller accounts',
        previewEntry.name,
        previewEntry.practice,
        previewEntry.location,
        ...previewWorks.map((artwork) => artwork.title),
      ],
      expectArtworks: previewWorks.map((artwork) => artwork.id),
      expectLinks: ['/artists', `/artists/${workspace.PREVIEW_STUDIO_ID}`, '/sell/studio/listings'],
      forbidAll: [...noSaveClaims, 'Verified studio', 'Award-winning', 'Featured artist'],
      forbidPatterns: [currencyPattern],
      expectEagerImages: 0,
    },
  )

  // One case per record the preview studio holds: a draft opens on that
  // record's own values, and the record itself is never modified.
  for (const artwork of previewWorks) {
    CASES.push({
      path: `/sell/studio/listings/${artwork.id}`,
      expect: `Draft from “${artwork.title}”`,
      expectAll: [
        `The fields below start from the sample record “${artwork.title}”`,
        // The record's own field values are what the form starts from.
        `value="${artwork.title}"`,
        `value="${artwork.medium}"`,
        `value="${artwork.dimensions}"`,
        `value="${String(artwork.year)}"`,
        'Back to listings',
        'Nothing is checked until you ask',
      ],
      expectLinks: ['/sell/studio/listings'],
      expectAllAlt: [artwork.image.alt],
      forbidAll: noSaveClaims,
      forbidPatterns: [currencyPattern],
      expectEagerImages: 0,
    })
  }

  const workspaceCasesEnd = CASES.length

  for (const testCase of CASES) {
    routesChecked += 1
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, { initialEntries: [testCase.path] }, createElement(AppRoutes)),
    )

    const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) ?? []
    const h1Text = h1s.map((block) => block.replace(/<[^>]+>/g, '')).join(' ')
    const images = html.match(/<img[^>]*>/g) ?? []

    check(h1s.length === 1, `${testCase.path}: expected exactly one <h1>, found ${h1s.length}`)
    check(
      html.includes(testCase.expect),
      `${testCase.path}: expected marker not found — ${testCase.expect}`,
    )
    check(html.includes('Skip to content'), `${testCase.path}: skip link missing`)
    check(
      html.includes('Where Art Finds Its Universe.') || testCase.path === '/404',
      `${testCase.path}: footer tagline missing from the shared layout`,
    )

    // Alternative text and intrinsic dimensions: no empty alts, no layout shift.
    const missingAlt = images.filter((image) => !/\balt="[^"]+"/.test(image))
    check(
      missingAlt.length === 0,
      `${testCase.path}: ${missingAlt.length} image(s) without descriptive alt text`,
    )
    const missingDimensions = images.filter(
      (image) => !/\bwidth="\d+"/.test(image) || !/\bheight="\d+"/.test(image),
    )
    check(
      missingDimensions.length === 0,
      `${testCase.path}: ${missingDimensions.length} image(s) without width and height`,
    )

    if (typeof testCase.minImages === 'number') {
      check(
        images.length >= testCase.minImages,
        `${testCase.path}: expected at least ${testCase.minImages} image(s), found ${images.length}`,
      )
    }
    if (typeof testCase.maxImages === 'number') {
      check(
        images.length <= testCase.maxImages,
        `${testCase.path}: expected at most ${testCase.maxImages} image(s), found ${images.length}`,
      )
    }
    if (typeof testCase.expectEagerImages === 'number') {
      const eager = images.filter((image) => image.includes('loading="eager"'))
      check(
        eager.length === testCase.expectEagerImages,
        `${testCase.path}: expected ${testCase.expectEagerImages} eager image(s), found ${eager.length}`,
      )
    }

    for (const marker of testCase.expectAll ?? []) {
      check(html.includes(marker), `${testCase.path}: expected content missing — ${marker}`)
    }
    // Every listed alt string must be present on an image, which is how the
    // directory's per-studio lead work is checked.
    for (const alt of testCase.expectAllAlt ?? []) {
      check(
        typeof alt === 'string' && html.includes(`alt="${alt}"`),
        `${testCase.path}: expected an image with alt “${alt}”`,
      )
    }
    for (const marker of testCase.forbidAll ?? []) {
      check(!html.includes(marker), `${testCase.path}: unexpected markup present — ${marker}`)
    }
    for (const link of testCase.expectLinks ?? []) {
      check(
        html.includes(`href="${link}"`),
        `${testCase.path}: expected link to ${link} was not rendered`,
      )
    }

    // Which records the catalogue returned, and in which order.
    if (testCase.expectArtworks) {
      const rendered = renderedArtworkIds(html)
      check(
        rendered.join(' | ') === testCase.expectArtworks.join(' | '),
        `${testCase.path}: expected artworks [${testCase.expectArtworks.join(', ')}] ` +
          `but rendered [${rendered.join(', ')}]`,
      )
    }
    for (const id of testCase.forbidArtworks ?? []) {
      check(
        !renderedArtworkIds(html).includes(id),
        `${testCase.path}: ${id} should not be listed here`,
      )
    }

    // Every internal *navigational* link must resolve to a real destination.
    // Only anchors are checked — image preload tags also carry href assets.
    const hrefs = [
      ...new Set(
        [...html.matchAll(/<a\b[^>]*?href="(\/[^"]*)"/g)].map((match) => match[1]),
      ),
    ]
    for (const href of hrefs) {
      linksChecked += 1
      const result = resolveInternalLink(href)
      check(result.ok, `${testCase.path}: broken internal link ${href} — ${result.reason}`)
    }

    const ids = html.match(/id="([^"]+)"/g) ?? []
    check(
      new Set(ids).size === ids.length,
      `${testCase.path}: duplicate element ids (${ids.length} ids, ${new Set(ids).size} unique)`,
    )

    notes.push(
      `${testCase.path.padEnd(30)} h1:“${h1Text.trim().slice(0, 30)}” img:${String(
        images.length,
      ).padStart(2)} links:${String(hrefs.length).padStart(2)} chars:${html.length}`,
    )
  }

  console.log('\nRoute, link and accessibility checks\n' + '─'.repeat(104))
  for (const note of notes) console.log(note)
  console.log('─'.repeat(104))
  console.log(
    `data layer: ${artworkIds.size} artworks · ${collectionIds.size} collections · ` +
      `${creatorIds.size} creators · ${disciplineCount} disciplines`,
  )
  console.log(
    `catalogue: ${catalogueCasesEnd - catalogueCasesStart} search, filter, sort and empty-state ` +
      `cases (each naming the exact records it expects, in order)`,
  )
  console.log(
    `workspace: ${workspaceCasesEnd - workspaceCasesStart} seller studio cases, plus direct ` +
      `assertions on the collection, draft and workspace models`,
  )

  await server.close()
} catch (error) {
  await server.close()
  console.error('\nVerification could not run:', error)
  process.exit(1)
}

if (failures.length > 0) {
  console.error('─'.repeat(104))
  for (const failure of failures) console.error('✗ ' + failure)
  console.error(`\n${failures.length} assertion(s) failed.`)
  process.exit(1)
}

console.log(
  `✓ ${routesChecked} routes rendered and passed all assertions ` +
    `(${linksChecked} internal links resolved).`,
)
