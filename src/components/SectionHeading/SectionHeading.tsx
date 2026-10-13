import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  /** Small editorial label above the title. */
  eyebrow?: string
  title?: string
  /** Applied to the heading element, so sections can reference it via aria-labelledby. */
  id?: string
  description?: ReactNode
  /** Trailing content, typically a TextLink to a related destination. */
  action?: ReactNode
  /** Heading level, so page outlines stay hierarchical. Defaults to `h2`. */
  as?: 'h2' | 'h3'
  className?: string
}

/** Shared heading block for content sections. */
export function SectionHeading({
  eyebrow,
  title,
  id,
  description,
  action,
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(styles.heading, action ? styles.withAction : undefined, className)}>
      <div className={styles.text}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {title ? (
          <Heading className={styles.title} id={id}>
            {title}
          </Heading>
        ) : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
