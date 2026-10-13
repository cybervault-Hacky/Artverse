import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import styles from './TextLink.module.css'

interface TextLinkProps {
  children: ReactNode
  /** Internal router destination. */
  to?: string
  /** External destination. */
  href?: string
  /** Uses the champagne accent for the link text. */
  accent?: boolean
  /** Appends a restrained arrow glyph that nudges on hover. */
  arrow?: boolean
  className?: string
  'aria-label'?: string
}

/**
 * Inline text link, used for secondary navigation inside copy and sections.
 * Distinct from Button, which carries the primary call-to-action weight.
 */
export function TextLink({
  children,
  to,
  href,
  accent = false,
  arrow = false,
  className,
  'aria-label': ariaLabel,
}: TextLinkProps) {
  const classes = cn(styles.link, accent && styles.accent, className)
  const content = (
    <>
      {children}
      {arrow ? (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link className={classes} to={to} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={classes} href={href} aria-label={ariaLabel} rel="noreferrer">
        {content}
      </a>
    )
  }

  return <span className={classes}>{content}</span>
}
