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
  headingLevel = 'h3',
  className,
}: ArtworkGridProps) {
  if (artworks.length === 0) return null

  return (
    <ul className={cn(styles.grid, className)} aria-label={label}>
      {artworks.map((artwork) => (
        <li key={artwork.id} className={styles.item}>
          <ArtworkCard
            artwork={artwork}
            aspect={aspect}
            headingLevel={headingLevel}
            sizes="(max-width: 539px) 92vw, (max-width: 899px) 45vw, 30vw"
          />
        </li>
      ))}
    </ul>
  )
}
