import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './Section.module.css'

interface SectionProps {
  children: ReactNode
  id?: string
  /** Id of the heading that names this section, for assistive technology. */
  ariaLabelledBy?: string
  /** Background treatment. Charcoal is reserved for occasional contrast bands. */
  tone?: 'canvas' | 'surface' | 'charcoal'
  spacing?: 'default' | 'tight' | 'none'
  /** Draws a hairline along the top edge to separate stacked sections. */
  divided?: boolean
  className?: string
}

/** Vertical rhythm wrapper for page sections. */
export function Section({
  children,
  id,
  ariaLabelledBy,
  tone = 'canvas',
  spacing = 'default',
  divided = false,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        styles.section,
        styles[tone],
        styles[spacing],
        divided && styles.divided,
        className,
      )}
    >
      {children}
    </section>
  )
}
