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
  /**
   * The buyer journey. Four destinations a visitor can reach without an
   * account, because none of them needs one: a saved list, a cart, a checkout
   * preview and an orders page. Nothing in the journey is stored or sent
   * anywhere — the state lives in the browser tab for the visit.
   */
  wishlist: '/wishlist',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  sell: '/sell',
  /**
   * The seller workspace preview. Every workspace destination sits under
   * `/sell/studio` and never collides with the public studio profiles at
   * `/artists/:artistId`, which are a different thing entirely.
   */
  studio: '/sell/studio',
  studioListings: '/sell/studio/listings',
  studioNewListing: '/sell/studio/listings/new',
  studioListing: (artworkId: string) => `/sell/studio/listings/${artworkId}`,
  studioProfile: '/sell/studio/profile',
  studioCertificate: '/sell/studio/certificate',
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
    purpose:
      'A single collection: an editorial hero built from one of its own works, its description, its works and only its works, and the routes back to the directory and the catalogue.',
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
    status: 'implemented',
    purpose:
      'Studio directory — every creator record, each with its practice, location, record count and own sample work.',
  },
  {
    pattern: '/artists/:artistId',
    page: 'ArtistProfilePage',
    status: 'implemented',
    purpose:
      'A studio profile: practice, location, practice note, its sample records, and the routes onward.',
  },
  {
    pattern: '/wishlist',
    page: 'WishlistPage',
    status: 'implemented',
    purpose:
      'Saved works: the records bookmarked from their own pages, each with the two buyer controls beside it, and an honest empty state when nothing is saved. The list lives in the browser tab for the visit.',
  },
  {
    pattern: '/cart',
    page: 'CartPage',
    status: 'implemented',
    purpose:
      'The cart: each work with its studio attribution and its price where the catalogue holds one, and a total only when every work is priced in a single currency. Where it cannot be worked out, the page names the reason instead of printing a figure.',
  },
  {
    pattern: '/checkout',
    page: 'CheckoutPage',
    status: 'implemented',
    purpose:
      'Checkout preview: contact, delivery and review sections with real validation, the order summary beside them, and a permanently disabled place-order action with the list of things a real checkout would need. No payment is taken, no order is placed and no card field exists.',
  },
  {
    pattern: '/orders',
    page: 'OrdersPage',
    status: 'implemented',
    purpose:
      'Orders: the true empty state — no account holds an order and no checkout can create one — and one clearly labelled structure preview built around a real sample record, whose reference, date, status and despatch lines are placeholders nothing generates.',
  },
  {
    pattern: '/sell',
    page: 'SellPage',
    status: 'implemented',
    purpose:
      'For Artists — the workflow a seller will follow, what the studio workspace contains today, and an explicit statement that no account system exists yet.',
  },
  {
    pattern: '/sell/studio',
    page: 'StudioOverviewPage',
    status: 'implemented',
    purpose:
      'The seller workspace preview: its navigation, the preview studio it is shown with, and the honest state of a workspace with no account, upload or storage behind it.',
  },
  {
    pattern: '/sell/studio/listings',
    page: 'StudioListingsPage',
    status: 'implemented',
    purpose:
      'Artwork listings: only the records attributed to the preview studio, with an in-tab draft summarised beside them.',
  },
  {
    pattern: '/sell/studio/listings/new',
    page: 'StudioListingEditorPage',
    status: 'implemented',
    purpose:
      'Listing editor — a new draft: the fields a listing needs, validated in the browser, uploaded and saved nowhere.',
  },
  {
    pattern: '/sell/studio/listings/:artworkId',
    page: 'StudioListingEditorPage',
    status: 'implemented',
    purpose:
      'Listing editor — a draft prepared from an existing sample record. The record itself is never modified.',
  },
  {
    pattern: '/sell/studio/certificate',
    page: 'StudioCertificatePage',
    status: 'implemented',
    purpose:
      'Seller certificate design preview — the document a verified seller would eventually receive, shown with placeholders and the status “Preview — Not Issued”. Nothing is issued and nobody is verified.',
  },
  {
    pattern: '/sell/studio/profile',
    page: 'StudioProfilePreviewPage',
    status: 'implemented',
    purpose:
      'Studio profile preview: the public profile rendered from the same model the directory uses, with the editable version that seller accounts would bring.',
  },
  {
    pattern: '/about',
    page: 'AboutPage',
    status: 'implemented',
    purpose: 'What ArtVerse is, and the twelve-phase plan behind it.',
  },
  {
    pattern: '/collections',
    page: 'CollectionsPage',
    status: 'implemented',
    purpose:
      'The collection directory, composed as an editorial spread: the first collection at full scale, the rest in a grid, every card linking to its own collection.',
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
