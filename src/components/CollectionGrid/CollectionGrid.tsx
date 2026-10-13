import type { Artwork, Collection } from '@/types'
import { CollectionCard } from '@/components/CollectionCard/CollectionCard'
import { cn } from '@/utils/cn'
import styles from './CollectionGrid.module.css'

interface CollectionGridProps {
  collections: Collection[]
  /** Resolves each collection's lead work; return `undefined` to omit one. */
  leadArtworkFor: (collection: Collection) => Artwork | undefined
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

/** Responsive grid of collection cards. */
export function CollectionGrid({
  collections,
  leadArtworkFor,
  label,
  columns = 'auto',
  sizes,
  headingLevel = 'h3',
  className,
}: CollectionGridProps) {
  if (collections.length === 0) return null

  return (
    <ul
      className={cn(styles.grid, columns === 'two' && styles.gridTwo, className)}
      aria-label={label}
    >
      {collections.map((collection) => (
        <li key={collection.id} className={styles.item}>
          <CollectionCard
            collection={collection}
            leadArtwork={leadArtworkFor(collection)}
            sizes={sizes}
            headingLevel={headingLevel}
          />
        </li>
      ))}
    </ul>
  )
}
