import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import styles from './Brand.module.css'

interface BrandMarkProps {
  className?: string
}

/**
 * The ArtVerse symbol: a quiet orbit with a single gold work at its centre.
 * Drawn inline so it inherits colour and stays crisp at any size.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <circle cx="16" cy="16" r="15.2" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      <ellipse
        cx="16"
        cy="16"
        rx="14.4"
        ry="5.9"
        transform="rotate(-27 16 16)"
        stroke="currentColor"
        strokeOpacity="0.42"
        strokeWidth="1"
      />
      <circle cx="16" cy="16" r="6.3" fill="var(--color-accent)" />
      <circle cx="27.2" cy="8.8" r="2" fill="currentColor" />
    </svg>
  )
}

interface BrandProps {
  /** Renders as a link home by default; pass `null` for a static lock-up. */
  to?: string | null
  size?: 'md' | 'lg'
  /** Optional line of copy rendered under the wordmark. */
  tagline?: string
  className?: string
}

/** ArtVerse lock-up: symbol plus wordmark. */
export function Brand({ to = '/', size = 'md', tagline, className }: BrandProps) {
  const content = (
    <>
      <BrandMark className={styles.mark} />
      <span className={styles.wordmark}>ArtVerse</span>
    </>
  )

  const classes = cn(styles.brand, size === 'lg' && styles.lg, className)

  return (
    <div className={cn(tagline && styles.lg)}>
      {to ? (
        <Link className={classes} to={to} aria-label="ArtVerse — home">
          {content}
        </Link>
      ) : (
        <span className={classes}>{content}</span>
      )}
      {tagline ? <span className={styles.tagline}>{tagline}</span> : null}
    </div>
  )
}
