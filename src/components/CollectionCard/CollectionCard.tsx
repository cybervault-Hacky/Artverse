import { Link } from 'react-router-dom'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { cn } from '@/utils/cn'
import { countLabel } from '@/utils/text'
import type { CollectionEntry } from '@/utils/collections'
import styles from './CollectionCard.module.css'

interface CollectionCardProps {
  entry: CollectionEntry
  /**
   * `standard` is the grid card. `feature` is the same record composed at
   * editorial scale — a wide image beside the text — used where a collection is
   * given a full-width moment. Neither is a judgement about the collection.
   */
  variant?: 'standard' | 'feature'
  /** Describes the rendered width, so a future srcset resolves correctly. */
  sizes?: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * Collection presentation.
 *
 * A collection is represented by one of its own works plus its summary and an
 * accurate count — no invented curators, endorsements or editorial claims.
 *
 * Two things worth knowing:
 * - The count comes from the entry's resolved works, so it always matches what
 *   the collection page actually renders.
 * - A collection whose works carry no usable image renders a labelled panel
 *   instead. No `<img>` is emitted at all, so there is never a broken image or
 *   an empty `src`. The panel says how many works the collection holds, so it
 *   still carries information rather than being decoration.
 */
export function CollectionCard({
  entry,
  variant = 'standard',
  sizes = '(max-width: 699px) 92vw, (max-width: 1023px) 45vw, 30vw',
  headingLevel: Heading = 'h3',
  className,
}: CollectionCardProps) {
  const isFeature = variant === 'feature'
  const { collection } = entry

  const body = (
    <>
      <div className={styles.media}>
        {entry.leadWork ? (
          <ArtworkFrame
            className={styles.frame}
            src={entry.leadWork.image.src}
            alt={entry.leadWork.image.alt}
            width={entry.leadWork.image.width}
            height={entry.leadWork.image.height}
            aspect="landscape"
            ratio={entry.leadWork.image.width / entry.leadWork.image.height}
            sizes={sizes}
          />
        ) : (
          <span className={cn(styles.noImage, isFeature && styles.noImageFeature)}>
            {entry.hasWorks
              ? `${countLabel(entry.workCount, 'sample work')} · no image attached`
              : 'No works in this collection'}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <Heading className={styles.title}>{collection.title}</Heading>
        {entry.summary ? <p className={styles.summary}>{entry.summary}</p> : null}
        {isFeature && entry.description ? (
          <p className={styles.description}>{entry.description}</p>
        ) : null}
        <p className={styles.meta}>{countLabel(entry.workCount, 'sample work')}</p>
        <span className={styles.cta}>
          Open the collection
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </>
  )

  const classes = cn(styles.card, isFeature && styles.cardFeature, className)

  // A record without a usable id renders as a static card rather than a link
  // to nowhere.
  if (!entry.href) {
    return <article className={classes}>{body}</article>
  }

  return (
    <article className={classes}>
      <Link
        className={cn(styles.link, isFeature && styles.linkFeature)}
        to={entry.href}
        aria-label={`${collection.title} — open collection`}
      >
        {body}
      </Link>
    </article>
  )
}
