import { Link } from 'react-router-dom'
import type { Artwork, Collection } from '@/types'
import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { countLabel } from '@/utils/text'
import { cn } from '@/utils/cn'
import styles from './CollectionCard.module.css'

interface CollectionCardProps {
  collection: Collection
  /** Lead work shown as the card's image. */
  leadArtwork?: Artwork
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Collection presentation. A collection is represented by its lead work and a
 * short summary — no invented curator names or editorial claims.
 */
export function CollectionCard({
  collection,
  leadArtwork,
  headingLevel: Heading = 'h3',
  className,
}: CollectionCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <Link
        className={styles.link}
        to={NavRoutes.collection(collection.id)}
        aria-label={`${collection.title} — view collection`}
      >
        {leadArtwork ? (
          <ArtworkFrame
            className={styles.frame}
            src={leadArtwork.image.src}
            alt={leadArtwork.image.alt}
            width={leadArtwork.image.width}
            height={leadArtwork.image.height}
            aspect="landscape"
            ratio={leadArtwork.image.width / leadArtwork.image.height}
            sizes="(max-width: 539px) 92vw, (max-width: 899px) 45vw, 30vw"
          />
        ) : null}

        <div className={styles.body}>
          <Heading className={styles.title}>{collection.title}</Heading>
          <p className={styles.summary}>{collection.summary}</p>
          <p className={styles.meta}>{countLabel(collection.artworkIds.length, 'sample work')}</p>
        </div>
      </Link>
    </article>
  )
}
