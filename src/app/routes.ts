/**
 * Central route registry.
 *
 * Every internal link in the app goes through these helpers, so a path is
 * declared exactly once and can be changed safely in one place.
 */
export const NavRoutes = {
  home: '/',
  discover: '/discover',
  collection: (collectionId: string) => `/discover/${collectionId}`,
  artwork: (artworkId: string) => `/artwork/${artworkId}`,
  artists: '/artists',
  artist: (artistId: string) => `/artists/${artistId}`,
  sell: '/sell',
  about: '/about',
  collections: '/collections',
  search: '/search',
  designSystem: '/design-system',
  notFound: '/404',
} as const

export interface RouteDefinition {
  /** Path pattern as registered with the router. */
  pattern: string
  /** Page component that owns the destination. */
  page: string
  status: 'implemented' | 'foundation'
  purpose: string
}

/**
 * The route architecture, in one readable table.
 *
 * It is the source of truth for the design-system page and for anyone
 * reviewing Phase 1: `foundation` marks a page that intentionally introduces
 * its destination without yet carrying its full feature set.
 */
export const ROUTE_ARCHITECTURE: RouteDefinition[] = [
  {
    pattern: '/',
    page: 'HomePage',
    status: 'implemented',
    purpose:
      'Editorial homepage: floating-art hero, five disciplines, artwork spotlight, four worlds, artist invitation.',
  },
  {
    pattern: '/discover',
    page: 'DiscoverPage',
    status: 'foundation',
    purpose: 'Explore Art — entry point to the sample catalogue.',
  },
  {
    pattern: '/discover/:collectionId',
    page: 'CollectionDetailPage',
    status: 'foundation',
    purpose: 'A single collection with its works.',
  },
  {
    pattern: '/artwork/:artworkId',
    page: 'ArtworkDetailPage',
    status: 'foundation',
    purpose: 'One artwork with its full metadata.',
  },
  {
    pattern: '/artists',
    page: 'ArtistsPage',
    status: 'foundation',
    purpose: 'Directory of artists and studios.',
  },
  {
    pattern: '/artists/:artistId',
    page: 'ArtistProfilePage',
    status: 'foundation',
    purpose: 'A single artist or studio profile.',
  },
  {
    pattern: '/sell',
    page: 'SellPage',
    status: 'foundation',
    purpose: 'Become a Seller — seller intent only, no account or form.',
  },
  {
    pattern: '/about',
    page: 'AboutPage',
    status: 'implemented',
    purpose: 'What ArtVerse is, and what Phase 1 covers.',
  },
  {
    pattern: '/collections',
    page: 'CollectionsPage',
    status: 'foundation',
    purpose: 'Directory of curated collections.',
  },
  {
    pattern: '/search',
    page: 'SearchPage',
    status: 'foundation',
    purpose: 'Search over the illustrative sample records.',
  },
  {
    pattern: '/design-system',
    page: 'DesignSystemPage',
    status: 'implemented',
    purpose: 'Internal preview of tokens, components and motion.',
  },
  {
    pattern: '/404',
    page: 'NotFoundPage',
    status: 'implemented',
    purpose: 'Not-found experience, also served by the catch-all route.',
  },
]
