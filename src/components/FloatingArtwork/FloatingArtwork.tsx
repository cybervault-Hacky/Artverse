import type { Artwork } from '@/types'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { cn } from '@/utils/cn'
import styles from './FloatingArtwork.module.css'

export type FloatingVariant = 'default' | 'compact'

type WorkSlot = 'main' | 'left' | 'right' | 'lowerRight'

const SLOT_CLASS: Record<WorkSlot, string> = {
  main: styles.workMain,
  left: styles.workLeft,
  right: styles.workRight,
  lowerRight: styles.workLowerRight,
}

interface FloatingArtworkProps {
  /** Works to place. Records beyond the available slots are ignored. */
  works: Artwork[]
  /**
   * `compact` keeps the dominant work plus one companion, for narrow or
   * secondary placements such as the design-system preview.
   */
  variant?: FloatingVariant
  /** Freezes the drift without removing the composition. */
  paused?: boolean
  className?: string
}

/**
 * The ArtVerse signature floating-art composition.
 *
 * Phase 1 ships this as a working, reusable prototype: slow left-to-right
 * drift, staggered loops, controlled depth and soft shadows. It is pure CSS —
 * no animation library is added to the bundle for this effect — and it
 * degrades to a still arrangement when reduced motion is requested.
 *
 * The arrangement is decorative, so it is announced once through the figure
 * label; the individual works keep their own alternative text.
 */
export function FloatingArtwork({
  works,
  variant = 'default',
  paused = false,
  className,
}: FloatingArtworkProps) {
  const [main, second, third, fourth] = works
  const compact = variant === 'compact'

  // In the compact layout the companion takes the upper-right slot and the
  // remaining works rest.
  const placed: Array<{ slot: WorkSlot; work: Artwork }> = []
  if (main) placed.push({ slot: 'main', work: main })
  if (compact) {
    const companion = third ?? second
    if (companion) placed.push({ slot: 'right', work: companion })
  } else {
    if (second) placed.push({ slot: 'left', work: second })
    if (third) placed.push({ slot: 'right', work: third })
    if (fourth) placed.push({ slot: 'lowerRight', work: fourth })
  }

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
        <div className={styles.orbitLayer} aria-hidden="true">
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
