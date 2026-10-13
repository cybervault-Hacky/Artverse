/**
 * The artwork detail page's data.
 *
 * Everything the page needs to *decide* lives here as pure functions, so the
 * page component only renders: which collections hold the work, what the
 * metadata rows should be, how the studio is described, and which other records
 * can honestly be called related. Three rules are enforced here rather than in
 * the markup:
 *
 * 1. Nothing is invented. Every value comes from a field the sample record
 *    actually carries; a field that is blank, or a creator that does not
 *    resolve, produces no row rather than a guess. The one exception is stated
 *    plainly instead of silently: a studio with no record renders the neutral
 *    text “Studio not recorded”, because a gap the visitor can see is more
 *    honest than a gap they have to guess at.
 * 2. Nothing links anywhere that does not exist. A studio link is only built
 *    when a creator record resolves, so a broken link is impossible from here.
 * 3. Related works are chosen by what the catalogue records — the discipline
 *    the work belongs to, then the collections it sits in — in a fixed order,
 *    with the work itself always excluded. There is no score, no weighting and
 *    no recommendation model of any kind.
 */
import type { Artwork, Collection, Creator } from '@/types'
import { NavRoutes } from '@/app/routes'
import { SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, getArtworksForCollection } from '@/data'
import { ASPECT_RATIOS } from '@/utils/aspect'
import { hasText } from '@/utils/text'

/**
 * Whether a field carries something worth showing. Re-exported from the shared
 * text helpers, where every other module reads it from.
 */
export { hasText }

/** How many related works the section shows at most. */
export const RELATED_LIMIT = 4

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

/**
 * True when the record has an image that can actually be requested. An empty
 * `src` would make the browser re-request the current page, so the page shows a
 * neutral panel instead of emitting a broken image.
 */
export function hasDisplayableImage(artwork: Artwork): boolean {
  return hasText(artwork.image?.src)
}

/** The CSS `aspect-ratio` value for the work, falling back to the frame's own. */
export function imageAspectRatio(artwork: Artwork): string {
  const { width, height } = artwork.image
  if (isPositiveNumber(width) && isPositiveNumber(height)) return String(width / height)
  return ASPECT_RATIOS.portrait
}

/** The image's own pixel size, shown as a caption detail when it is known. */
export function imagePixelLabel(artwork: Artwork): string | undefined {
  const { width, height } = artwork.image
  if (!isPositiveNumber(width) || !isPositiveNumber(height)) return undefined
  return `${width} × ${height} px`
}

/** The collections holding this work, in the catalogue's own order. */
export function getCollectionsForArtwork(artwork: Artwork): Collection[] {
  return SAMPLE_COLLECTIONS.filter((collection) => collection.artworkIds.includes(artwork.id))
}

/**
 * Where the work sits for the breadcrumb: the first collection it appears in.
 * One trail is enough; the full list is shown in the metadata.
 */
export function getPrimaryCollection(artwork: Artwork): Collection | undefined {
  return getCollectionsForArtwork(artwork)[0]
}

/**
 * Other records the catalogue genuinely links to this one, in a fixed order:
 * works sharing the discipline first, then works it appears alongside in a
 * collection, then nothing. The current work is always excluded.
 *
 * Deliberately deterministic and unweighted — the same work always produces the
 * same list — because inventing a ranking, or implying a model chose these,
 * would be a claim the data does not support.
 */
export function getRelatedArtworks(artwork: Artwork, limit: number = RELATED_LIMIT): Artwork[] {
  const picked = new Map<string, Artwork>()

  const add = (candidate: Artwork) => {
    if (candidate.id !== artwork.id && !picked.has(candidate.id)) picked.set(candidate.id, candidate)
  }

  for (const candidate of SAMPLE_ARTWORKS) {
    if (candidate.category === artwork.category) add(candidate)
  }

  for (const collection of getCollectionsForArtwork(artwork)) {
    for (const candidate of getArtworksForCollection(collection)) add(candidate)
  }

  return [...picked.values()].slice(0, Math.max(0, limit))
}

/** True when the catalogue holds another record in this work's discipline. */
export function hasDisciplineSibling(artwork: Artwork): boolean {
  return SAMPLE_ARTWORKS.some(
    (candidate) => candidate.id !== artwork.id && candidate.category === artwork.category,
  )
}

export interface DetailLink {
  label: string
  to: string
}

export interface DetailRow {
  label: string
  /** Plain value. Absent when the row carries links instead. */
  value?: string
  links?: DetailLink[]
}

/**
 * The work's own metadata, as rows. A row exists only when the record carries
 * something real for it, so no row is ever a placeholder for data that is not
 * there.
 */
export function buildArtworkDetails(artwork: Artwork): DetailRow[] {
  const rows: DetailRow[] = []

  if (hasText(artwork.medium)) rows.push({ label: 'Medium', value: artwork.medium })
  if (hasText(artwork.dimensions)) rows.push({ label: 'Dimensions', value: artwork.dimensions })
  if (Number.isFinite(artwork.year)) rows.push({ label: 'Year', value: String(artwork.year) })

  const collections = getCollectionsForArtwork(artwork)
  if (collections.length > 0) {
    rows.push({
      label: 'Collections',
      links: collections.map((collection) => ({
        label: collection.title,
        to: NavRoutes.collection(collection.id),
      })),
    })
  }

  if (hasText(artwork.id)) rows.push({ label: 'Reference', value: artwork.id })

  return rows
}

export interface StudioDetail {
  name: string
  /** Only built from a resolving creator record, so it can never 404. */
  href?: string
  practice?: string
  location?: string
  /** True for the illustrative placeholder records this build ships. */
  illustrative: boolean
}

/**
 * How the studio behind the work is described.
 *
 * A missing creator is stated, not faked, and produces no link. The
 * `illustrative` flag is carried through so the page can keep the honest
 * placeholder label these records ship with.
 */
export function buildStudioDetail(creator: Creator | undefined): StudioDetail {
  if (!creator || !hasText(creator.name)) {
    return { name: 'Studio not recorded', illustrative: false }
  }

  return {
    name: creator.name,
    href: NavRoutes.artist(creator.id),
    practice: hasText(creator.discipline) ? creator.discipline : undefined,
    location: hasText(creator.location) ? creator.location : undefined,
    illustrative: creator.illustrative === true,
  }
}
