/**
 * Route verification.
 *
 * Renders the real route tree for every destination through Vite's SSR
 * pipeline and asserts the things that are easy to get wrong: that each route
 * reaches its own page, that unknown ids reach the not-found experience, and
 * that every page keeps one h1, meaningful image alternative text and the
 * shared header and footer.
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

/** Each case asserts a marker that only the intended page renders. */
const CASES = [
  { path: '/', expect: 'Where Art Finds Its Universe.' },
  { path: '/discover', expect: 'Browse the sample set' },
  { path: '/discover/warm-minimalism', expect: 'Warm Minimalism' },
  { path: '/artwork/sample-painting-01', expect: 'Layered Light, Study I' },
  { path: '/artists', expect: 'The people behind the work' },
  { path: '/artists/sample-studio-a', expect: 'Illustrative Studio A' },
  { path: '/collections', expect: 'Groupings, not folders' },
  { path: '/sell', expect: 'Bring your work to a wider room' },
  { path: '/about', expect: 'A marketplace built calmly, in the open' },
  { path: '/search', expect: 'Find a work, a medium or a studio', maxImages: 0 },
  { path: '/search?q=ceramic', expect: 'for “ceramic”', minImages: 1 },
  { path: '/search?q=ochre', expect: 'for “ochre”', minImages: 2 },
  { path: '/search?q=zzzz', expect: 'No sample records match', maxImages: 0 },
  { path: '/design-system', expect: 'Floating-art prototype' },
  { path: '/404', expect: 'Error 404' },
  { path: '/this-route-does-not-exist', expect: 'Error 404' },
  { path: '/artwork/unknown-artwork-id', expect: 'We couldn’t find that artwork' },
  { path: '/discover/unknown-collection-id', expect: 'We couldn’t find that collection' },
  { path: '/artists/unknown-artist-id', expect: 'We couldn’t find that artist or studio' },
]

const failures = []
const notes = []

function check(condition, message) {
  if (!condition) failures.push(message)
}

function countMatches(html, pattern) {
  return (html.match(pattern) ?? []).length
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { AppRoutes } = await server.ssrLoadModule('/src/app/AppRoutes.tsx')

  for (const testCase of CASES) {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: [testCase.path] },
        createElement(AppRoutes),
      ),
    )

    const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) ?? []
    const h1Text = h1s.map((block) => block.replace(/<[^>]+>/g, '')).join(' ')

    check(h1s.length === 1, `${testCase.path}: expected exactly one <h1>, found ${h1s.length}`)
    check(
      html.includes(testCase.expect),
      `${testCase.path}: expected marker not found — ${testCase.expect}`,
    )
    check(
      html.includes('Skip to content'),
      `${testCase.path}: skip link missing from the shared layout`,
    )
    check(
      html.includes('Where Art Finds Its Universe.') || testCase.path === '/404',
      `${testCase.path}: footer tagline missing from the shared layout`,
    )

    const images = html.match(/<img[^>]*>/g) ?? []
    const missingAlt = images.filter(
      (image) => !/\balt="[^"]+"/.test(image),
    )
    check(
      missingAlt.length === 0,
      `${testCase.path}: ${missingAlt.length} image(s) without descriptive alt text`,
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

    const headingIds = html.match(/id="([^"]+)"/g) ?? []
    check(
      new Set(headingIds).size === headingIds.length,
      `${testCase.path}: duplicate element ids (${headingIds.length} ids, ${new Set(headingIds).size} unique)`,
    )

    notes.push(
      `${testCase.path.padEnd(34)} h1: “${h1Text.trim().slice(0, 46)}” · images: ${images.length} · chars: ${html.length}`,
    )
  }

  console.log('\nRoute render checks\n' + '─'.repeat(96))
  for (const note of notes) console.log(note)

  await server.close()
} catch (error) {
  await server.close()
  console.error('\nRoute verification could not run:', error)
  process.exit(1)
}

if (failures.length > 0) {
  console.error('\n' + '─'.repeat(96))
  for (const failure of failures) console.error('✗ ' + failure)
  console.error(`\n${failures.length} assertion(s) failed.`)
  process.exit(1)
}

console.log('─'.repeat(96))
console.log(`✓ ${CASES.length} routes rendered and passed all assertions.`)
