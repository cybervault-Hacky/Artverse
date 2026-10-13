import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  /** Renders a router link. Mutually exclusive with `href`. */
  to?: string
  /** Renders an external anchor. Mutually exclusive with `to`. */
  href?: string
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  title?: string
  'aria-label'?: string
  /**
   * An id for the control itself, so a page can point at it — the checkout
   * preview needs a stable handle on the action it keeps disabled.
   */
  id?: string
  /** Ids of the elements that explain this control, read out with its name. */
  'aria-describedby'?: string
  onClick?: () => void
}

/**
 * The single button treatment in ArtVerse.
 *
 * One component covers both actions and navigation so that dimensions,
 * typography, focus styling and hover behaviour never drift apart.
 */
export function Button({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  type = 'button',
  className,
  title,
  'aria-label': ariaLabel,
  id,
  'aria-describedby': ariaDescribedBy,
  onClick,
}: ButtonProps) {
  const classes = cn(styles.button, styles[variant], styles[size], block && styles.block, className)

  if (to && !disabled) {
    return (
      <Link className={classes} to={to} title={title} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    )
  }

  if (href && !disabled) {
    return (
      <a
        className={classes}
        href={href}
        title={title}
        aria-label={ariaLabel}
        rel="noreferrer"
        onClick={onClick}
      >
        {children}
      </a>
    )
  }

  // Disabled navigation stays visible and understandable instead of disappearing.
  if (to || href) {
    const handleDisabledClick = (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()

    return (
      <a
        className={classes}
        href={to ?? href}
        title={title}
        aria-label={ariaLabel}
        aria-disabled="true"
        tabIndex={-1}
        onClick={handleDisabledClick}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={classes}
      type={type}
      id={id}
      title={title}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
