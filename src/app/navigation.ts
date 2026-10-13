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

/** Full destination list used by the mobile navigation panel. */
export const MOBILE_NAV: NavItem[] = [...PRIMARY_NAV, { label: 'Become a Seller', to: '/sell' }]

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
    title: 'ArtVerse',
    items: [
      { label: 'About', to: '/about' },
      { label: 'Become a Seller', to: '/sell' },
      { label: 'Design system', to: '/design-system' },
    ],
  },
]
