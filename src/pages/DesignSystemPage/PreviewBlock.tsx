import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './PreviewBlock.module.css'

interface PreviewBlockProps {
  /** Unique id applied to the heading, so the block can be named and linked. */
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/** One documented specimen: a heading, an explanation and the live example. */
export function PreviewBlock({ id, title, description, children, className }: PreviewBlockProps) {
  return (
    <section className={cn(styles.block, className)} aria-labelledby={id}>
      <div className={styles.head}>
        <h3 className={styles.title} id={id}>
          {title}
        </h3>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
