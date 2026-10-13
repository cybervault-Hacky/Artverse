import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  /** Optional single action, typically a Button to a useful destination. */
  action?: ReactNode
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Honest, quiet placeholder for areas whose real content arrives in a later
 * phase — or for genuinely empty results. It never imitates live data.
 */
export function EmptyState({
  title,
  description,
  action,
  headingLevel: Heading = 'h2',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, className)}>
      <Heading className={styles.title}>{title}</Heading>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
