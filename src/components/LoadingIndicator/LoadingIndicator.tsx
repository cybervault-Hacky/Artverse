import { cn } from '@/utils/cn'
import styles from './LoadingIndicator.module.css'

interface LoadingIndicatorProps {
  /** Visible status text. Also announced to assistive technology. */
  label?: string
  className?: string
}

/**
 * Small, quiet progress indicator reserved for genuinely asynchronous moments
 * such as lazy-loading a route chunk. Phase 1 has no network calls, so this
 * component stays unused by page content and is demonstrated on the
 * design-system page.
 */
export function LoadingIndicator({
  label = 'Loading…',
  className,
}: LoadingIndicatorProps) {
  return (
    <div className={cn(styles.indicator, className)} role="status" aria-live="polite">
      <span className={styles.ring} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
