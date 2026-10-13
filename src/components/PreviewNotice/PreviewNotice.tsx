import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './PreviewNotice.module.css'

interface PreviewNoticeProps {
  /** The notice's own label. Defaults to the word the whole build uses. */
  label?: string
  children: ReactNode
  className?: string
}

/**
 * The block that says what a screen is not.
 *
 * Every preview surface in the studio workspace carries one of these, stating
 * in plain words that nothing here is connected to an account, a database or a
 * publication step. It is deliberately a first-class block rather than a
 * footnote: the honest state of a frontend preview is information a reader
 * needs before they interact with anything.
 */
export function PreviewNotice({ label = 'Preview', children, className }: PreviewNoticeProps) {
  return (
    <div className={cn(styles.notice, className)}>
      <span className="visually-hidden">{label}: </span>
      <span className={styles.tag} aria-hidden="true">
        {label}
      </span>
      <p className={styles.text}>{children}</p>
    </div>
  )
}
