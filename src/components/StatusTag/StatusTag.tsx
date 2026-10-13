import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './StatusTag.module.css'

type StatusTone = 'accent' | 'neutral' | 'quiet'

interface StatusTagProps {
  children: ReactNode
  /**
   * `accent` marks a preview or a passing check, `neutral` something in
   * progress, `quiet` a plain fact about a record. The tone is decoration on
   * top of the words — the tag always says what it means.
   */
  tone?: StatusTone
  className?: string
}

/**
 * A small, labelled state marker.
 *
 * Used for the workspace's preview state, for a draft held in the tab, and for
 * the illustrative-record marker on a listing row. It is never a metric and
 * never a badge of approval: nothing in ArtVerse verifies anybody.
 */
export function StatusTag({ children, tone = 'neutral', className }: StatusTagProps) {
  return (
    <span className={cn(styles.tag, styles[tone], className)}>{children}</span>
  )
}
