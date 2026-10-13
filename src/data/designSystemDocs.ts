/**
 * Documentation content for `/design-system`.
 *
 * These records mirror `src/styles/tokens.css` and describe the responsive
 * behaviour implemented in the components. They are documentation, not product
 * data, and are kept out of page components so the two can be compared.
 */

export interface ColorToken {
  /** CSS custom property name. */
  token: string
  value: string
  usage: string
}

export interface ColorGroup {
  title: string
  tokens: ColorToken[]
}

export const COLOR_GROUPS: ColorGroup[] = [
  {
    title: 'Surfaces',
    tokens: [
      { token: '--color-canvas', value: '#FAF9F6', usage: 'Page background — warm white' },
      { token: '--color-surface', value: '#FFFFFF', usage: 'Raised surfaces such as image mats' },
      { token: '--color-surface-muted', value: '#F3F1EC', usage: 'Quiet panels and sample beds' },
      { token: '--color-surface-sunken', value: '#EEEAE3', usage: 'Deepest neutral surface' },
    ],
  },
  {
    title: 'Text',
    tokens: [
      { token: '--color-ink', value: '#171717', usage: 'Primary text — near black' },
      {
        token: '--color-ink-muted',
        value: '#6E6B66',
        usage: 'Secondary text; brand grey #77746F darkened for 5.0:1 contrast',
      },
      { token: '--color-ink-subtle', value: '#8C8880', usage: 'Captions and fine print' },
      { token: '--color-ink-inverse', value: '#F7F5F1', usage: 'Text on charcoal sections' },
    ],
  },
  {
    title: 'Lines',
    tokens: [
      { token: '--color-border', value: '#E5E2DC', usage: 'Default hairline' },
      { token: '--color-border-strong', value: '#D6D1C7', usage: 'Emphasis hairline, inputs' },
    ],
  },
  {
    title: 'Accent — champagne gold',
    tokens: [
      { token: '--color-accent', value: '#C8AD78', usage: 'Marks, rules and highlights' },
      { token: '--color-accent-strong', value: '#B2945E', usage: 'Hover and active accent' },
      { token: '--color-accent-ink', value: '#8A6F35', usage: 'Accent as text — 4.5:1 on canvas' },
      { token: '--color-accent-soft', value: '#F2E9D8', usage: 'Accent tint surface' },
    ],
  },
  {
    title: 'Contrast',
    tokens: [
      { token: '--color-charcoal', value: '#1E1D1B', usage: 'Occasional contrast sections only' },
      { token: '--color-charcoal-ink', value: '#F4F1EC', usage: 'Text on charcoal' },
      { token: '--color-charcoal-muted', value: '#B3ADA2', usage: 'Secondary text on charcoal' },
    ],
  },
]

export interface TypeToken {
  token: string
  sample: string
  size: string
  usage: string
  family: 'display' | 'sans'
  uppercase?: boolean
}

export const TYPE_SCALE: TypeToken[] = [
  {
    token: '--text-display',
    sample: 'Where Art Finds Its Universe.',
    size: 'clamp(2.5rem → 4rem)',
    usage: 'Hero headline — once per page, at most',
    family: 'display',
  },
  {
    token: '--text-title',
    sample: 'Browse the sample set',
    size: 'clamp(1.9rem → 2.75rem)',
    usage: 'Page title — the single h1 of a route',
    family: 'display',
  },
  {
    token: '--text-section',
    sample: 'Built as a system',
    size: 'clamp(1.5rem → 2rem)',
    usage: 'Section heading',
    family: 'display',
  },
  {
    token: '--text-heading',
    sample: 'Layered Light, Study I',
    size: '1.25rem',
    usage: 'Card and block heading',
    family: 'display',
  },
  {
    token: '--text-lead',
    sample: 'A quieter way to browse a large marketplace.',
    size: 'clamp(1.0625rem → 1.1875rem)',
    usage: 'Intro copy under a page or section title',
    family: 'sans',
  },
  {
    token: '--text-body',
    sample: 'Body copy carries the detail: medium, dimensions, process and context.',
    size: '1rem',
    usage: 'Default body copy',
    family: 'sans',
  },
  {
    token: '--text-small',
    sample: 'Secondary copy for controls, captions and supporting lines.',
    size: '0.9375rem',
    usage: 'Controls, links and supporting copy',
    family: 'sans',
  },
  {
    token: '--text-meta',
    sample: 'Oil on canvas · 60 × 90 cm · 2024',
    size: '0.8125rem',
    usage: 'Metadata, captions and fine print',
    family: 'sans',
  },
  {
    token: '--text-label',
    sample: 'Explore Art',
    size: '0.75rem',
    usage: 'Editorial labels — uppercase, tracked 0.14em',
    family: 'sans',
    uppercase: true,
  },
]

