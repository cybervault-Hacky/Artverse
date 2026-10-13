import type { SVGProps } from 'react'

/**
 * The small set of interface glyphs ArtVerse needs today.
 * Decorative by default — every icon is `aria-hidden` and the surrounding
 * control carries the accessible name.
 */

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.25" />
      <path d="M15.6 15.6 20 20" />
    </Icon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Icon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5 9.5 17 19 7" />
    </Icon>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5 12 15.5 18 9.5" />
    </Icon>
  )
}

/** Saved works: a heart outline, matching the stroke of the rest of the set. */
export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19.5S4.75 15.4 4.75 9.9A3.65 3.65 0 0 1 12 7.9a3.65 3.65 0 0 1 7.25 2c0 5.5-7.25 9.6-7.25 9.6Z" />
    </Icon>
  )
}

/** The cart: a keepsake box with a handle, drawn in the same hand. */
export function CartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 9h14l-1 10.25H6L5 9Z" />
      <path d="M9 9V6.75a3 3 0 0 1 6 0V9" />
    </Icon>
  )
}
