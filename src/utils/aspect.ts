import type { ArtworkAspect } from '@/types'

/**
 * Frame aspects used across ArtVerse.
 *
 * Frames are deliberately few so that grids stay visually aligned: artwork
 * images are cropped to the frame, and the intrinsic file ratio is only used
 * where a piece should be seen in full (the artwork detail page).
 */
export const ASPECT_RATIOS = {
  portrait: '4 / 5',
  tall: '2 / 3',
  square: '1 / 1',
  landscape: '3 / 2',
} as const satisfies Record<Exclude<ArtworkAspect, 'natural'>, string>

export type FixedAspect = keyof typeof ASPECT_RATIOS

/** Resolves an aspect token to a CSS `aspect-ratio` value. */
export function aspectRatioValue(aspect: ArtworkAspect, intrinsicRatio?: number): string {
  if (aspect === 'natural') {
    return intrinsicRatio && intrinsicRatio > 0 ? String(intrinsicRatio) : ASPECT_RATIOS.portrait
  }
  return ASPECT_RATIOS[aspect]
}
