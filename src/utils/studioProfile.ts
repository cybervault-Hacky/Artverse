/**
 * The studio directory and profile model.
 *
 * Everything the two artist pages need to *decide* lives here as pure
 * functions, so the page components only render: which creators are listed,
 * what each entry is called, what it works in, where it is based, which of its
 * records exist, and which image can stand in for it. Four rules are enforced
 * here rather than in markup:
 *
 * 1. Nothing is invented. Names, practices, locations and practice notes come
 *    from creator records; the works come from the artwork records that name
 *    the creator. A creator with no records gets an empty list — never a
 *    selection of somebody else's work.
 * 2. No link is emitted for a record that cannot resolve. An entry without a
 *    usable id renders as text, so a directory link can never 404.
 * 3. A missing field is stated, not filled. A creator without a name is shown
 *    as “Studio name not recorded”; one without a practice note is reported as
 *    having none, rather than being given plausible-sounding copy.
 * 4. Where no portrait exists, the stand-in is the creator's *own* work — the
 *    one image relationship the data actually holds. It is always labelled as a
 *    work, never presented as a photograph of a person.
 */
import type { Artwork, Creator } from '@/types'
import { NavRoutes } from '@/app/routes'
import { SAMPLE_ARTWORKS, SAMPLE_CREATORS, getArtworksByCreator } from '@/data'
import { hasText } from '@/utils/text'

/** Shown where a creator record carries no usable name. */
export const UNNAMED_STUDIO = 'Studio name not recorded'

/** Shown where a creator record carries no practice note. */
export const NO_PRACTICE_NOTE =
  'No practice note has been written for this record yet. What the studio works in is listed above.'

/**
 * Whether a field carries something worth showing — the shared predicate, under
 * the name this module has always exported it as.
 */
export const isNonEmpty = hasText

/**
 * The image that stands in for a studio: the first of its own records that has
 * a requestable image, in catalogue order. Undefined when the creator has no
 * work — which is honest, and renders as no image rather than somebody else's.
 */
export function getStudioLeadWork(creator: Creator): Artwork | undefined {
  if (!isNonEmpty(creator.id)) return undefined
  return getArtworksByCreator(creator.id).find((artwork) => isNonEmpty(artwork.image?.src))
}

export interface StudioEntry {
  creator: Creator
  /** The creator's name, or the neutral fallback when none is recorded. */
  name: string
  /** Only built from a usable id, so a broken link is impossible. */
  href?: string
  practice?: string
  location?: string
  practiceNote?: string
  works: Artwork[]
  workCount: number
  /** Convenience flag for the profile: whether there is anything to list. */
  hasWorks: boolean
  leadWork?: Artwork
  /** True for the illustrative placeholder records this build ships. */
  illustrative: boolean
}

/**
 * The full entry for one creator: identity, practice, records and lead image,
 * with every optional field handled safely.
 */
export function buildStudioEntry(creator: Creator): StudioEntry {
  const works = isNonEmpty(creator.id) ? getArtworksByCreator(creator.id) : []

  return {
    creator,
    name: isNonEmpty(creator.name) ? creator.name : UNNAMED_STUDIO,
    href: isNonEmpty(creator.id) ? NavRoutes.artist(creator.id) : undefined,
    practice: isNonEmpty(creator.discipline) ? creator.discipline : undefined,
    location: isNonEmpty(creator.location) ? creator.location : undefined,
    practiceNote: isNonEmpty(creator.bio) ? creator.bio : undefined,
    works,
    workCount: works.length,
    hasWorks: works.length > 0,
    leadWork: getStudioLeadWork(creator),
    illustrative: creator.illustrative === true,
  }
}

/**
 * The directory, in the order the data holds. Every valid creator record is
 * listed — the directory is the catalogue of studios, not a curated subset.
 */
export function buildStudioDirectory(creators: Creator[] = SAMPLE_CREATORS): StudioEntry[] {
  return creators.map(buildStudioEntry)
}

/** How many records across the whole sample set are attributed to this creator. */
export function countCatalogueRecords(): number {
  return SAMPLE_ARTWORKS.length
}

/**
 * The practice line as one readable string, skipping whatever is missing —
 * `Painting — placeholder record · Lisbon, Portugal`.
 */
export function studioPracticeLine(entry: StudioEntry): string | undefined {
  const parts = [entry.practice, entry.location].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : undefined
}

/**
 * The profile's own facts, as labelled values. Only real fields appear, so no
 * row is ever a placeholder standing in for data that does not exist.
 */
export interface StudioFact {
  label: string
  value: string
}

export function buildStudioFacts(entry: StudioEntry): StudioFact[] {
  const facts: StudioFact[] = []

  if (entry.practice) facts.push({ label: 'Practice', value: entry.practice })
  if (entry.location) facts.push({ label: 'Based in', value: entry.location })
  facts.push({
    label: 'Records in this build',
    value: entry.workCount === 1 ? '1 sample work' : `${entry.workCount} sample works`,
  })

  if (isNonEmpty(entry.creator.id)) facts.push({ label: 'Reference', value: entry.creator.id })

  return facts
}

/** The other studios in the directory, used for the profile's onward links. */
export function getOtherStudios(creator: Creator, limit = 3): StudioEntry[] {
  return SAMPLE_CREATORS.filter((candidate) => candidate.id !== creator.id)
    .slice(0, Math.max(0, limit))
    .map(buildStudioEntry)
}
