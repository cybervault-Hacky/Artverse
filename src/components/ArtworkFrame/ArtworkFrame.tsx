import type { ArtworkAspect } from '@/types'
import { aspectRatioValue } from '@/utils/aspect'
import { cn } from '@/utils/cn'
import styles from './ArtworkFrame.module.css'

interface ArtworkFrameProps {
  src: string
  /** Meaningful alternative text — never left empty for real artwork. */
  alt: string
  /** Intrinsic pixel dimensions, so space is reserved before the file loads. */
  width?: number
  height?: number
  /** Fixed presentation ratio. Defaults to `portrait`. */
  aspect?: ArtworkAspect
  /** Intrinsic ratio, used when `aspect` is `natural`. */
  ratio?: number
  radius?: 'sm' | 'md' | 'lg'
  /**
   * Depth of the frame: flush by default, `rest` for a work presented as an
   * object, `lift` for works in the floating composition.
   */
  elevation?: 'none' | 'rest' | 'lift'
  loading?: 'lazy' | 'eager'
  sizes?: string
  className?: string
  imageClassName?: string
}

/**
 * The primitive that every artwork presentation is built on.
 *
 * A frame owns one job: hold an image at a chosen ratio without shifting
 * layout. The signature hover lift lives in the components that compose it,
 * so the same frame can be static (detail page) or animated (grid, hero).
 */
export function ArtworkFrame({
  src,
  alt,
  width,
  height,
  aspect = 'portrait',
  ratio,
  radius = 'sm',
  elevation = 'none',
  loading = 'lazy',
  sizes,
  className,
  imageClassName,
}: ArtworkFrameProps) {
  return (
    <div
      className={cn(
        styles.frame,
        styles[radius],
        elevation === 'rest' && styles.elevationRest,
        elevation === 'lift' && styles.elevationLift,
        className,
      )}
      style={{ aspectRatio: aspectRatioValue(aspect, ratio) }}
    >
      <img
        className={cn(styles.image, imageClassName)}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        sizes={sizes}
        draggable={false}
      />
    </div>
  )
}
