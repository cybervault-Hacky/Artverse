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
    status: 'implemented',
    purpose:
      'Explore Art — live search, discipline filters and sorting over the whole sample catalogue, plus the collection groupings. Criteria live in the query string: ?q, ?discipline, ?sort.',
  },
  {
    pattern: '/discover/:collectionId',
    page: 'CollectionDetailPage',
    status: 'implemented',
    purpose: 'A single collection: introduction, its works and the route back to the catalogue.',
  },
  {
    pattern: '/artwork/:artworkId',
    page: 'ArtworkDetailPage',
    status: 'implemented',
    purpose:
      'One artwork in full at its own proportions, with its record, its studio and related works chosen by discipline and shared collections.',
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
    purpose:
      'Direct search destination over the illustrative sample records; Explore Art carries the fuller search and filtering experience.',
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
