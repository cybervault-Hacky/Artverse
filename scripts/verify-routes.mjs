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
  const data = await server.ssrLoadModule('/src/data/index.ts')
  const catalogue = await server.ssrLoadModule('/src/utils/catalogue.ts')
  const detail = await server.ssrLoadModule('/src/utils/artworkDetail.ts')
  const studio = await server.ssrLoadModule('/src/utils/studioProfile.ts')

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
    { path: '/collections', expect: 'Groupings, not folders' },
    { path: '/sell', expect: 'Bring your work to a wider room' },
    { path: '/about', expect: 'A marketplace built calmly, in the open' },
    { path: '/search', expect: 'Find a work, a medium or a studio', maxImages: 0 },
    { path: '/search?q=ceramic', expect: 'for “ceramic”', minImages: 1 },
    { path: '/search?q=zzzz', expect: 'No sample records match', maxImages: 0 },
    { path: '/design-system', expect: 'Floating-art prototype' },
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
    },
  )

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
    `catalogue: ${CASES.length - catalogueCasesStart} search, filter, sort and empty-state cases ` +
      `(each naming the exact records it expects, in order)`,
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
