import { Link } from 'react-router-dom'
import type { Artwork, ArtworkAspect } from '@/types'
import { categoryLabel } from '@/data'
import { NavRoutes } from '@/app/routes'
import { cn } from '@/utils/cn'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import styles from './ArtworkCard.module.css'

interface ArtworkCardProps {
  artwork: Artwork
  /** Overrides the frame ratio, e.g. to keep a grid perfectly aligned. */
  aspect?: ArtworkAspect
  /** Heading level for the artwork title, to preserve the page outline. */
  headingLevel?: 'h2' | 'h3'
  /** Hides the category and medium line where space is tight. */
  showMeta?: boolean
  /**
   * Image loading strategy. Cards are lazy by default; a grid can mark its
   * first row eager so above-the-fold work is not delayed.
   */
  loading?: 'lazy' | 'eager'
  /** Forwarded to the frame for responsive image selection. */
  sizes?: string
  className?: string
}

/**
 * Artwork presentation used in directories, collection pages and future
 * homepage sections. The whole card is one link to the artwork route, and the
 * frame carries the site's signature hover lift.
 */
export function ArtworkCard({
  artwork,
  aspect,
  headingLevel: Heading = 'h3',
  showMeta = true,
  loading = 'lazy',
  sizes,
  className,
}: ArtworkCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <Link
        className={styles.link}
        to={NavRoutes.artwork(artwork.id)}
        aria-label={`${artwork.title} — view artwork`}
      >
        <ArtworkFrame
          className={styles.frame}
          src={artwork.image.src}
          alt={artwork.image.alt}
          width={artwork.image.width}
          height={artwork.image.height}
          aspect={aspect ?? artwork.aspect}
          ratio={artwork.image.width / artwork.image.height}
          loading={loading}
          sizes={sizes}
        />
        <div className={styles.body}>
          <Heading className={styles.title}>{artwork.title}</Heading>
          {showMeta ? (
            <p className={styles.meta}>
              {categoryLabel(artwork.category)} · {artwork.medium}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
