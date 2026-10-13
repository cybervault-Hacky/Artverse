/**
 * The Explore Art catalogue engine.
 *
 * Everything the discovery catalogue does to its records — searching,
 * filtering, sorting — happens in these pure functions, so the page component
 * only has to render a result. Three rules are enforced here rather than left
 * to the page:
 *
 * 1. The shared dataset is never mutated. Sorting always works on a copy, so
 *    the curated order in `SAMPLE_ARTWORKS` survives every interaction and
 *    every page that reads it keeps the order it was written in.
 * 2. Values arriving from the URL are validated, never trusted. An unknown
 *    discipline or sort key is ignored in favour of the default, so a hand
 *    edited address can never break the catalogue or empty it by accident.
 * 3. Nothing is ranked, boosted or recommended. Matching is a plain
 *    case-insensitive substring test over fields the data really carries, and
 *    sorting offers only the orders the data can honestly support.
 */
import type { Artwork, ArtworkCategory } from '@/types'
import {
  ARTWORK_CATEGORIES,
  SAMPLE_ARTWORKS,
  categoryLabel,
  getCreatorForArtwork,
  getDisciplineShowcases,
  matchesArtworkQuery,
} from '@/data'
import { normaliseWhitespace } from '@/utils/text'

/** A discipline selection: one of the five categories, or the whole catalogue. */
export type DisciplineFilter = ArtworkCategory | 'all'

export type SortOption = 'curated' | 'title-asc' | 'title-desc' | 'artist-asc'

export interface SortChoice {
  id: SortOption
  label: string
}

/*
 * Declared with `satisfies` rather than a type annotation so the literal type
 * survives: `discipline === ALL_DISCIPLINES` then narrows the union properly.
 */
export const ALL_DISCIPLINES = 'all' satisfies DisciplineFilter
export const DEFAULT_SORT = 'curated' satisfies SortOption

/**
 * The sort orders the sample data can support honestly.
 *
 * There is deliberately no price, popularity, rating or recency option: the
 * records carry no price, no sales and no engagement, so any such order would
 * be invented. Artist sorting is offered because every record resolves to a
 * creator record.
 */
export const SORT_OPTIONS: SortChoice[] = [
  { id: 'curated', label: 'Curated order' },
  { id: 'title-asc', label: 'Title: A to Z' },
  { id: 'title-desc', label: 'Title: Z to A' },
  { id: 'artist-asc', label: 'Artist: A to Z' },
]

export interface CatalogueCriteria {
  /** Exactly what the visitor typed, preserved so the field never fights them. */
  query: string
  /** The trimmed, whitespace-collapsed query handed to the matcher. */
  needle: string
  discipline: DisciplineFilter
  sort: SortOption
}

export interface CatalogueView {
  /** The records to show, in the requested order. */
  artworks: Artwork[]
  /** How many records the catalogue holds in total. */
  total: number
  hasQuery: boolean
  hasDiscipline: boolean
  hasSort: boolean
  /**
   * True when something is actually hiding records — a search or a discipline.
   * Reordering is not narrowing, so the result count keeps saying “showing all”
   * after nothing but a sort change.
   */
  isNarrowed: boolean
  /** True when anything at all is set apart from the default view. */
  isAdjusted: boolean
}

const DISCIPLINE_IDS: ArtworkCategory[] = ARTWORK_CATEGORIES.map((option) => option.id)

/**
 * A fixed English collator: ordering stays identical between the server render
 * and the browser, so nothing reorders after hydration and then jumps.
 */
const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

export function isDisciplineFilter(value: string | null | undefined): value is DisciplineFilter {
  if (value === ALL_DISCIPLINES) return true
  return DISCIPLINE_IDS.some((id) => id === value)
}

export function isSortOption(value: string | null | undefined): value is SortOption {
  return SORT_OPTIONS.some((option) => option.id === value)
}

/** Readable label for a selection, including the “All Art” reset. */
export function disciplineLabel(discipline: DisciplineFilter): string {
  return discipline === ALL_DISCIPLINES ? 'All Art' : categoryLabel(discipline)
}

/**
 * Reads criteria out of a URL query string.
 *
 * Anything unrecognised — a mistyped discipline, an old sort key — falls back
 * to its default instead of throwing or producing an empty catalogue. The
 * address is left as the visitor wrote it; only the derived criteria are
 * corrected.
 */
