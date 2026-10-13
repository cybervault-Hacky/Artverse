import { Link } from 'react-router-dom'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { cn } from '@/utils/cn'
import { countLabel } from '@/utils/text'
import { studioPracticeLine, type StudioEntry } from '@/utils/studioProfile'
import styles from './StudioCard.module.css'

interface StudioCardProps {
  entry: StudioEntry
  /** Heading level for the studio name, to preserve the page outline. */
  headingLevel?: 'h2' | 'h3'
  className?: string
}

/**
 * One studio in the directory.
 *
 * The image is the studio's own work, not a portrait — this build holds no
 * studio photography, and nothing here pretends otherwise. The frame keeps the
 * site-wide hover lift, and the whole card is a single link so the target is
 * generous on a touchscreen. A record with no usable id renders as a static
 * card rather than a link to nowhere.
 */
export function StudioCard({ entry, headingLevel: Heading = 'h3', className }: StudioCardProps) {
  const practiceLine = studioPracticeLine(entry)

  const body = (
    <>
      <div className={styles.media}>
        {entry.leadWork ? (
          <>
            <ArtworkFrame
              className={styles.frame}
              src={entry.leadWork.image.src}
              alt={entry.leadWork.image.alt}
              width={entry.leadWork.image.width}
              height={entry.leadWork.image.height}
              aspect="portrait"
              sizes="(max-width: 639px) 92vw, (max-width: 1023px) 45vw, 30vw"
            />
            {/* Only ever shown over a work — there is nothing to label otherwise. */}
            <span className={styles.mediaLabel}>Sample work</span>
          </>
        ) : (
          <span className={styles.noWork} aria-hidden="true">
            No records
          </span>
        )}
      </div>

      <div className={styles.body}>
        <Heading className={styles.name}>{entry.name}</Heading>
        {practiceLine ? <p className={styles.practice}>{practiceLine}</p> : null}
        <p className={styles.count}>{countLabel(entry.workCount, 'sample record')}</p>
        {entry.illustrative ? <p className={styles.illustrative}>Illustrative profile</p> : null}
        <span className={styles.cta}>
          View studio profile
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </>
  )

  if (!entry.href) {
    return <article className={cn(styles.card, className)}>{body}</article>
  }

  return (
    <article className={cn(styles.card, className)}>
      <Link
        className={styles.link}
        to={entry.href}
        aria-label={`${entry.name} — view studio profile`}
      >
        {body}
      </Link>
    </article>
  )
}