export interface ScaleToken {
  token: string
  value: string
  px: string
}

export const SPACE_SCALE: ScaleToken[] = [
  { token: '--space-1', value: '0.25rem', px: '4px' },
  { token: '--space-2', value: '0.5rem', px: '8px' },
  { token: '--space-3', value: '0.75rem', px: '12px' },
  { token: '--space-4', value: '1rem', px: '16px' },
  { token: '--space-5', value: '1.5rem', px: '24px' },
  { token: '--space-6', value: '2rem', px: '32px' },
  { token: '--space-7', value: '3rem', px: '48px' },
  { token: '--space-8', value: '4rem', px: '64px' },
  { token: '--space-9', value: '6rem', px: '96px' },
  { token: '--space-10', value: '8rem', px: '128px' },
]

export const SECTION_SPACING: ScaleToken[] = [
  { token: '--space-section', value: 'clamp(3.5rem → 6.5rem)', px: '56→104px' },
  { token: '--space-section-tight', value: 'clamp(2.5rem → 4rem)', px: '40→64px' },
]

export interface RadiusToken {
  token: string
  value: string
  usage: string
}

export const RADIUS_SCALE: RadiusToken[] = [
  { token: '--radius-xs', value: '3px', usage: 'Inline code, breadcrumb details' },
  { token: '--radius-sm', value: '8px', usage: 'Buttons and inputs' },
  { token: '--radius-md', value: '12px', usage: 'Panels and empty states' },
  { token: '--radius-lg', value: '18px', usage: 'Large media frames' },
  { token: '--radius-xl', value: '28px', usage: 'Reserved for large feature surfaces' },
  { token: '--radius-pill', value: '999px', usage: 'Active markers' },
]

export interface ShadowToken {
  token: string
  value: string
  usage: string
}

export const SHADOW_SCALE: ShadowToken[] = [
  { token: '--shadow-soft', value: '18px / 36px blur', usage: 'Quiet elevation' },
  { token: '--shadow-frame', value: '12px / 28px blur', usage: 'Artwork frames at rest' },
  { token: '--shadow-lift', value: '30px / 60px blur', usage: 'Frames on hover, floating works' },
]

export interface MotionToken {
  token: string
  value: string
  usage: string
}

export const MOTION_TOKENS: MotionToken[] = [
  { token: '--duration-fast', value: '140ms', usage: 'Hover and focus responses' },
  { token: '--duration-base', value: '220ms', usage: 'Frame lift, panel reveals' },
  { token: '--duration-slow', value: '420ms', usage: 'Larger transitions' },
  { token: '--duration-float', value: '34s', usage: 'One full floating-art drift cycle' },
  { token: '--ease-standard', value: 'cubic-bezier(.32,.08,.24,1)', usage: 'Default interface easing' },
  { token: '--ease-out', value: 'cubic-bezier(.16,.84,.28,1)', usage: 'Elements arriving or lifting' },
  { token: '--ease-inout', value: 'cubic-bezier(.45,.05,.55,.95)', usage: 'Continuous loops' },
]

export interface Breakpoint {
  width: string
  target: string
  change: string
}

export const BREAKPOINTS: Breakpoint[] = [
  {
    width: '360px',
    target: 'Small Android phones',
    change:
      'Single column throughout; the floating composition narrows and drops to three works; no horizontal scrolling.',
  },
  {
    width: '390 – 430px',
    target: 'Common phones',
    change: 'Identical layout to 360px with slightly wider type; gutters grow with clamp().',
  },
  {
    width: '540px',
    target: 'Large phones',
    change: 'Artwork grids move to two columns.',
  },
  {
    width: '600px',
    target: 'Phones, landscape',
    change: 'The header search shows its text label beside the icon.',
  },
  {
    width: '700px',
    target: 'Small tablets',
    change: 'Collection grids move to two columns.',
  },
  {
    width: '768px',
    target: 'Tablets',
    change:
      'Section headings align with their action link, three-column rows appear, and the footer splits into link groups.',
  },
  {
    width: '900px',
    target: 'Landscape tablets',
    change: 'Artwork grids move to three columns.',
  },
  {
    width: '1024px',
    target: 'Laptops',
    change:
      'Desktop navigation replaces the mobile panel, the homepage hero becomes two columns, and artwork detail becomes a two-column layout with a sticky detail rail.',
  },
  {
    width: '1440px',
    target: 'Desktop',
    change: 'The container caps at 1200px, so line length and grid density stay readable.',
  },
]