export function parseCatalogueCriteria(params: URLSearchParams): CatalogueCriteria {
  const query = params.get('q') ?? ''

  return {
    query,
    needle: normaliseWhitespace(query),
    discipline: isDisciplineFilter(params.get('discipline'))
      ? (params.get('discipline') as DisciplineFilter)
      : ALL_DISCIPLINES,
    sort: isSortOption(params.get('sort')) ? (params.get('sort') as SortOption) : DEFAULT_SORT,
  }
}

/**
 * Writes criteria back into a query string, omitting anything at its default so
 * an untouched catalogue keeps the clean `/discover` address.
 *
 * The query is written exactly as typed — trimming it here would desynchronise
 * the field from the URL mid-word — but a value made only of spaces counts as
 * empty and is left out.
 */
export function writeCatalogueCriteria(criteria: {
  query: string
  discipline: DisciplineFilter
  sort: SortOption
}): URLSearchParams {
  const params = new URLSearchParams()

  if (normaliseWhitespace(criteria.query) !== '') params.set('q', criteria.query)
  if (criteria.discipline !== ALL_DISCIPLINES) params.set('discipline', criteria.discipline)
  if (criteria.sort !== DEFAULT_SORT) params.set('sort', criteria.sort)

  return params
}

function compareTitles(a: Artwork, b: Artwork): number {
  return collator.compare(a.title, b.title) || collator.compare(a.id, b.id)
}

function compareArtists(a: Artwork, b: Artwork): number {
  const aName = getCreatorForArtwork(a)?.name ?? ''
  const bName = getCreatorForArtwork(b)?.name ?? ''

  // A record without a resolvable creator sorts last, then by title, so the
  // order stays total and predictable whatever the data holds.
  return collator.compare(aName, bName) || compareTitles(a, b)
}

/**
 * Returns a sorted **copy** of the given records. The array passed in is never
 * reordered — `SAMPLE_ARTWORKS` is shared by every page in the app.
 */
export function sortArtworks(artworks: Artwork[], sort: SortOption): Artwork[] {
  const copy = [...artworks]

  switch (sort) {
    case 'title-asc':
      return copy.sort(compareTitles)
    case 'title-desc':
      return copy.sort((a, b) => compareTitles(b, a))
    case 'artist-asc':
      return copy.sort(compareArtists)
    case 'curated':
    default:
      return copy
  }
}

/** Applies a query and a discipline filter, then the chosen order. */
export function buildCatalogueView(criteria: CatalogueCriteria): CatalogueView {
  const hasQuery = criteria.needle !== ''
  const hasDiscipline = criteria.discipline !== ALL_DISCIPLINES
  const hasSort = criteria.sort !== DEFAULT_SORT

  const matched = SAMPLE_ARTWORKS.filter((artwork) => {
    if (hasDiscipline && artwork.category !== criteria.discipline) return false
    if (hasQuery && !matchesArtworkQuery(artwork, criteria.needle)) return false
    return true
  })

  return {
    artworks: sortArtworks(matched, criteria.sort),
    total: SAMPLE_ARTWORKS.length,
    hasQuery,
    hasDiscipline,
    hasSort,
    isNarrowed: hasQuery || hasDiscipline,
    isAdjusted: hasQuery || hasDiscipline || hasSort,
  }
}

export interface DisciplineFacet {
  id: DisciplineFilter
  label: string
  /** How many records the current search would find in this discipline. */
  count: number
  /** Cover work, used as the tile image. Absent for “All Art”. */
  artwork?: Artwork
  description?: string
}

/**
 * The discipline tiles, with counts scoped to the active search but not to the
 * active discipline — the standard facet behaviour, and the reason the counts
 * are useful: they show where a search term actually lands, and they drop to
 * zero honestly when nothing matches anywhere.
 */
export function buildDisciplineFacets(needle: string): DisciplineFacet[] {
  const matching = SAMPLE_ARTWORKS.filter((artwork) => matchesArtworkQuery(artwork, needle))

  return [
    { id: ALL_DISCIPLINES, label: 'All Art', count: matching.length },
    ...getDisciplineShowcases().map(({ discipline, artwork }) => ({
      id: discipline.id as DisciplineFilter,
      label: discipline.label,
      count: matching.filter((record) => record.category === discipline.id).length,
      artwork,
      description: discipline.description,
    })),
  ]
}
