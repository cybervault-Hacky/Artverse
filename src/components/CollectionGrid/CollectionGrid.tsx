import { CollectionCard } from '@/components/CollectionCard/CollectionCard'
import { cn } from '@/utils/cn'
import type { CollectionEntry } from '@/utils/collections'
import styles from './CollectionGrid.module.css'

interface CollectionGridProps {
  /** Entries built by `buildCollectionDirectory` — the resolved collection model. */
  entries: CollectionEntry[]
  label: string
  /**
   * `auto` grows to three columns on wide screens; `two` stays at two, for
   * calmer editorial rows such as the homepage.
   */
  columns?: 'auto' | 'two'
  /** Describes the rendered image width for each card. */
  sizes?: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Responsive grid of collection cards.
 *
 * It takes resolved entries rather than raw collections so that the lead work,
 * the count and the destination are decided once, in the shared collection
 * model, instead of being passed in again by every page that renders a grid.
 */
export function CollectionGrid({
  entries,
  label,
  columns = 'auto',
  sizes,
  headingLevel = 'h3',
  className,
}: CollectionGridProps) {
  if (entries.length === 0) return null

  return (
    <ul
      className={cn(styles.grid, columns === 'two' && styles.gridTwo, className)}
      aria-label={label}
    >
      {entries.map((entry) => (
        <li key={entry.collection.id} className={styles.item}>
          <CollectionCard entry={entry} sizes={sizes} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  )
}
