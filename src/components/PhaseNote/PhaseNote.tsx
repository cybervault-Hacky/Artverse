import { cn } from '@/utils/cn'
import styles from './PhaseNote.module.css'

interface PhaseNoteProps {
  /** Short phase reference, e.g. `Phase 2`. */
  phase: string
  title?: string
  description?: string
  /** Capabilities that genuinely do not exist yet. */
  items: string[]
  className?: string
}

/**
 * Honest "not built yet" block.
 *
 * Phase 1 pages are real routes with real introductions, but most of their
 * features belong to later phases. This states that plainly instead of faking
 * content or functionality.
 */
export function PhaseNote({
  phase,
  title = 'What this page will carry later',
  description,
  items,
  className,
}: PhaseNoteProps) {
  return (
    <section className={cn(styles.note, className)} aria-label={`Planned for ${phase}`}>
      <p className={styles.label}>Planned for {phase}</p>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item} className={styles.item}>
            <span className={styles.marker} aria-hidden="true">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
