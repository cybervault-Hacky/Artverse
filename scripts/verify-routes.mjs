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
let headingsChecked = 0

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
  const pricing = await server.ssrLoadModule('/src/utils/pricing.ts')
  const provenance = await server.ssrLoadModule('/src/utils/provenance.ts')
  const certificate = await server.ssrLoadModule('/src/utils/certificate.ts')
  const account = await server.ssrLoadModule('/src/utils/account.ts')
  const application = await server.ssrLoadModule('/src/utils/sellerApplication.ts')
  const verification = await server.ssrLoadModule('/src/utils/verification.ts')
  const buyer = await server.ssrLoadModule('/src/utils/buyerJourney.ts')
  const checkoutModel = await server.ssrLoadModule('/src/utils/checkout.ts')
  const orderModel = await server.ssrLoadModule('/src/utils/orders.ts')
  const buyerState = await server.ssrLoadModule('/src/app/buyerState.ts')
  const buyerPages = {
    wishlist: (await server.ssrLoadModule('/src/pages/WishlistPage/WishlistPage.tsx')).WishlistPage,
    cart: (await server.ssrLoadModule('/src/pages/CartPage/CartPage.tsx')).CartPage,
    checkout: (await server.ssrLoadModule('/src/pages/CheckoutPage/CheckoutPage.tsx')).CheckoutPage,
    orders: (await server.ssrLoadModule('/src/pages/OrdersPage/OrdersPage.tsx')).OrdersPage,
  }
  const { CheckoutReview } = await server.ssrLoadModule(
    '/src/components/CheckoutReview/CheckoutReview.tsx',
  )

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
    // The buyer journey: four literal paths, none of them parameterised, all of
    // them reachable without an account.
    // The account previews and the seller application. Literal paths, and the
    // three account screens sit behind one segment so they read as one subject.
    { pattern: /^\/account\/sign-in$/, resolve: () => true, label: 'sign-in preview' },
    { pattern: /^\/account\/create$/, resolve: () => true, label: 'create-account preview' },
    { pattern: /^\/account\/reset$/, resolve: () => true, label: 'password-reset preview' },
    { pattern: /^\/sell\/apply$/, resolve: () => true, label: 'seller application preview' },
    {
      pattern: /^\/sell\/studio\/verification$/,
      resolve: () => true,
      label: 'verification status',
    },
    { pattern: /^\/wishlist$/, resolve: () => true, label: 'saved works' },
    { pattern: /^\/cart$/, resolve: () => true, label: 'cart' },
    { pattern: /^\/checkout$/, resolve: () => true, label: 'checkout preview' },
    { pattern: /^\/orders$/, resolve: () => true, label: 'orders' },
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
    {
      pattern: /^\/sell\/studio\/certificate$/,
      resolve: () => true,
      label: 'seller certificate preview',
    },
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
  /*
   * Words that would invent a history: an ownership chain, an authentication, a
   * signature, an edition, an exhibition. No record in this build carries any of
   * them, so no page may show one.
   */
  const fabricatedProvenance = [
    'Certificate of Authenticity',
    'Provenance verified',
    'Previously owned',
    'Acquired from',
    'Signed by the artist',
    'Edition 1 of',
    'Exhibited at',
    'Gallery history',
  ]
  /*
   * Words that would claim a transaction, a stock position or an account.
   *
   * Phase 10 adds a real cart, a real save control and a checkout preview, so
   * “Add to cart” is no longer in this list — it is now a control that works, and
   * the pages that carry it state what it cannot do. What stays forbidden is the
   * language of a completed sale: nothing has been bought, nothing is in stock,
   * nothing is reserved, and nobody has an account to sign in to.
   */
  /*
   * What an account screen must never claim.
   *
   * There is no account system, no session and no mail service in this build, so
   * none of these sentences can be true anywhere — not on the previews, not in a
   * footer, not in a stray confirmation. The account previews' own links are
   * stripped before the check, so nothing hides behind a legitimate label.
   */
  const signedInClaims = [
    'Signed in',
    'Sign out',
    'Log out',
    'Welcome back',
    'Your account is',
    'Account created',
    'Successfully signed',
    'Email sent',
    'Check your inbox',
    'We have sent',
    'We’ve sent',
    'Reset link',
    'Password updated',
    'Password changed',
    'Session',
    'Application received',
    'Application approved',
    'Application is under review',
    'Documents received',
    'You are verified',
    'Verification complete',
    // The account words themselves. They are checked against the page with the
    // preview links stripped, so a footer link may read “Sign in preview” while
    // a button that simply says “Sign in” is still caught.
    'Sign in',
    'Sign up',
    'Log in',
    'Create an account',
    'My account',
  ]

  const transactionPhrases = [
    'Buy now',
    'Pay now',
    'Proceed to payment',
    'Order placed',
    'Order confirmed',
    'Payment received',
    'Payment successful',
    'Thank you for your order',
    'Your order is on its way',
    'Track your order',
    'Out of stock',
    'Sold out',
    'In stock',
    'Reserved for you',
    'Free shipping',
    'Estimated delivery',
    'Saved to your account',
    'Add to basket',
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
        // The preview state is stated before anything is offered, and the
        // application screen is named as a preview rather than as a sign-up.
        'See the application preview',
        'Verification status',
        'there is no seller account system to sign up to',
      ],
      expectLinks: ['/sell/studio', '/sell/studio/listings', '/artists', '/discover'],
      // No sign-up, no application, no seller claim, no money.
      forbidAll: ['Apply now', 'Verified seller', 'Commission rate'],
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
        // The one amount in the build, and the label that says it belongs to no
        // record. It is shown here rather than on an artwork page on purpose.
        'USD 2,400',
        pricing.ILLUSTRATIVE_PRICE_LABEL,
      ],
    },
    { path: '/404', expect: 'Error 404' },
    // The buyer routes are literal paths: anything below them is not a page.
    { path: '/orders/unknown-order-id', expect: 'Error 404' },
    { path: '/cart/checkout', expect: 'Error 404' },
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
        // Price and provenance: what this record holds, and what it does not.
        'Price and provenance',
        pricing.PRICE_NOT_PROVIDED,
        pricing.PRICE_NOT_PURCHASABLE,
        provenance.NO_PROVENANCE_STATEMENT,
        provenance.AUTHENTICITY_NOT_VERIFIED,
        provenance.NO_DOCUMENTS_NOTE,
        'Attribution',
        'Holding',
        // Phase 10: the two buyer controls, and where they lead.
        'Your list',
        'Add to cart',
        buyer.BUYER_ACTION_NOTE,
        buyer.BUYER_STATE_NOTE,
      ],
      expectLinks: ['/wishlist', '/cart'],
      // The studio links, and the collection trail resolves.
      expectLinks: [
        `/artists/${artwork.creatorId}`,
        ...(primaryCollection ? [`/discover/${primaryCollection.id}`] : []),
      ],
      // Only the related works appear as artwork links — never the work itself.
      expectArtworks: expectedRelated.slice(0, 4),
      forbidAll: [
        ...transactionPhrases,
        `href="/artwork/${artwork.id}"`,
        // Provenance is never invented, for any record.
        ...fabricatedProvenance,
        'Authenticated',
        'Verified authentic',
      ],
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
      forbidAll: [...transactionPhrases, 'Verified seller', 'Verified studio', 'Award-winning'],
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
        ...transactionPhrases,
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
  const priceFields = drafts.LISTING_FIELDS.filter(
    (field) => field.name === 'priceAmount' || field.name === 'priceCurrency',
  )
  check(
    priceFields.length === 2,
    `drafts: expected a price pair in the form, found ${priceFields.length} price field(s)`,
  )
  check(
    drafts.listingDraftFilledCount(validDraft) === drafts.LISTING_FIELDS.length - priceFields.length,
    'drafts: a draft prepared from a record did not count exactly its non-price fields',
  )
  check(
    validDraft.priceAmount === '' && validDraft.priceCurrency === '',
    'drafts: a record-backed draft carried a price the record does not have',
  )

  // The price pair: optional, but never half-filled, and never guessed at.
  const priceCases = [
    [{ priceAmount: '2400' }, 'priceCurrency', 'an amount with no currency'],
    [{ priceCurrency: 'USD' }, 'priceAmount', 'a currency with no amount'],
    [{ priceAmount: '2,400', priceCurrency: 'USD' }, 'priceAmount', 'an amount with a separator'],
    [{ priceAmount: '0', priceCurrency: 'USD' }, 'priceAmount', 'a zero amount'],
    [{ priceAmount: '12.345', priceCurrency: 'USD' }, 'priceAmount', 'three decimal places'],
    [{ priceAmount: 'abc', priceCurrency: 'USD' }, 'priceAmount', 'an amount that is not a number'],
    [{ priceAmount: '2400', priceCurrency: 'usd' }, undefined, 'a lowercase currency code'],
    [{ priceAmount: '2400', priceCurrency: 'USD' }, undefined, 'a complete price'],
    [{ priceAmount: '2400', priceCurrency: 'DOLLARS' }, 'priceCurrency', 'a currency that is not a code'],
  ]
  for (const [patch, field, label] of priceCases) {
    const errors = drafts.validateListingDraft({ ...validDraft, ...patch })
    if (field === undefined) {
      check(
        errors.priceAmount === undefined && errors.priceCurrency === undefined,
        `drafts: ${label} was rejected`,
      )
    } else {
      check(Boolean(errors[field]), `drafts: ${label} was accepted`)
    }
  }
  check(
    Object.keys(drafts.validateListingDraft({
      ...validDraft,
      priceAmount: '',
      priceCurrency: '',
    })).length === 0,
    'drafts: clearing the price made a valid draft invalid',
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
   * ── Price presentation, checked directly ────────────────────────────────
   * The rules are the point here: a price without its currency is not a price,
   * nothing is converted, and a record with no price says so rather than
   * showing a zero, a range or a symbol on its own.
   */
  check(
    data.SAMPLE_ARTWORKS.every((artwork) => artwork.price === undefined),
    'pricing: a sample record carries a price — the catalogue has nothing for sale',
  )
  check(
    data.SAMPLE_ARTWORKS.every((artwork) => !pricing.hasUsablePrice(artwork)),
    'pricing: a sample record was reported as carrying a usable price',
  )
  check(
    data.SAMPLE_ARTWORKS.every((artwork) => pricing.artworkPrice(artwork) === undefined),
    'pricing: a sample record produced a formatted price',
  )

  const usd = pricing.formatPrice({ amount: 2400, currency: 'USD' })
  const inr = pricing.formatPrice({ amount: 2400, currency: 'INR' })
  check(usd?.text === 'USD 2,400', `pricing: USD formatted as “${usd?.text}”`)
  check(inr?.text === 'INR 2,400', `pricing: INR formatted as “${inr?.text}”`)
  check(
    usd.text !== inr.text && usd.text.includes('USD') && inr.text.includes('INR'),
    'pricing: two currencies formatted to the same string — currencies are not interchangeable',
  )
  check(
    !usd.text.includes('$') && !inr.text.includes('₹'),
    'pricing: a price fell back to a currency symbol instead of its code',
  )
  check(usd.amount === '2,400', `pricing: the amount was grouped as “${usd.amount}”`)
  check(
    pricing.formatPrice({ amount: 2400.5, currency: 'usd' })?.text === 'USD 2,400.50',
    'pricing: a part amount was not written to two decimal places, or a lowercase code was rejected',
  )
  check(
    pricing.formatPrice({ amount: 2400, currency: 'usd' })?.code === 'USD',
    'pricing: a currency code was not normalised to uppercase',
  )
  check(Boolean(usd.spoken.includes('USD 2,400')), 'pricing: the spoken form lost the code')

  // Nothing here may be displayed without both halves.
  const unusablePrices = [
    [{ amount: 2400 }, 'a price with no currency'],
    [{ currency: 'USD' }, 'a currency with no amount'],
    [{ amount: Number.NaN, currency: 'USD' }, 'an amount that is not a number'],
    [{ amount: Number.POSITIVE_INFINITY, currency: 'USD' }, 'an infinite amount'],
    [{ amount: 0, currency: 'USD' }, 'a zero amount'],
    [{ amount: -1200, currency: 'USD' }, 'a negative amount'],
    [{ amount: 2400, currency: '' }, 'a blank currency'],
    [{ amount: 2400, currency: 'US' }, 'a two-letter currency'],
    [{ amount: 2400, currency: 'DOLLARS' }, 'a currency that is not a code'],
    [undefined, 'no price at all'],
    [{ amount: '2,400', currency: 'USD' }, 'an amount with a thousands separator typed in'],
    [{ amount: '2400.555', currency: 'USD' }, 'an amount with three decimal places'],
    [{ amount: '12,00', currency: 'USD' }, 'an amount in a comma decimal style'],
  ]
  for (const [value, label] of unusablePrices) {
    check(pricing.formatPrice(value) === undefined, `pricing: ${label} was formatted`)
  }

  check(
    pricing.parsePriceAmount('2400') === 2400 && pricing.parsePriceAmount('2400.50') === 2400.5,
    'pricing: a plain amount was not parsed',
  )
  check(
    pricing.parsePriceAmount('2 400') === undefined && pricing.parsePriceAmount('£2400') === undefined,
    'pricing: a separator or symbol was silently stripped',
  )
  check(
    pricing.priceAmountError('2400') === undefined &&
      pricing.priceAmountError('') === undefined &&
      Boolean(pricing.priceAmountError('2,400')) &&
      Boolean(pricing.priceAmountError('2400.555')),
    'pricing: the typed-amount messages do not match the parsing rules',
  )

  // The one amount in the build belongs to the design-system page alone.
  check(
    pricing.ILLUSTRATIVE_PRICE.currency === 'USD' && pricing.ILLUSTRATIVE_PRICE.amount === 2400,
    'pricing: the illustrative amount changed shape',
  )
  check(
    data.SAMPLE_ARTWORKS.every(
      (artwork) =>
        artwork.price?.amount !== pricing.ILLUSTRATIVE_PRICE.amount ||
        artwork.price?.currency !== pricing.ILLUSTRATIVE_PRICE.currency,
    ),
    'pricing: the illustrative amount is attached to a record',
  )
  check(
    /[Nn]o record/.test(pricing.ILLUSTRATIVE_PRICE_LABEL),
    'pricing: the illustrative amount is not labelled as belonging to no record',
  )

  /*
   * ── Provenance and attribution, checked directly ────────────────────────
   * What the section may and may not say, for every record in the catalogue.
   */
  for (const artwork of data.SAMPLE_ARTWORKS) {
    const creator = data.SAMPLE_CREATORS.find((entry) => entry.id === artwork.creatorId)
    const detail = provenance.buildProvenance(artwork, creator)

    check(
      detail.statementMissing && detail.statement === undefined,
      `provenance: ${artwork.id} claimed a provenance statement it does not carry`,
    )
    check(
      detail.rows.some((row) => row.label === 'Attribution'),
      `provenance: ${artwork.id} has no attribution row`,
    )
    check(
      detail.rows.some((row) => row.label === 'Authenticity'),
      `provenance: ${artwork.id} does not distinguish attribution from authenticity`,
    )
    check(
      detail.rows.some((row) => row.label === 'Verification' || row.label === 'Documents'),
      `provenance: ${artwork.id} does not state what is not held`,
    )

    const attribution = detail.rows.find((row) => row.label === 'Attribution')
    if (creator) {
      check(
        attribution.links?.[0]?.to === `/artists/${creator.id}`,
        `provenance: ${artwork.id} did not attribute the work to its own creator record`,
      )
    } else {
      check(
        attribution.value === provenance.NO_ATTRIBUTION && !attribution.links,
        `provenance: ${artwork.id} attributed the work to a creator that does not exist`,
      )
    }

    const holding = detail.rows.find((row) => row.label === 'Holding')
    const expectedHoldings = data.SAMPLE_COLLECTIONS.filter((collection) =>
      collection.artworkIds.includes(artwork.id),
    )
    check(
      expectedHoldings.length > 0
        ? holding.links?.length === expectedHoldings.length
        : holding.value === 'Not part of any collection in this build.',
      `provenance: ${artwork.id} did not state its holding from the collection relationship`,
    )
  }

  // A record that genuinely carries a statement shows it verbatim, with its
  // source — and no "not provided" line is invented around it.
  const statedRecord = {
    ...data.SAMPLE_ARTWORKS[0],
    provenance: { statement: 'Held in the studio since it was made.', source: 'Sample source note.' },
  }
  const statedDetail = provenance.buildProvenance(
    statedRecord,
    data.SAMPLE_CREATORS.find((entry) => entry.id === statedRecord.creatorId),
  )
  check(
    statedDetail.statement === 'Held in the studio since it was made.' &&
      statedDetail.source === 'Sample source note.' &&
      !statedDetail.statementMissing,
    'provenance: a statement the record carries was not shown as written',
  )

  const blankStatement = provenance.buildProvenance(
    { ...data.SAMPLE_ARTWORKS[0], provenance: { statement: '   ', source: '  ' } },
    undefined,
  )
  check(
    blankStatement.statementMissing && blankStatement.source === undefined,
    'provenance: a blank statement was treated as a value',
  )
  check(
    blankStatement.rows[0].value === provenance.NO_ATTRIBUTION,
    'provenance: a record without a creator did not say so',
  )
  check(
    /not a claim about the work|Nothing about where it has been/.test(provenance.NO_PROVENANCE_STATEMENT),
    'provenance: the missing-statement line no longer states that nothing is claimed',
  )

  /*
   * ── The certificate preview, checked directly ───────────────────────────
   * The document cannot be issued by anything in this build, and these are the
   * assertions that keep it that way.
   */
  check(
    certificate.CERTIFICATE_STATUS === 'Preview — Not Issued',
    `certificate: the status reads “${certificate.CERTIFICATE_STATUS}”`,
  )
  check(
    certificate.CERTIFICATE_TITLE === 'Seller Verification Certificate',
    'certificate: the document is no longer titled precisely',
  )
  check(
    /No certificate has been issued/.test(certificate.CERTIFICATE_NOT_ISSUED),
    'certificate: the preview does not state that nothing has been issued',
  )
  check(
    /No code is generated/.test(certificate.CERTIFICATE_QR_NOTE) &&
      /nothing is scannable/.test(certificate.CERTIFICATE_QR_NOTE),
    'certificate: the code space is not described as empty',
  )

  const blankFields = certificate.certificateFields()
  check(
    blankFields.length === 4,
    `certificate: ${blankFields.length} fields, expected 4`,
  )
  check(
    blankFields.every((field) => field.placeholder && certificate.isPlaceholderValue(field.value)),
    'certificate: an empty preview did not show every field as a placeholder',
  )
  check(
    blankFields.every((field) => /[Cc]ertificate|Assigned|Set on the day of issue|A studio name is optional/.test(field.note) || field.note.length > 20),
    'certificate: a field was rendered without its explanation',
  )

  const typedFields = certificate.certificateFields({
    recipient: 'A person who does not exist',
    studio: 'A studio that does not exist',
  })
  const typedRecipient = typedFields.find((field) => field.id === 'certificate-recipient')
  const typedStudio = typedFields.find((field) => field.id === 'certificate-studio')
  check(
    typedRecipient?.value === 'A person who does not exist' && !typedRecipient.placeholder,
    'certificate: a typed recipient name did not reach the template',
  )
  check(
    typedStudio?.value === 'A studio that does not exist' && !typedStudio.placeholder,
    'certificate: a typed studio name did not reach the template',
  )

  // Two lines can never be filled in from the page, however it is used.
  for (const entry of [{}, { recipient: 'Someone', studio: 'Something' }]) {
    const fields = certificate.certificateFields(entry)
    const id = fields.find((field) => field.id === 'certificate-id')
    const date = fields.find((field) => field.id === 'certificate-date')
    check(
      id?.placeholder && id.value === certificate.CERTIFICATE_ID_PLACEHOLDER,
      'certificate: a certificate id was generated for the preview',
    )
    check(
      date?.placeholder && date.value === certificate.CERTIFICATE_DATE_PLACEHOLDER,
      'certificate: an issue date was generated for the preview',
    )
    check(
      !/\d{4}/.test(id.value) && !/\d{4}/.test(date.value),
      'certificate: an identifier or a date is present in the preview',
    )
  }

  check(
    certificate.isPlaceholderValue('[Certificate ID]') &&
      !certificate.isPlaceholderValue('Alison') &&
      !certificate.isPlaceholderValue('[unterminated'),
    'certificate: the placeholder check does not match the bracket convention',
  )

  /*
   * ── The account previews, checked directly ──────────────────────────────
   * Three forms with no account system behind them. What is asserted here is
   * mostly the shape of the absence: nothing is transmitted, nothing is stored,
   * a password is never checked against a credential, and no outcome in the
   * model can mean signed in, created or sent.
   */
  check(
    /no account system/i.test(account.ACCOUNT_PREVIEW_NOTICE) &&
      /checked in your browser/i.test(account.ACCOUNT_PREVIEW_NOTICE),
    'account: the preview notice no longer says what the screens are',
  )
  check(
    /Do not enter a real password/.test(account.ACCOUNT_CREDENTIAL_WARNING),
    'account: the password warning does not tell anybody to avoid a real credential',
  )

  // Each form holds exactly its own fields, and only the create form pairs one.
  check(
    account.accountFields('signIn').map((field) => field.name).join() === 'email,password',
    'account: the sign-in form no longer holds an email and a password',
  )
  check(
    account.accountFields('create').map((field) => field.name).join() ===
      'displayName,email,password,confirmPassword',
    'account: the create form has changed shape',
  )
  check(
    account.accountFields('reset').map((field) => field.name).join() === 'email',
    'account: the reset request asks for more than an address',
  )
  check(
    !account.accountFormHasPassword('reset') &&
      account.accountFormHasPassword('signIn') &&
      account.accountFormHasPassword('create'),
    'account: the reset request shows a password field, or a sign-in form lost its own',
  )
  const createPasswords = account.accountFields('create').filter((field) => field.type === 'password')
  check(
    createPasswords.length === 2 &&
      createPasswords.filter((field) => field.pairsWith).length === 1 &&
      createPasswords.find((field) => field.pairsWith)?.name === 'confirmPassword' &&
      createPasswords.find((field) => field.pairsWith)?.pairsWith === 'password' &&
      !account.accountFields('signIn').some((field) => field.pairsWith),
    'account: the password pairing rule is attached to the wrong form or the wrong field',
  )

  // Validation: real, shape-only, and it reports rather than discards.
  const blankSignIn = account.validateAccountForm('signIn', account.emptyAccountForm())
  check(
    Boolean(blankSignIn.email) && Boolean(blankSignIn.password),
    'account: an empty sign-in form was accepted',
  )
  check(
    Boolean(account.validateAccountForm('signIn', { ...account.emptyAccountForm(), email: 'not-an-address' }).email),
    'account: an address that is not an email was accepted',
  )
  check(
    Boolean(
      account.validateAccountForm('signIn', {
        ...account.emptyAccountForm(),
        email: 'someone@example.com',
        password: 'short',
      }).password,
    ),
    `account: a password under ${account.ACCOUNT_PASSWORD_MIN_LENGTH} characters was accepted`,
  )

  const goodSignIn = {
    ...account.emptyAccountForm(),
    email: 'someone@example.com',
    password: 'a-made-up-value',
  }
  check(
    Object.keys(account.validateAccountForm('signIn', goodSignIn)).length === 0,
    'account: a complete sign-in form was rejected',
  )

  const mismatched = {
    ...goodSignIn,
    displayName: 'A Seller',
    confirmPassword: 'a-different-value',
  }
  check(
    Boolean(account.validateAccountForm('create', mismatched).confirmPassword),
    'account: two different password entries were accepted',
  )
  const matched = { ...mismatched, confirmPassword: 'a-made-up-value' }
  check(
    Object.keys(account.validateAccountForm('create', matched)).length === 0,
    'account: a complete create form was rejected',
  )
  check(
    Object.keys(account.validateAccountForm('reset', { ...account.emptyAccountForm(), email: 'someone@example.com' })).length === 0,
    'account: a complete reset request was rejected',
  )
  check(
    !account.validateAccountForm('create', matched).password &&
      !account.validateAccountForm('create', matched).email,
    'account: a valid entry reported an error it should not have',
  )

  /*
   * The reducer: values are kept, errors are cleared as they are fixed, and the
   * outcome can only ever be none, invalid or valid — never a success.
   */
  let accountState = account.initialAccountState('signIn')
  check(
    accountState.outcome === 'none' && accountState.checked === false,
    'account: the sign-in preview does not start unchecked',
  )
  const outcomes = new Set(['none', 'invalid', 'valid'])
  for (const [key, value] of Object.entries(accountState)) {
    if (key !== 'form' && typeof value === 'string') {
      check(outcomes.has(value), `account: the state holds the unexpected outcome “${value}”`)
    }
  }

  accountState = account.accountFormReducer(accountState, { type: 'check' })
  check(
    accountState.outcome === 'invalid' && Object.keys(accountState.errors).length === 2,
    'account: checking an empty form did not report both fields',
  )

  accountState = account.accountFormReducer(accountState, {
    type: 'setField',
    field: 'email',
    value: 'someone@example.com',
  })
  check(
    accountState.errors.email === undefined && accountState.outcome === 'none',
    'account: editing a field left its old error or a stale verdict standing',
  )
  check(
    accountState.values.email === 'someone@example.com',
    'account: editing a field did not keep the value',
  )

  accountState = account.accountFormReducer(accountState, {
    type: 'setField',
    field: 'password',
    value: 'a-made-up-value',
  })
  accountState = account.accountFormReducer(accountState, { type: 'check' })
  check(
    accountState.outcome === 'valid' && Object.keys(accountState.errors).length === 0,
    'account: a complete form did not pass its own check',
  )
  check(
    /Nothing was sent anywhere/.test(account.ACCOUNT_VALIDATED_NOTE) &&
      /no session, account or message was created/.test(account.ACCOUNT_VALIDATED_NOTE),
    'account: the passing message claims more than a browser-side check',
  )
  check(
    account.accountFormReducer(accountState, { type: 'clear' }).values.password === '',
    'account: clearing the form left a value behind',
  )
  check(
    /preview/i.test(account.ACCOUNT_SUBMIT_LABELS.signIn) === false &&
      !/^sign in$/i.test(account.ACCOUNT_SUBMIT_LABELS.signIn),
    'account: the sign-in action promises a sign-in',
  )
  for (const link of account.accountCrossLinks('signIn')) {
    check(
      /preview/i.test(link.label),
      `account: the cross-link “${link.label}” does not say preview`,
    )
  }
  check(
    account.passwordInputType(false) === 'password' &&
      account.passwordInputType(true) === 'text' &&
      account.passwordToggleLabel(false) === 'Show password' &&
      account.passwordToggleLabel(true) === 'Hide password',
    'account: the password visibility control does not say which way round it is',
  )

  /*
   * ── The seller application, checked directly ────────────────────────────
   * Real validation, no document fields, and a read-back rather than a
   * confirmation.
   */
  const applicationFieldNames = application.APPLICATION_FIELDS.map((field) => field.name)
  check(
    applicationFieldNames.length === 6,
    `application: ${applicationFieldNames.length} fields, expected 6`,
  )
  check(
    !applicationFieldNames.some((name) => /document|passport|licence|license|tax|bank|id$/i.test(name)),
    'application: the form asks for an identity or financial document',
  )
  check(
    application.APPLICATION_FIELDS.some((field) => field.name === 'guidelines' && field.type === 'checkbox'),
    'application: the acknowledgement is no longer a checkbox',
  )
  check(
    /No identity document/.test(application.APPLICATION_NO_DOCUMENTS),
    'application: the page no longer says that no document is asked for',
  )

  const blankApplication = application.emptyApplication()
  const blankApplicationErrors = application.validateApplication(blankApplication)
  check(
    Object.keys(blankApplicationErrors).length === 5,
    `application: an empty form reported ${Object.keys(blankApplicationErrors).length} problems, expected 5`,
  )
  check(
    blankApplicationErrors.portfolioUrl === undefined,
    'application: an empty optional portfolio address was rejected',
  )

  const filledApplication = {
    ...blankApplication,
    studioName: 'A Studio That Does Not Exist',
    contactEmail: 'studio@example.com',
    discipline: data.SAMPLE_DISCIPLINES[0].id,
    description: 'A sentence long enough to describe a practice that does not exist either.',
    guidelines: 'yes',
  }
  check(
    Object.keys(application.validateApplication(filledApplication)).length === 0,
    'application: a complete application was rejected',
  )
  check(
    Boolean(application.validateApplication({ ...filledApplication, discipline: 'sculpture' }).discipline),
    'application: a discipline outside the catalogue was accepted',
  )
  check(
    Boolean(application.validateApplication({ ...filledApplication, portfolioUrl: 'example.com' }).portfolioUrl),
    'application: a portfolio address without a scheme was accepted',
  )
  check(
    application.validateApplication({ ...filledApplication, portfolioUrl: '' }).portfolioUrl === undefined,
    'application: clearing the optional address made the form invalid',
  )
  check(
    Boolean(application.validateApplication({ ...filledApplication, guidelines: '' }).guidelines),
    'application: an application without the acknowledgement was accepted',
  )
  check(
    Boolean(
      application.validateApplication({
        ...filledApplication,
        description: 'Too short.',
      }).description,
    ),
    'application: a description under the stated minimum was accepted',
  )
  check(
    Boolean(
      application.validateApplication({
        ...filledApplication,
        studioName: 'x'.repeat(application.APPLICATION_LIMITS.studioNameMax + 1),
      }).studioName,
    ),
    'application: a name over the stated maximum was accepted',
  )

  // The read-back: every row is the form's own contents, and an empty optional
  // field is stated rather than left blank.
  const previewRows = application.applicationPreview(filledApplication)
  check(
    previewRows.length === 6 && previewRows.every((row) => row.value !== ''),
    'application: the read-back lost a row or left a value blank',
  )
  check(
    previewRows.some((row) => row.value === data.categoryLabel(data.SAMPLE_DISCIPLINES[0].id)),
    'application: the read-back does not name the chosen discipline',
  )
  check(
    application.applicationPreview(blankApplication).find((row) => row.label === 'Portfolio or website')
      ?.value === 'Not provided',
    'application: an empty optional field is not stated as absent',
  )
  check(
    /submitted nowhere/i.test(application.APPLICATION_PREVIEW_LABEL),
    'application: the read-back is not labelled as belonging to the form',
  )
  check(
    /Nothing has been received/.test(application.APPLICATION_NO_SUBMISSION),
    'application: the page stopped saying that nothing was received',
  )

  let applicationState = application.initialApplicationState()
  check(
    applicationState.outcome === 'none',
    'application: the form does not start unchecked',
  )
  applicationState = application.applicationReducer(applicationState, { type: 'check' })
  check(
    applicationState.outcome === 'invalid',
    'application: an empty application passed its check',
  )
  applicationState = application.applicationReducer(applicationState, {
    type: 'setField',
    field: 'studioName',
    value: 'A Studio',
  })
  check(
    applicationState.values.studioName === 'A Studio' &&
      applicationState.outcome === 'none' &&
      applicationState.errors.studioName === undefined,
    'application: editing a field did not clear its error or the last verdict',
  )
  check(
    application.applicationReducer(applicationState, { type: 'clear' }).values.studioName === '',
    'application: clearing the form left a value behind',
  )
  check(
    application.APPLICATION_BLOCKERS.length >= 5,
    'application: the list of what a real application needs has shrunk',
  )

  /*
   * ── Verification, checked directly ──────────────────────────────────────
   * The five states are definitions; the state of every studio in the build is
   * derived, and it is never verified.
   */
  check(
    verification.VERIFICATION_STAGES.map((stage) => stage.id).join() ===
      'not-started,information-needed,under-review,verified,action-required',
    'verification: the five states have changed',
  )
  check(
    verification.VERIFICATION_STAGES.every(
      (stage) => stage.meaning.length > 30 && stage.next.length > 20 && stage.label.length > 3,
    ),
    'verification: a state is listed without saying what it means or what moves it on',
  )
  check(
    data.SAMPLE_CREATORS.every((creator) => verification.isVerified(creator) === false),
    'verification: a sample studio was reported as verified',
  )
  for (const creator of data.SAMPLE_CREATORS) {
    const standing = verification.sellerVerification(creator.id)
    check(
      standing.stage.id === 'not-started' && standing.verified === false,
      `verification: ${creator.id} is not reported as “not started”`,
    )
    check(
      standing.basis.includes('no application'),
      `verification: ${creator.id} has no explanation for its state`,
    )
  }
  check(
    verification.sellerVerification('no-such-studio').verified === false &&
      verification.sellerVerification('no-such-studio').basis.includes('not in the sample data'),
    'verification: an unknown studio id did not degrade to an honest answer',
  )
  check(
    /^None of the 5 illustrative studios in this build/.test(verification.verificationSummaryLine()) &&
      /no application system/.test(verification.verificationSummaryLine()),
    'verification: the summary line does not report that nothing is verified',
  )
  check(
    verification.TRUST_DISTINCTIONS.map((group) => group.id).join() ===
      'illustrative,actual,absent',
    'verification: the three kinds of statement are no longer distinguished',
  )
  check(
    verification.TRUST_DISTINCTIONS.every((group) => group.items.length >= 3 && group.text.length > 30),
    'verification: a kind of statement is listed without its own explanation',
  )
  check(
    !verification.VERIFICATION_STAGES.some((stage) => /\d{4}/.test(stage.meaning)),
    'verification: a date appears among the definitions',
  )
  check(
    /Preview — Not Issued/.test(verification.CERTIFICATE_DESIGN_VS_ISSUED) &&
      /design preview/.test(verification.CERTIFICATE_DESIGN_VS_ISSUED),
    'verification: the certificate paragraph does not keep design and issuance apart',
  )

  /* The certificate preview is reused, never rebuilt: one implementation, one
     status, and no second copy of its placeholders. */
  check(
    certificate.CERTIFICATE_STATUS === 'Preview — Not Issued',
    'certificate: the status is no longer fixed at “Preview — Not Issued”',
  )
  const verificationHtml = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: ['/sell/studio/verification'] },
      createElement(AppRoutes),
    ),
  )
  check(
    verificationHtml.includes('href="/sell/studio/certificate"'),
    'verification: the page does not link to the certificate preview',
  )
  check(
    !verificationHtml.includes(certificate.CERTIFICATE_ID_PLACEHOLDER) &&
      !verificationHtml.includes(certificate.CERTIFICATE_DATE_PLACEHOLDER) &&
      !verificationHtml.includes(certificate.CERTIFICATE_QR_LABEL),
    'verification: the page draws a second copy of the certificate',
  )
  check(
    verificationHtml.includes(certificate.CERTIFICATE_STATUS),
    'verification: the page does not carry the certificate’s own status wording',
  )
  check(
    !/<svg|<img|<canvas/.test(verificationHtml.replace(/<svg[^>]*aria-hidden[\s\S]*?<\/svg>/g, '')) ||
      !verificationHtml.includes(certificate.CERTIFICATE_QR_LABEL),
    'verification: a graphic appeared where the certificate placeholders belong',
  )

  /*
   * ── The buyer journey, checked directly ─────────────────────────────────
   * The saved list and the cart are the only state Phase 10 adds, and every
   * promise the pages make is checked here against the model the pages use:
   * a save and a cart add are idempotent, a work the catalogue does not hold can
   * never be stored, a figure is only ever produced from complete prices in one
   * currency, and no checkout state can represent a placed order.
   */
  const firstId = data.SAMPLE_ARTWORKS[0].id
  const secondId = data.SAMPLE_ARTWORKS[1].id

  const emptyJourney = buyer.EMPTY_BUYER_JOURNEY
  check(
    emptyJourney.savedIds.length === 0 && emptyJourney.cartIds.length === 0,
    'buyer: the starting state is not empty',
  )

  const savedOnce = buyer.buyerJourneyReducer(emptyJourney, { type: 'save', artworkId: firstId })
  check(savedOnce.savedIds.join() === firstId, 'buyer: saving a work did not add it')
  check(
    buyer.buyerJourneyReducer(savedOnce, { type: 'save', artworkId: firstId }) === savedOnce,
    'buyer: saving the same work twice changed the list',
  )
  const cartedOnce = buyer.buyerJourneyReducer(emptyJourney, { type: 'addToCart', artworkId: firstId })
  check(cartedOnce.cartIds.join() === firstId, 'buyer: adding a work did not put it in the cart')
  check(
    buyer.buyerJourneyReducer(cartedOnce, { type: 'addToCart', artworkId: firstId }) === cartedOnce,
    'buyer: adding the same work twice changed the cart',
  )
  check(
    emptyJourney.savedIds.length === 0 && emptyJourney.cartIds.length === 0,
    'buyer: the reducer mutated the state it was handed',
  )

  // Nothing the catalogue does not hold may be stored, whatever a control sends.
  for (const junk of ['no-such-work', '', '   ', 42, null, undefined, {}, []]) {
    for (const type of ['save', 'addToCart']) {
      const result = buyer.buyerJourneyReducer(emptyJourney, { type, artworkId: junk })
      check(
        result.savedIds.length === 0 && result.cartIds.length === 0,
        `buyer: ${String(junk)} was accepted by ${type}`,
      )
    }
  }

  const toggled = buyer.buyerJourneyReducer(savedOnce, { type: 'toggleSaved', artworkId: firstId })
  check(toggled.savedIds.length === 0, 'buyer: toggling a saved work did not unsave it')
  const unsaved = buyer.buyerJourneyReducer(savedOnce, { type: 'unsave', artworkId: secondId })
  check(unsaved.savedIds.join() === firstId, 'buyer: unsaving a work that was not saved changed the list')
  const bothCart = buyer.buyerJourneyReducer(cartedOnce, { type: 'addToCart', artworkId: secondId })
  check(bothCart.cartIds.length === 2, 'buyer: a second work was not added to the cart')
  check(
    buyer.buyerJourneyReducer(bothCart, { type: 'removeFromCart', artworkId: firstId }).cartIds.join() ===
      secondId,
    'buyer: removing a cart line did not take that work out',
  )
  check(
    buyer.buyerJourneyReducer(bothCart, { type: 'emptyCart' }).cartIds.length === 0,
    'buyer: emptying the cart left something in it',
  )
  check(
    buyer.buyerJourneyReducer(unsaved, { type: 'emptyCart' }).cartIds.length === 0 &&
      buyer.buyerJourneyReducer(unsaved, { type: 'emptyCart' }).savedIds.join() === firstId,
    'buyer: emptying the cart touched the saved list',
  )

  // Malformed lists degrade instead of throwing.
  check(buyer.normaliseIdList([firstId, firstId, '', 7, null]).join() === firstId,
    'buyer: a malformed id list did not normalise to its usable ids')
  check(buyer.normaliseIdList('not-a-list').length === 0, 'buyer: a non-array id list was accepted')
  check(buyer.normaliseIdList(undefined).length === 0, 'buyer: undefined was accepted as an id list')
  check(buyer.resolveArtworks(['no-such-work', firstId]).length === 1,
    'buyer: an unknown id resolved to something')
  check(buyer.resolveArtworks(42).length === 0, 'buyer: a number resolved to a record')
  check(
    buyer.savedArtworks({ savedIds: [firstId, 'no-such-work'], cartIds: [] }).length === 1,
    'buyer: a saved list with a stale id did not degrade to the records that exist',
  )

  /* The cart's total: one way to have a figure, four honest ways not to. */
  const emptyTotal = buyer.cartTotal([])
  check(emptyTotal.kind === 'empty', `buyer: an empty cart reported “${emptyTotal.kind}”`)
  check(emptyTotal.groups.length === 0, 'buyer: an empty cart produced a subtotal')

  const unpricedTotal = buyer.cartTotal(data.SAMPLE_ARTWORKS)
  check(
    unpricedTotal.kind === 'unpriced' && unpricedTotal.pricedCount === 0,
    `buyer: the catalogue's own cart reported “${unpricedTotal.kind}” — it must have no figure at all`,
  )
  check(
    unpricedTotal.unpricedCount === data.SAMPLE_ARTWORKS.length &&
      unpricedTotal.groups.length === 0,
    'buyer: a cart of unpriced works produced a group',
  )

  const pricedWork = (amount, currency) => ({
    ...data.SAMPLE_ARTWORKS[0],
    price: { amount, currency },
  })
  const usdComplete = buyer.cartTotal([pricedWork(2400, 'USD'), pricedWork(600, 'USD')])
  check(
    usdComplete.kind === 'complete' && usdComplete.groups.length === 1,
    `buyer: two priced works in one currency reported “${usdComplete.kind}”`,
  )
  check(
    usdComplete.groups[0].subtotal.text === 'USD 3,000',
    `buyer: the subtotal is ${usdComplete.groups[0]?.subtotal.text}, expected USD 3,000`,
  )
  check(
    usdComplete.groups[0].subtotal.value === 3000,
    'buyer: the subtotal does not carry the number it printed',
  )

  const mixedCart = buyer.cartTotal([pricedWork(2400, 'USD'), pricedWork(600, 'INR')])
  check(mixedCart.kind === 'mixed', `buyer: a two-currency cart reported “${mixedCart.kind}”`)
  check(
    mixedCart.groups.map((group) => group.subtotal.text).join(' | ') === 'USD 2,400 | INR 600',
    `buyer: the mixed cart's groups are ${mixedCart.groups.map((group) => group.subtotal.text).join(' | ')}`,
  )
  check(
    !mixedCart.message.includes('3,000') && /never added together|does not treat currencies/.test(mixedCart.message),
    'buyer: a mixed-currency cart adds its currencies together',
  )

  const partialCart = buyer.cartTotal([pricedWork(2400, 'USD'), data.SAMPLE_ARTWORKS[1]])
  check(partialCart.kind === 'partial', `buyer: a half-priced cart reported “${partialCart.kind}”`)
  check(
    partialCart.groups[0].subtotal.text === 'USD 2,400' && partialCart.unpricedCount === 1,
    'buyer: a half-priced cart did not separate what it can and cannot total',
  )
  check(
    /no complete total/.test(partialCart.message),
    'buyer: a partial subtotal is not described as incomplete',
  )

  // The default a visitor actually meets: two sample records, no price anywhere.
  const realCart = buyer.cartTotal(data.SAMPLE_ARTWORKS.slice(0, 2))
  check(
    realCart.kind === 'unpriced' && realCart.heading === 'A total cannot be shown',
    `buyer: the sample cart reports “${realCart.kind}”`,
  )
  check(
    pricing.formatPrice({ amount: 2400, currency: 'USD' }).value === 2400,
    'buyer: a formatted price does not carry the value its subtotal would add',
  )

  /* The checkout model: what it asks for, what it refuses, and what it keeps. */
  check(
    checkoutModel.CHECKOUT_STAGES.map((stage) => stage.id).join() === 'contact,delivery,review',
    'checkout: the sections are no longer contact, delivery, review',
  )
  check(
    !checkoutModel.CHECKOUT_FIELDS.some((field) =>
      /card|cvv|cvc|expiry|iban|wallet|account/i.test(`${field.name} ${field.label}`),
    ),
    'checkout: the form describes a payment field',
  )

  const blankDetails = checkoutModel.emptyCheckoutDetails()
  const blankContact = checkoutModel.validateCheckoutStage(blankDetails, 'contact')
  check(
    Boolean(blankContact.fullName) && Boolean(blankContact.email),
    'checkout: an empty contact section was accepted',
  )
  check(
    blankContact.phone === undefined,
    'checkout: an optional telephone number was required',
  )
  check(
    checkoutModel.CHECKOUT_FIELDS.filter((field) => field.stage === 'delivery').length === 5 &&
      Object.keys(checkoutModel.validateCheckoutStage(blankDetails, 'delivery')).length === 4,
    'checkout: the delivery section does not ask for its five fields, four of them required',
  )
  check(
    Object.keys(checkoutModel.validateCheckoutStage(blankDetails, 'review')).length === 0,
    'checkout: the review section asked for a field of its own',
  )

  const filledDetails = {
    ...blankDetails,
    fullName: 'A Buyer',
    email: 'buyer@example.com',
    addressLine1: '1 Sample Street',
    city: 'Pune',
    postcode: '411001',
    country: 'India',
  }
  check(
    Object.keys(checkoutModel.validateCheckoutDetails(filledDetails)).length === 0,
    'checkout: a complete set of details was rejected',
  )
  check(
    Boolean(checkoutModel.validateCheckoutStage({ ...filledDetails, email: 'not-an-email' }, 'contact').email),
    'checkout: an address that is not an email was accepted',
  )
  check(
    Boolean(checkoutModel.validateCheckoutStage({ ...filledDetails, phone: '++' }, 'contact').phone),
    'checkout: an unusable telephone number was accepted',
  )
  check(
    checkoutModel.validateCheckoutStage({ ...filledDetails, phone: '' }, 'contact').phone === undefined,
    'checkout: an empty optional telephone number was rejected',
  )
  check(
    Boolean(
      checkoutModel.validateCheckoutStage({ ...filledDetails, postcode: '1234567890123' }, 'delivery')
        .postcode,
    ),
    'checkout: an over-long postal code was accepted',
  )

  let checkoutState = checkoutModel.initialCheckoutState()
  check(
    checkoutState.stageIndex === 0 && checkoutState.checked === false,
    'checkout: the preview does not open on the first section',
  )
  check(
    !/place|order|submit|confirm|paid/i.test(Object.keys(checkoutState).join()),
    'checkout: the state model carries a flag for a placed order',
  )

  const blockedContinue = checkoutModel.checkoutReducer(checkoutState, { type: 'continue' })
  check(
    blockedContinue.stageIndex === 0 && blockedContinue.checked === true,
    'checkout: an empty section let the visitor continue',
  )
  check(
    Boolean(blockedContinue.errors.fullName),
    'checkout: continuing past an empty section produced no message',
  )

  checkoutState = checkoutModel.checkoutReducer(checkoutState, {
    type: 'setField',
    field: 'fullName',
    value: 'A Buyer',
  })
  checkoutState = checkoutModel.checkoutReducer(checkoutState, {
    type: 'setField',
    field: 'email',
    value: 'buyer@example.com',
  })
  const advanced = checkoutModel.checkoutReducer(checkoutState, { type: 'continue' })
  check(
    advanced.stageIndex === 1 && advanced.furthestIndex === 1,
    'checkout: a complete section did not open the next one',
  )
  check(
    advanced.details.fullName === 'A Buyer' && advanced.details.email === 'buyer@example.com',
    'checkout: continuing dropped a typed value',
  )
  check(
    checkoutModel.checkoutReducer(advanced, { type: 'goToStage', index: 2 }).stageIndex === 1,
    'checkout: the review section could be opened before delivery',
  )
  check(
    checkoutModel.checkoutReducer(advanced, { type: 'back' }).details.email === 'buyer@example.com',
    'checkout: going back lost the details',
  )
  check(
    checkoutModel.incompleteStages(blankDetails).map((stage) => stage.id).join() === 'contact,delivery',
    'checkout: the sections still waiting are not named',
  )
  check(
    checkoutModel.incompleteStages(filledDetails).length === 0,
    'checkout: complete details still reported a section as incomplete',
  )

  check(
    /disabled/.test(checkoutModel.PLACE_ORDER_REASON) &&
      checkoutModel.PLACE_ORDER_BLOCKERS.length >= 5,
    'checkout: the unavailable order action is not explained',
  )
  check(
    /no order is placed/.test(checkoutModel.CHECKOUT_PREVIEW_NOTICE),
    'checkout: the preview notice does not say no order is placed',
  )
  check(
    /no card/i.test(checkoutModel.CHECKOUT_PAYMENT_NOTE) &&
      /never hold card details/.test(checkoutModel.CHECKOUT_PAYMENT_NOTE),
    'checkout: the payment note does not rule out card data',
  )
  check(
    /not sent, not stored/.test(checkoutModel.CHECKOUT_DETAILS_NOTE),
    'checkout: the details note does not say what happens to what is typed',
  )
  check(
    /Nothing is dispatched/.test(checkoutModel.checkoutDeliveryNote([])) &&
      /delivers nothing/.test(checkoutModel.checkoutDeliveryNote(['Arc of Quiet Light'])),
    'checkout: the delivery note promises a delivery',
  )

  /* The orders page's structure: placeholders, never generated values. */
  const orderRows = orderModel.orderStructure()
  check(orderRows.length === 5, `orders: ${orderRows.length} structure rows, expected 5`)
  const placeholderRows = orderRows.filter((row) => row.placeholder)
  check(
    placeholderRows.length === 3 && placeholderRows.every((row) => /^\[.+\]$/.test(row.value)),
    'orders: a placeholder row is not written as a bracketed placeholder',
  )
  check(
    orderRows.every((row) => row.note.length > 20 && !/\d{4}/.test(row.value)),
    'orders: a structure row carries no explanation, or carries a date or a number',
  )
  check(
    orderRows.some((row) => row.label === 'Status' && row.value === 'No order placed' && !row.placeholder),
    'orders: the status row does not state the one accurate status',
  )
  check(
    Boolean(orderModel.orderStructureArtwork()?.id),
    'orders: the structure card is not anchored to a real record',
  )

  /* The four buyer screens, rendered with state in them. */
  const seededJourney = { savedIds: [firstId, secondId], cartIds: [firstId, secondId] }
  const renderSeeded = (path, Component) =>
    renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          buyerState.BuyerStateContext.Provider,
          { value: { state: seededJourney, dispatch: () => {} } },
          createElement(Component),
        ),
      ),
    )

  const savedHtml = renderSeeded('/wishlist', buyerPages.wishlist)
  const firstTitle = data.SAMPLE_ARTWORKS[0].title
  const secondTitle = data.SAMPLE_ARTWORKS[1].title
  check(
    savedHtml.includes(firstTitle) && savedHtml.includes(secondTitle),
    'wishlist: a saved work is not listed on the page',
  )
  check(
    (savedHtml.match(/aria-pressed="true"/g) ?? []).length === 2,
    'wishlist: the saved works are not marked as saved on their controls',
  )
  check(
    savedHtml.includes(`Remove ${firstTitle} from saved works`),
    'wishlist: the save control does not name the work it applies to',
  )
  check(
    savedHtml.includes('2 works saved') && savedHtml.includes('href="/discover"'),
    'wishlist: the saved count or the route back to discovery is missing',
  )
  check(
    !/USD|INR|GBP/.test(savedHtml),
    'wishlist: a currency appeared on a page of unpriced sample records',
  )

  const seededCartHtml = renderSeeded('/cart', buyerPages.cart)
  check(
    seededCartHtml.includes('A total cannot be shown'),
    'cart: a cart of unpriced works claims a total',
  )
  check(
    (seededCartHtml.match(/No price has been provided/g) ?? []).length === 2,
    'cart: the absence of a price is not stated on every line',
  )
  check(
    (seededCartHtml.match(/aria-label="Remove /g) ?? []).length === 2,
    'cart: a line has no remove action that names its work',
  )
  check(
    seededCartHtml.includes('href="/checkout"') && seededCartHtml.includes('href="/orders"'),
    'cart: the way on to checkout or orders is missing',
  )
  check(
    !/[A-Z]{3}\s\d/.test(seededCartHtml),
    'cart: a currency figure appeared for works that carry no price',
  )
  check(
    seededCartHtml.includes('Local to this tab'),
    'cart: the page does not state where the cart is held',
  )

  const seededCheckoutHtml = renderSeeded('/checkout', buyerPages.checkout)
  check(
    seededCheckoutHtml.includes('Step 1 of 3') && seededCheckoutHtml.includes('Contact'),
    'checkout: the page does not open on the first of three sections',
  )
  check(
    seededCheckoutHtml.includes('id="checkout-fullName"') &&
      seededCheckoutHtml.includes('for="checkout-fullName"'),
    'checkout: the first contact field is unlabelled',
  )
  check(
    !seededCheckoutHtml.includes('id="checkout-addressLine1"'),
    'checkout: the delivery fields are shown before the contact section is complete',
  )
  check(
    seededCheckoutHtml.includes('aria-label="Checkout sections"') &&
      seededCheckoutHtml.includes('aria-current="step"'),
    'checkout: the sections are not marked up as an ordered set',
  )
  check(
    seededCheckoutHtml.includes('Order summary') &&
      seededCheckoutHtml.includes('A total cannot be shown'),
    'checkout: the order summary does not report the cart honestly',
  )
  check(
    !/card number|CVC|CVV|expiry date/i.test(seededCheckoutHtml),
    'checkout: a card field is present',
  )

  // The review step on its own: the action that can never be taken.
  const reviewHtml = renderToStaticMarkup(
    createElement(CheckoutReview, { details: filledDetails, onEdit: () => {} }),
  )
  const placeOrderTag = /<button[^>]*id="place-order"[^>]*>/.exec(reviewHtml)?.[0]
  check(Boolean(placeOrderTag), 'checkout: the order action is not rendered with an id')
  check(
    Boolean(placeOrderTag && /disabled/.test(placeOrderTag)),
    'checkout: the order action is not disabled',
  )
  check(
    Boolean(placeOrderTag && /aria-describedby="place-order-reason"/.test(placeOrderTag)),
    'checkout: the order action is not connected to its reason',
  )
  check(
    reviewHtml.includes('id="place-order-reason"') &&
      reviewHtml.includes(checkoutModel.PLACE_ORDER_REASON),
    'checkout: the reason the order cannot be placed is missing',
  )
  check(
    reviewHtml.includes('Every section above is complete') &&
      reviewHtml.includes('buyer@example.com'),
    'checkout: the review step does not read back what was entered',
  )
  check(
    !/card number|CVC|CVV|expiry date/i.test(reviewHtml) &&
      reviewHtml.includes(checkoutModel.CHECKOUT_PAYMENT_NOTE),
    'checkout: the review step shows a card field, or does not rule one out',
  )
  check(
    checkoutModel.PLACE_ORDER_BLOCKERS.every((blocker) => reviewHtml.includes(blocker)),
    'checkout: the review step does not list what a real checkout needs',
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
  // Nothing on a workspace screen may claim a save, an upload, a publication, a
  // verification or a sale — and nothing may show a price-shaped value.
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
        `${workspace.STUDIO_SECTIONS.length} sections, all of them previews`,
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
        'there is no upload and no storage',
        'a price prepared here is never published',
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
        // The price pair is part of the draft, and the copy says what it is not.
        pricing.PRICE_DRAFT_NOTE,
        'There is no availability field and no publish action',
        'Nothing is checked until you ask',
        'id="listing-price-amount"',
        'for="listing-price-amount"',
        'id="listing-price-currency"',
        'for="listing-price-currency"',
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
      path: '/sell/studio/certificate',
      expect: 'Seller certificate preview',
      expectAll: [
        'Frontend preview',
        certificate.CERTIFICATE_TITLE,
        certificate.CERTIFICATE_STATUS,
        certificate.CERTIFICATE_NOT_ISSUED,
        certificate.CERTIFICATE_QR_LABEL,
        certificate.CERTIFICATE_QR_NOTE,
        certificate.CERTIFICATE_LOCAL_INPUT_NOTE,
        certificate.CERTIFICATE_STUDIO_NOTE,
        // Both halves of the template: what can be typed, and what never can.
        ...certificate.certificateFields().map((field) => field.value),
        ...certificate.certificateFields().map((field) => field.label),
        'What has to exist first',
        'Recipient name',
        'Studio name',
      ],
      expectLinks: ['/sell/studio', '/sell'],
      // A document preview carries no image and no code of any kind.
      maxImages: 0,
      forbidAll: [
        ...noSaveClaims,
        ...fabricatedProvenance,
        'Verified Artist',
        'Officially Verified',
        'Verified Studio',
        'Signature',
        'Accredited',
      ],
      // No bracketed placeholder may be replaced by a real-looking value, and no
      // currency or day count may appear on the document.
      forbidPatterns: [currencyPattern, /\b\d{4}-\d{2}-\d{2}\b/, /[A-Z]{2,}-\d{3,}/],
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
  const buyerCasesStart = CASES.length

  /*
   * The buyer journey, as a visitor meets it: every one of these screens starts
   * empty, because there is no account behind them and nothing is stored. The
   * seeded states — a saved list, a cart, a completed review — are asserted
   * against the models above, where they can be built without pretending a
   * visitor arrived with them.
   */
  CASES.push(
    {
      path: '/wishlist',
      expect: 'Saved works',
      expectAll: [
        buyer.SAVED_EMPTY_TITLE,
        buyer.SAVED_EMPTY_TEXT,
        buyer.BUYER_STATE_NOTE,
        'Local to this tab',
        // The list is a bookmark, and the page says so where it is empty.
        'not a reservation',
      ],
      expectLinks: ['/discover', '/collections', '/cart', '/orders', '/checkout'],
      forbidAll: [...transactionPhrases, ...fabricatedProvenance],
      forbidPatterns: [currencyPattern],
    },
    {
      path: '/cart',
      expect: 'Your cart',
      expectAll: [
        buyer.CART_EMPTY_TITLE,
        buyer.CART_EMPTY_TEXT,
        buyer.BUYER_STATE_NOTE,
        'nothing in it can be bought',
      ],
      expectLinks: ['/discover', '/wishlist', '/checkout', '/orders'],
      // An empty cart: no image, no total, no figure of any kind.
      maxImages: 0,
      forbidAll: [...transactionPhrases, ...fabricatedProvenance],
      forbidPatterns: [currencyPattern],
    },
    {
      path: '/checkout',
      expect: 'Checkout',
      expectAll: [
        buyer.CHECKOUT_EMPTY_TITLE,
        buyer.CHECKOUT_EMPTY_TEXT,
        checkoutModel.CHECKOUT_PREVIEW_NOTICE,
        'no payment is taken',
      ],
      expectLinks: ['/discover', '/cart'],
      maxImages: 0,
      forbidAll: [
        ...transactionPhrases,
        // No payment card field may exist anywhere in the build.
        'Card number',
        'Security code',
        'Expiry date',
      ],
      forbidPatterns: [currencyPattern],
    },
    {
      path: '/orders',
      expect: 'Orders',
      expectAll: [
        orderModel.ORDERS_EMPTY_TITLE,
        orderModel.ORDERS_EMPTY_TEXT,
        orderModel.ORDERS_PREVIEW_NOTICE,
        orderModel.ORDER_STRUCTURE_NOTICE,
        'Demonstration data',
        'Not a real order',
        // Every row of the structure, label and value alike.
        ...orderModel.orderStructure().map((row) => row.label),
        ...orderModel.orderStructure().map((row) => row.value),
        'No payment taken',
      ],
      // The structure card is built around a real record, so its link resolves.
      expectArtworks: [data.SAMPLE_ARTWORKS[0].id],
      forbidAll: [
        ...transactionPhrases,
        'Delivered',
        'Shipped',
        'Dispatched on',
        'Paid',
        'Payout',
      ],
      // No reference number and no date may appear, in any format.
      forbidPatterns: [currencyPattern, /\b\d{4}-\d{2}-\d{2}\b/, /[A-Z]{2,}-\d{3,}/],
    },
  )

  const buyerCasesEnd = CASES.length

  /** Written into the model on the sign-in and create screens. */
  const accountFields = [
    ...account.accountFields('signIn'),
    ...account.accountFields('create'),
    ...account.accountFields('reset'),
  ]

  CASES.push(
    {
      path: '/account/sign-in',
      expect: 'Sign in preview',
      expectAll: [
        account.ACCOUNT_PREVIEW_NOTICE,
        account.ACCOUNT_CREDENTIAL_WARNING,
        account.ACCOUNT_NO_SESSION,
        ...account.SIGN_IN_BLOCKERS,
        // Every label, hint and placeholder of the form, read from the model.
        ...account.accountFields('signIn').map((field) => field.label),
        ...account.accountFields('signIn').map((field) => field.hint ?? '').filter(Boolean),
        // The action is a check, and the toggle names the state it is in.
        account.ACCOUNT_SUBMIT_LABELS.signIn,
        account.passwordToggleLabel(false),
        'Clear the form',
        'Two fields, checked in your browser',
        'What a real sign-in needs',
      ],
      expectLinks: ['/account/create', '/account/reset', '/discover', '/artists', '/cart'],
      // A preview form is a form, not a picture: no artwork appears on it.
      maxImages: 0,
      forbidAll: [
        ...noSaveClaims,
        ...fabricatedProvenance,
        // Nothing on the screen may claim the visitor is in, or that a check
        // reached anybody. The account words themselves are caught here as
        // bare actions: the page may be *called* “Sign in preview”, but no
        // control and no heading may promise a sign-in on its own.
        'Forgot your password?',
        'Remember me',
      ],
      forbidPatterns: [
        /Sign in(?! preview)/,
        /Create account(?! preview)/,
        /\bLog ?in\b/,
        /\bSign ?up\b/,
        /\bMy account\b/,
        /\bsigned in\b/i,
        /name="password"/,
        /autocomplete="current-password"/,
      ],
    },
    {
      path: '/account/create',
      expect: 'Create account preview',
      expectAll: [
        account.ACCOUNT_PREVIEW_NOTICE,
        account.ACCOUNT_CREDENTIAL_WARNING,
        account.ACCOUNT_NO_SESSION,
        ...account.CREATE_ACCOUNT_BLOCKERS,
        ...account.accountFields('create').map((field) => field.label),
        ...account.accountFields('create').map((field) => field.hint ?? '').filter(Boolean),
        account.ACCOUNT_SUBMIT_LABELS.create,
        account.passwordToggleLabel(false),
        // What the passing message says is asserted against the model, above: it
        // is rendered only after the check runs, so it is not in the markup.
        account.ACCOUNT_SUBMIT_LABELS.create,
        'Your details',
        'What a real account would need',
        // A form that creates nothing asks nobody to accept anything, and says so.
        'nothing to agree to',
      ],
      expectLinks: ['/account/sign-in', '/account/reset', '/wishlist', '/cart'],
      maxImages: 0,
      forbidAll: [
        ...noSaveClaims,
        ...fabricatedProvenance,
        'Welcome',
        'Check your inbox',
        'Confirm your email',
        'Terms of service',
        'Privacy policy',
        'I agree',
        'By continuing you agree',
      ],
      forbidPatterns: [
        /Sign in(?! preview)/,
        /Create account(?! preview)/,
        /\bLog ?in\b/,
        /\bSign ?up\b/,
        /\bMy account\b/,
        /\bsigned in\b/i,
        /name="password"/,
        /autocomplete="new-password"/,
      ],
    },
    {
      path: '/account/reset',
      expect: 'Password reset preview',
      expectAll: [
        account.ACCOUNT_PREVIEW_NOTICE,
        account.ACCOUNT_NO_EMAIL_NOTE,
        account.accountFields('reset').map((field) => field.label)[0],
        account.ACCOUNT_SUBMIT_LABELS.reset,
        'Request a reset',
        // The form asks for an address and says what will not follow from it.
        account.ACCOUNT_NO_EMAIL_NOTE,
        'What a real reset request needs',
        'no message would ever arrive',
      ],
      expectLinks: ['/account/sign-in', '/account/create'],
      maxImages: 0,
      // A reset request asks for an address and nothing else: no password field,
      // no second address, no security question.
      forbidAll: [
        ...noSaveClaims,
        'Confirm',
        'Security question',
        'A message is on its way',
        'Check your inbox',
        'If an account exists',
        'We have sent',
      ],
      // No password control of any kind, and no promise of a mail: the page is
      // named for a reset, and the check is that it does nothing about one.
      forbidPatterns: [
        /Sign in(?! preview)/,
        /Create account(?! preview)/,
        /\bLog ?in\b/,
        /\bSign ?up\b/,
        /\bMy account\b/,
        /\bsigned in\b/i,
        /name="password"/,
        /type="password"/,
      ],
    },
    {
      path: '/sell/apply',
      expect: 'Seller application',
      expectAll: [
        application.APPLICATION_PREVIEW_NOTICE,
        application.APPLICATION_NO_DOCUMENTS,
        application.APPLICATION_NO_SUBMISSION,
        application.APPLICATION_PREVIEW_LABEL,
        application.APPLICATION_REVIEW_NOTE,
        ...application.APPLICATION_BLOCKERS,
        // Every field of the form, from the model: label, hint, and the choice
        // list the discipline menu offers.
        ...application.APPLICATION_FIELDS.map((field) => field.label),
        ...application.APPLICATION_FIELDS.map((field) => field.hint ?? '').filter(Boolean),
        'Choose a discipline',
        ...application.applicationDisciplines().map((discipline) => discipline.label),
        // The workflow the form sits in front of, and where verification comes in.
        ...workspace.ARTIST_WORKFLOW.map((step) => step.title),
        'The application',
        'What happens after a real application',
        'What a real application needs',
        // The read-back of the typed values is a preview of the form, not a
        // receipt: it exists before anything is typed.
        'What you entered',
        'See what verification would mean',
      ],
      expectLinks: ['/sell', '/discover', '/sell/studio', '/sell/studio/verification'],
      // Nothing is uploaded and nothing is drawn: an application is text only.
      maxImages: 0,
      forbidAll: [
        ...noSaveClaims,
        ...fabricatedProvenance,
        // No claim of receipt, review, approval or a queue position.
        'We have received',
        'Your application has been received',
        'Application submitted',
        'Under review',
        'Approved',
        'We will be in touch',
        'Reference number',
        'Upload',
        'Attach',
        'Bank details',
        'Tax',
        'Commission',
        'Fee',
      ],
      // An identity or financial document by any other name, and any claim that
      // the form reached a server.
      forbidPatterns: [
        /passport|driving licen[cs]e|national id|tax id|vat|iban|swift|sort code|account number/i,
        /\bPOST\b|fetch\(|XMLHttpRequest|FormData/,
      ],
    },
    {
      path: '/sell/studio/verification',
      expect: 'Verification status',
      expectAll: [
        verification.VERIFICATION_HEADLINE,
        verification.verificationSummaryLine(),
        verification.VERIFICATION_STATUS_NOTE,
        verification.CERTIFICATE_DESIGN_VS_ISSUED,
        ...verification.TRUST_DISTINCTIONS.map((group) => group.title),
        ...verification.TRUST_DISTINCTIONS.flatMap((group) => group.items),
        // All five states, labelled as definitions rather than as holders.
        ...verification.VERIFICATION_STAGES.map((stage) => stage.label),
        ...verification.VERIFICATION_STAGES.map((stage) => stage.meaning),
        ...verification.VERIFICATION_STAGES.map((stage) => stage.next),
        'No studio is in this state',
        'Illustrative state',
        'Standing of',
        'What each state will mean',
        'Three kinds of statement, kept apart',
        'The certificate, and what is not one',
        // The certificate's own status, carried onto this page rather than
        // re-derived, because the document is only drawn at its own route.
        certificate.CERTIFICATE_STATUS,
      ],
      expectLinks: ['/sell', '/sell/apply', '/sell/studio', '/sell/studio/certificate'],
      maxImages: 0,
      forbidAll: [
        ...noSaveClaims,
        ...fabricatedProvenance,
        // States a studio could be in, but no claim that anybody is in them.
        'You are verified',
        'Your studio is verified',
        'Verified seller',
        'Verification failed',
        'Rejected',
        'Verified on',
        'Approved on',
        'Trust score',
        'Rating',
        'Reviews',
      ],
      // A date, a reference number and a score, in any format — and no second
      // certificate is drawn here: the identifier and the code frame live on the
      // certificate route and nowhere else.
      forbidPatterns: [
        /\b\d{4}-\d{2}-\d{2}\b/,
        /\b(?:19|20)\d{2}\b(?=\s*(?:verified|approved|issued))/i,
        /[A-Z]{2,}-\d{3,}/,
        /\b\d(?:\.\d)?\s*\/\s*5\b/,
        /\b\d{1,3}%\s*(?:verified|trusted)/i,
        /\bverified\b[^.]{0,40}\bon\b[^.]{0,20}\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
      ],
    },
  )

  const trustCasesEnd = CASES.length

  /*
   * The forms themselves, read out of the markup they render.
   *
   * The screens matter for the same reason the model does — a preview form is
   * the one place a visitor is asked to type something — so what is checked here
   * is the wiring: every control has a label that points at it, the password
   * controls are the only ones and they say which way round they are, and no
   * form anywhere has an address to send itself to.
   */
  function renderRoute(path) {
    return renderToStaticMarkup(
      createElement(MemoryRouter, { initialEntries: [path] }, createElement(AppRoutes)),
    )
  }

  for (const path of ['/account/sign-in', '/account/create', '/account/reset', '/sell/apply']) {
    const html = renderRoute(path)
    const controls = [...html.matchAll(/<(?:input|textarea|select)\b[^>]*>/g)].map((match) => match[0])

    check(controls.length > 0, `${path}: the form shows no control at all`)
    for (const control of controls) {
      const id = control.match(/\bid="([^"]+)"/)?.[1]
      check(Boolean(id), `${path}: a control has no id — ${control.slice(0, 90)}`)
      if (id) {
        check(
          html.includes(`for="${id}"`),
          `${path}: the control #${id} has no label pointing at it`,
        )
      }
    }

    // A form with nowhere to go: no action, no method, no encoding, no target.
    const forms = html.match(/<form\b[^>]*>/g) ?? []
    check(forms.length === 1, `${path}: expected exactly one <form>, found ${forms.length}`)
    for (const form of forms) {
      check(
        !/\baction=|\bmethod=|\benctype=|\btarget=/.test(form),
        `${path}: the form declares somewhere to submit to — ${form.slice(0, 120)}`,
      )
      check(
        /novalidate/i.test(form),
        `${path}: the form leaves validation to the browser instead of reporting it in the page`,
      )
    }

    const submits = html.match(/<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/g) ?? []
    check(submits.length === 1, `${path}: expected one submit button, found ${submits.length}`)

    // The outcome region exists before anything is typed, and is empty.
    check(
      html.includes('role="status"') && html.includes('aria-live="polite"'),
      `${path}: there is nowhere for a result to be reported`,
    )
  }

  for (const path of ['/account/sign-in', '/account/create']) {
    const html = renderRoute(path)
    const form = account.accountFormHasPassword(path === '/account/sign-in' ? 'signIn' : 'create')
      ? path.replace('/account/', '')
      : ''
    const ids = account
      .accountFields(form === 'sign-in' ? 'signIn' : 'create')
      .filter((field) => field.type === 'password')
      .map((field) => `${form === 'sign-in' ? 'signIn' : 'create'}-${field.name}`)

    const toggles = html.match(/<button[^>]*aria-pressed[^>]*>[\s\S]*?<\/button>/g) ?? []
    check(toggles.length === ids.length, `${path}: expected ${ids.length} password toggles, found ${toggles.length}`)
    for (const toggle of toggles) {
      check(
        /aria-pressed="false"/.test(toggle),
        `${path}: a password toggle starts pressed, or says nothing about its state`,
      )
      const controls = toggle.match(/aria-controls="([^"]+)"/)?.[1]
      check(
        Boolean(controls) && ids.includes(controls),
        `${path}: a password toggle does not name the field it controls`,
      )
      check(
        toggle.includes(account.passwordToggleLabel(false)),
        `${path}: a password toggle does not say what pressing it does`,
      )
      check(
        toggle.includes('type="button"'),
        `${path}: a password toggle would submit the form`,
      )
    }

    // The field is masked to begin with, and the toggle is the only thing that
    // can unmask it: no control in the markup starts as text with a password
    // value behind it.
    const passwordInputs = html.match(/<input[^>]*type="password"[^>]*>/g) ?? []
    check(
      passwordInputs.length === ids.length,
      `${path}: ${passwordInputs.length} masked fields for ${ids.length} password definitions`,
    )
    for (const input of passwordInputs) {
      const renderedValue = input.match(/\bvalue="([^"]*)"/)?.[1]
      check(
        renderedValue === undefined || renderedValue === '',
        `${path}: a password field renders with a value in it`,
      )
      check(
        /autocomplete="off"/i.test(input),
        `${path}: a password field asks a browser or a password manager to fill it`,
      )
    }
  }

  // The reset request holds exactly one control, and it is an address.
  const resetHtml = renderRoute('/account/reset')
  const resetControls = (resetHtml.match(/<(?:input|textarea|select)\b[^>]*>/g) ?? []).length
  check(resetControls === 1, `account: the reset request shows ${resetControls} controls, expected 1`)
  check(
    resetHtml.includes('type="email"'),
    'account: the reset request does not ask for an email address',
  )

  // Requiredness is stated twice and is never left to the browser: it is in the
  // label, in `aria-required`, and counted from the model that defines it.
  const requiredForms = [
    ['/account/sign-in', account.accountFields('signIn')],
    ['/account/create', account.accountFields('create')],
    ['/account/reset', account.accountFields('reset')],
    ['/sell/apply', application.APPLICATION_FIELDS],
  ]

  for (const [path, fields] of requiredForms) {
    const html = renderRoute(path)
    const expected = fields.filter((field) => field.required).length
    const marked = (html.match(/aria-required="true"/g) ?? []).length

    check(
      marked === expected,
      `${path}: ${marked} field(s) marked required for ${expected} required definitions`,
    )
    check(
      !/<(?:input|textarea|select)\b[^>]*\brequired(?:[\s/>])/.test(html),
      `${path}: a control uses the browser's own validation instead of the page reporting it`,
    )
    check(
      html.includes('aria-describedby='),
      `${path}: a field’s hint or error is not associated with the field`,
    )
  }

  /*
   * The application form's read-back is a preview of the form's own contents: it
   * exists, and is empty, before anything is typed — which is what makes it
   * impossible to mistake for a confirmation.
   */
  const applicationHtml = renderRoute('/sell/apply')
  check(
    applicationHtml.includes('What you entered') &&
      applicationHtml.includes('Not provided') &&
      applicationHtml.includes(application.APPLICATION_PREVIEW_LABEL),
    'application: the empty read-back is missing or is not labelled as the form’s own contents',
  )
  check(
    // A receipt, by any of the shapes one takes — a claim about the application
    // rather than about the form. The page does say that nothing has been
    // received, which is the opposite of this.
    !/(?:we|i) (?:have|’ve|'ve) received|(?<!no )(?<!not )application (?:has been|is|was) (?:received|submitted|approved)|received your application|your application (?:is|has)/i.test(
      applicationHtml,
    ),
    'application: the read-back reads as a receipt',
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

    /*
     * The heading outline: headings carry the page's structure, so a level
     * skipped in the markup is a section a reader using a screen reader cannot
     * find. Each rendered page is walked in document order and every jump of
     * more than one level is a failure.
     */
    const headingLevels = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]))
    headingsChecked += headingLevels.length
    let previousLevel = 1
    for (const level of headingLevels) {
      check(
        level <= previousLevel + 1,
        `${testCase.path}: heading outline skips from h${previousLevel} to h${level}`,
      )
      previousLevel = level
    }
    check(
      html.includes(testCase.expect),
      `${testCase.path}: expected marker not found — ${testCase.expect}`,
    )
    check(html.includes('Skip to content'), `${testCase.path}: skip link missing`)

    /*
     * Accounts, Phase 11: there are none. Three preview screens exist so the
     * experience can be reviewed, and the rules that keep them honest are
     * asserted on every route rather than only on those three:
     *
     * 1. Every link into the account previews says the word *preview* in its own
     *    text or accessible name — a link is a promise, and “Sign in” on its own
     *    would promise an account system that does not exist.
     * 2. Nowhere may a page claim a signed-in state, a created account, a sent
     *    message, a received application or a changed password. The links that
     *    satisfy rule 1 are removed before this check, and so is each screen's
     *    own preview-bearing name — “Sign in preview” is a title, while a bare
     *    “Sign in” is a promise, and the difference is the word.
     * 3. No page outside the account previews renders a password field at all.
     */
    const accountAnchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
      .map((match) => match[0])
      .filter((anchor) => /href="\/account\//.test(anchor))

    for (const anchor of accountAnchors) {
      check(
        /preview/i.test(anchor),
        `${testCase.path}: a link into the account previews does not say “preview” — ${anchor.slice(0, 120)}`,
      )
    }

    const withoutAccountLinks = accountAnchors
      .reduce((remaining, anchor) => remaining.replace(anchor, ''), html)
      .replace(
        // The screens' own names, as long as they keep the word that makes them
        // names. A page heading that drops it fails the check below.
        new RegExp(
          Object.values(account.ACCOUNT_FORM_TITLES)
            .map((title) => title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|'),
          'g',
        ),
        '',
      )
    for (const phrase of signedInClaims) {
      check(
        !withoutAccountLinks.includes(phrase),
        `${testCase.path}: a signed-in state was claimed — “${phrase}”`,
      )
    }

    const passwordInputs = (html.match(/<input[^>]*type="password"[^>]*>/g) ?? []).length
    if (!testCase.path.startsWith('/account/')) {
      check(
        passwordInputs === 0,
        `${testCase.path}: ${passwordInputs} password field(s) outside the account previews`,
      )
    }
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
  console.log(
    `buyer journey: ${buyerCasesEnd - buyerCasesStart} cases, plus direct assertions on the saved ` +
      `list, the cart, its totals, the checkout sections and the order structure`,
  )
  console.log(
    `account and trust: ${trustCasesEnd - buyerCasesEnd} cases, plus direct assertions on the three ` +
      `forms and their validation, the application read-back, the five verification states and the ` +
      `certificate route the trust screens hand off to`,
  )
  console.log(`headings: ${headingsChecked} across ${routesChecked} rendered routes, with no level skipped`)

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
