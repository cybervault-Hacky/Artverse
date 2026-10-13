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
    { path: '/artists', expect: 'The people behind the work' },
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

  // Every artwork in the data layer must render its own page.
  for (const artwork of data.SAMPLE_ARTWORKS) {
    CASES.push({ path: `/artwork/${artwork.id}`, expect: artwork.title })
  }

  // Every creator in the data layer must render its own profile.
  for (const creator of data.SAMPLE_CREATORS) {
    CASES.push({ path: `/artists/${creator.id}`, expect: creator.name })
  }

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
    for (const marker of testCase.forbidAll ?? []) {
      check(!html.includes(marker), `${testCase.path}: unexpected markup present — ${marker}`)
    }
    for (const link of testCase.expectLinks ?? []) {
      check(
        html.includes(`href="${link}"`),
        `${testCase.path}: expected link to ${link} was not rendered`,
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
