import type { Artwork } from '@/types'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { cn } from '@/utils/cn'
import styles from './FloatingArtwork.module.css'

export type FloatingVariant = 'default' | 'compact'

/**
 * Slots in placement order. Each name describes where the work sits rather than
 * what it is, so any record can take any slot.
 */
type WorkSlot = 'main' | 'upper' | 'lower' | 'side'

const SLOT_CLASS: Record<WorkSlot, string> = {
  main: styles.workMain,
  upper: styles.workUpper,
  lower: styles.workLower,
  side: styles.workSide,
}

/** Which slots the full and compact arrangements fill, in works order. */
const SLOT_SETS: Record<FloatingVariant, WorkSlot[]> = {
  default: ['main', 'upper', 'lower', 'side'],
  compact: ['main', 'upper'],
}

interface FloatingArtworkProps {
  /** Works to place, in slot order. Extra records beyond the slots are ignored. */
  works: Artwork[]
  /**
   * `default` fills the whole arrangement; `compact` keeps the dominant work
   * with one companion, for narrower or secondary placements.
   */
  variant?: FloatingVariant
  /** Freezes the drift without removing the composition. */
  paused?: boolean
  className?: string
}

/**
 * The ArtVerse signature floating-art composition.
 *
 * A curated group of works — one dominant painting, a smaller artwork floating
 * higher, a sculptural object low and to the left, and a lamp holding the right
 * edge — drifting slowly left to right at different speeds and heights.
 *
 * It is pure CSS: two slow loops per work, thousands of milliseconds apart in
 * duration and delay, composited on `transform` and `translate` only. Phones
 * drop to three works with shorter travel, and reduced-motion visitors get the
 * same arrangement held perfectly still.
 *
 * The arrangement is decorative, so it is announced once through the figure
 * label; each work keeps its own alternative text.
 */
export function FloatingArtwork({
  works,
  variant = 'default',
  paused = false,
  className,
}: FloatingArtworkProps) {
  const placed = SLOT_SETS[variant]
    .map((slot, index) => ({ slot, work: works[index] }))
    .filter((entry): entry is { slot: WorkSlot; work: Artwork } => Boolean(entry.work))

  const titles = placed.map(({ work }) => work.title).join(', ')

  return (
    <figure
      className={cn(styles.stageWrapper, paused && styles.paused, className)}
      aria-label={
        titles
          ? `Illustrative floating arrangement of sample artworks: ${titles}`
          : 'Illustrative floating arrangement of sample artworks'
      }
    >
      <div className={styles.stage}>
        <div className={styles.details} aria-hidden="true">
          <span className={styles.glow} />
          <span className={cn(styles.orbit, styles.orbitOuter)} />
          <span className={cn(styles.orbit, styles.orbitInner)} />
          <span className={cn(styles.orbit, styles.orbitTilted)} />
        </div>

        {placed.map(({ slot, work }) => (
          <div key={work.id} className={cn(styles.work, SLOT_CLASS[slot])}>
            <ArtworkFrame
              src={work.image.src}
              alt={work.image.alt}
              width={work.image.width}
              height={work.image.height}
              aspect={work.aspect}
              ratio={work.image.width / work.image.height}
              elevation="lift"
              loading={slot === 'main' ? 'eager' : 'lazy'}
              sizes="(max-width: 767px) 60vw, 30vw"
            />
          </div>
        ))}

        <span className={cn(styles.comet, styles.cometOne)} aria-hidden="true" />
      </div>
    </figure>
  )
}
