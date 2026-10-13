/**
 * Navigation configuration.
 *
 * Keeping the header and footer link sets here — rather than inside the
 * components — means a destination can be added in one place and stay
 * consistent across the site. Keys match the paths declared in `routes.ts`.
 */

export interface NavItem {
  label: string
  to: string
}

/** Primary destinations shown in the header. */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Explore Art', to: '/discover' },
  { label: 'Artists & Studios', to: '/artists' },
  { label: 'Collections', to: '/collections' },
]

/**
 * Full destination list used by the mobile navigation panel. The seller entry
 * point is stated once, in the header's own link, and repeated here for the
 * panel rather than given a second destination.
 */
export const MOBILE_NAV: NavItem[] = [
  ...PRIMARY_NAV,
  /*
   * The buyer journey. Both destinations are also in the header, where they
   * carry a count of what the visitor has collected; in the panel they are
   * named in words, because a panel has the room and an icon does not explain
   * itself.
   */
  { label: 'Saved works', to: '/wishlist' },
  { label: 'Cart', to: '/cart' },
  { label: 'Orders', to: '/orders' },
  { label: 'For Artists', to: '/sell' },
]

export interface FooterNavGroup {
  title: string
  items: NavItem[]
}

/** Footer link groups. No policies or support pages are invented here. */
export const FOOTER_NAV: FooterNavGroup[] = [
  {
    title: 'Explore',
    items: [
      { label: 'Explore Art', to: '/discover' },
      { label: 'Collections', to: '/collections' },
      { label: 'Artists & Studios', to: '/artists' },
      { label: 'Search', to: '/search' },
    ],
  },
  {
    title: 'Buying',
    items: [
      { label: 'Saved works', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
      { label: 'Checkout preview', to: '/checkout' },
      { label: 'Orders', to: '/orders' },
    ],
  },
  {
    title: 'ArtVerse',
    items: [
      { label: 'About', to: '/about' },
      { label: 'For Artists', to: '/sell' },
      { label: 'Artist studio preview', to: '/sell/studio' },
      { label: 'Design system', to: '/design-system' },
    ],
  },
]
