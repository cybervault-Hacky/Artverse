/**
 * Shared ArtVerse domain types.
 *
 * The shapes the foundation needs: artwork records, collections and the
 * illustrative creators behind the sample data, plus the two optional fields
 * Phase 9 added so price and provenance can be *presented* honestly.
 *
 * Neither field is a marketplace feature. There are no listings, no accounts,
 * no orders and no certificates anywhere in this build: `ArtworkPrice` exists
 * so a genuinely priced record has somewhere to put its amount and its currency
 * code, and `ArtworkProvenance` so a statement the catalogue really holds has
 * somewhere to live. No record in `src/data/` carries either one, which is the
 * honest state of a catalogue with nothing for sale.
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
  /** Primary medium or craft, e.g. `Painting — placeholder record`. */
  discipline: string
  /** City and country of practice, shown where a record provides one. */
  location?: string
  /**
   * Short practice note.
   *
   * Optional, and always illustrative when present: these lines describe the
   * placeholder records this build ships and the way each one works with its
   * material — never a real artist, studio history, exhibition or statement.
   * A creator without one is shown as having no practice note yet, rather than
   * being given invented copy.
   */
  bio?: string
  illustrative: true
}

/**
 * A price a record actually carries.
 *
 * Both fields are required, and that is the point: an amount without its
 * currency code means nothing, and nothing in ArtVerse converts between
 * currencies or assumes they are interchangeable. A record without this field
 * is shown as having no price rather than as being free or “price on
 * application”, either of which would be an invented claim.
 */
export interface ArtworkPrice {
  /** The amount, in the units of `currency`. Never formatted or converted. */
  amount: number
  /** ISO 4217 code, e.g. `INR`. Shown beside the amount wherever it appears. */
  currency: string
}

/**
 * A provenance statement the catalogue genuinely holds.
 *
 * Optional, absent from every record this build ships, and deliberately not a
 * verification: a statement is what a seller or catalogue says about a work's
 * history, and it is presented as exactly that. Ownership chains, authenticity
 * claims, signatures, edition numbers and certificate references are not
 * modelled at all, because nothing in this build can support one.
 */
export interface ArtworkProvenance {
  /** The statement, shown verbatim. Blank means “not provided”. */
  statement?: string
  /** Where the statement came from, e.g. the studio or a catalogue note. */
  source?: string
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
  /**
   * Set only when a trustworthy amount and its currency code are both known.
   * No sample record carries one today.
   */
  price?: ArtworkPrice
  /**
   * Set only when the catalogue holds a real statement about the work's
   * history. Absent here, and shown on the artwork page as “not provided”
   * rather than filled in with a story.
   */
  provenance?: ArtworkProvenance
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

/**
 * A creative discipline as presented on the homepage.
 *
 * Disciplines are the five directions the marketplace is organised around.
 * Each one points at a sample record used as its cover image, so the section is
 * driven by data rather than by hard-coded image paths in a page component.
 */
export interface Discipline {
  id: ArtworkCategory
  label: string
  /** One short editorial sentence. */
  description: string
  /** Sample record used as the discipline's cover image. */
  sampleArtworkId: string
}

/** A breadcrumb entry used by the Breadcrumb component. */
export interface Crumb {
  label: string
  /** Omitted for the current page, which is rendered as plain text. */
  to?: string
}
