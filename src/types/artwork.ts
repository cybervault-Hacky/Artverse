/**
 * Shared ArtVerse domain types.
 *
 * Phase 1 only models the shapes needed by the foundation: artwork records,
 * collections and the illustrative creators behind the sample data. Selling,
 * orders, certificates and accounts are deliberately absent until their phases.
 */

/** Marketplace categories surfaced across ArtVerse. */
export type ArtworkCategory = 'painting' | 'digital' | 'decor' | 'handmade' | 'custom'

/** Display aspect used by artwork frames. `natural` follows the file's own ratio. */
export type ArtworkAspect = 'portrait' | 'square' | 'landscape' | 'tall' | 'natural'

export interface ArtworkImage {
  /** Path to a local asset under `public/`. */
  src: string
  /** Intrinsic pixel size, used to reserve layout space and avoid shifting. */
  width: number
  height: number
  /** Descriptive alternative text for assistive technology. */
  alt: string
}

/**
 * A creator record.
 *
 * Phase 1 ships illustrative placeholder creators so that layout, routing and
 * typography can be exercised. The `illustrative` flag is required and always
 * true — real studio profiles arrive in the artists phase.
 */
export interface Creator {
  id: string
  name: string
  discipline: string
  illustrative: true
}

export interface Artwork {
  id: string
  title: string
  category: ArtworkCategory
  medium: string
  year: number
  dimensions: string
  /** Short editorial description of the piece. */
  description: string
  image: ArtworkImage
  aspect: ArtworkAspect
  creatorId: string
  /** Illustrative placeholder record — never a live marketplace listing. */
  sample: true
}

export interface Collection {
  id: string
  title: string
  /** One-line summary used on cards and listings. */
  summary: string
  description: string
  artworkIds: string[]
  sample: true
}

export interface CategoryOption {
  id: ArtworkCategory
  label: string
}

/** A breadcrumb entry used by the Breadcrumb component. */
export interface Crumb {
  label: string
  /** Omitted for the current page, which is rendered as plain text. */
  to?: string
}
