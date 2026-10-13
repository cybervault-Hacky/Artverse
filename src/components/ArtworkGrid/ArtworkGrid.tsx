import type { Artwork, ArtworkAspect } from '@/types'
import { ArtworkCard } from '@/components/ArtworkCard/ArtworkCard'
import { cn } from '@/utils/cn'
import styles from './ArtworkGrid.module.css'

interface ArtworkGridProps {
  artworks: Artwork[]
  /** Accessible name for the grid, e.g. "Sample artworks". */
  label: string
  /** Forces every frame to one ratio so rows stay aligned. */
  aspect?: ArtworkAspect
  /**
   * How many leading cards load their image eagerly. Leave at 0 for
   * below-the-fold grids; set it to roughly one row for a grid that opens a
   * page, so the first works are not held back by lazy loading.
   */
  eagerCount?: number
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Responsive grid of artwork cards: one column on phones, two on tablets and
 * three from 900px. Used by the discover, collection and artist pages.
 */
export function ArtworkGrid({
  artworks,
  label,
  aspect,
  eagerCount = 0,
  headingLevel = 'h3',
  className,
}: ArtworkGridProps) {
  if (artworks.length === 0) return null

  return (
    <ul className={cn(styles.grid, className)} aria-label={label}>
      {artworks.map((artwork, index) => (
        <li key={artwork.id} className={styles.item}>
          <ArtworkCard
            artwork={artwork}
            aspect={aspect}
            headingLevel={headingLevel}
            loading={index < eagerCount ? 'eager' : 'lazy'}
            sizes="(max-width: 539px) 92vw, (max-width: 899px) 45vw, 30vw"
          />
        </li>
      ))}
    </ul>
  )
}
