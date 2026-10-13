import type { Artwork, Collection, Creator, Discipline } from '@/types'
import { normaliseWhitespace } from '@/utils/text'
import { ARTWORK_CATEGORIES, SAMPLE_CREATORS, categoryLabel } from './creators'
import { SAMPLE_ARTWORKS } from './artworks'
import { SAMPLE_COLLECTIONS } from './collections'
import { SAMPLE_DISCIPLINES } from './disciplines'

/*
 * Read helpers over the sample data.
 *
 * They are intentionally synchronous and dependency-free: later phases can
 * replace these functions with API calls without touching page components.
 */

export function getArtworkById(id: string | undefined): Artwork | undefined {
  if (!id) return undefined
  return SAMPLE_ARTWORKS.find((artwork) => artwork.id === id)
}

export function getCreatorById(id: string | undefined): Creator | undefined {
  if (!id) return undefined
  return SAMPLE_CREATORS.find((creator) => creator.id === id)
}

export function getCollectionById(id: string | undefined): Collection | undefined {
  if (!id) return undefined
  return SAMPLE_COLLECTIONS.find((collection) => collection.id === id)
}

export function getCreatorForArtwork(artwork: Artwork): Creator | undefined {
  return getCreatorById(artwork.creatorId)
}

export function getArtworksByCreator(creatorId: string): Artwork[] {
  return SAMPLE_ARTWORKS.filter((artwork) => artwork.creatorId === creatorId)
}

/** Resolves a list of ids in the given order, skipping anything unknown. */
export function getArtworksByIds(ids: string[]): Artwork[] {
  return ids
    .map((id) => getArtworkById(id))
    .filter((artwork): artwork is Artwork => Boolean(artwork))
}

/** Resolves collections in the given order, skipping anything unknown. */
export function getCollectionsByIds(ids: string[]): Collection[] {
  return ids
    .map((id) => getCollectionById(id))
    .filter((collection): collection is Collection => Boolean(collection))
}

/** Resolves a collection's artwork ids, skipping any id that has no record. */
export function getArtworksForCollection(collection: Collection): Artwork[] {
  return getArtworksByIds(collection.artworkIds)
}

export interface DisciplineShowcase {
  discipline: Discipline
  /** Cover work for the discipline, when its sample record exists. */
  artwork?: Artwork
  /** How many sample records sit in this discipline. */
  recordCount: number
}

/**
 * The five disciplines with their cover work and sample record count.
 *
 * The count describes the illustrative sample set only — it is never presented
 * as marketplace inventory.
 */
export function getDisciplineShowcases(): DisciplineShowcase[] {
  return SAMPLE_DISCIPLINES.map((discipline) => ({
    discipline,
    artwork: getArtworkById(discipline.sampleArtworkId),
    recordCount: SAMPLE_ARTWORKS.filter((artwork) => artwork.category === discipline.id).length,
  }))
}

/**
 * The text one record is searchable by.
 *
 * Built only from fields the sample data actually carries — title, medium,
 * dimensions, year, description, the category label and id, and the creator's
 * name, practice and location. Nothing is invented to make search look wider
 * than it is, missing optional fields are skipped rather than stringified, and
 * the result is lower-cased once so matching never repeats the work.
 */
export function artworkSearchText(artwork: Artwork): string {
  const creator = getCreatorForArtwork(artwork)

  return [
    artwork.title,
    artwork.medium,
    artwork.dimensions,
    artwork.description,
    String(artwork.year),
    categoryLabel(artwork.category),
    artwork.category,
    creator?.name,
    creator?.discipline,
    creator?.location,
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')
    .toLowerCase()
}

/**
 * True when every word of `query` appears somewhere in the record's searchable
 * text. Matching word by word means “ochre canvas” finds a canvas described as
 * ochre even when the two words are not adjacent, and a query of nothing but
 * spaces matches everything. It is a plain substring test — deliberately no
 * stemming, synonyms or ranking, because the sample set does not justify
 * pretending to more intelligence than that.
 */
export function matchesArtworkQuery(artwork: Artwork, query: string): boolean {
  const tokens = normaliseWhitespace(query).toLowerCase().split(' ').filter(Boolean)
  if (tokens.length === 0) return true

  const haystack = artworkSearchText(artwork)
  return tokens.every((token) => haystack.includes(token))
}

/**
 * Case-insensitive search across the sample records only.
 *
 * Phase 1 deliberately searches the placeholder set so the search route can be
 * built and reviewed honestly — it is not a marketplace search index. An empty
 * query returns nothing here, because the search route treats “nothing typed
 * yet” as its own state; the catalogue, which shows everything until asked
 * otherwise, calls `matchesArtworkQuery` directly.
 */
export function searchSampleArtworks(query: string): Artwork[] {
  if (!query.trim()) return []

  return SAMPLE_ARTWORKS.filter((artwork) => matchesArtworkQuery(artwork, query))
}

export {
  ARTWORK_CATEGORIES,
  SAMPLE_ARTWORKS,
  SAMPLE_COLLECTIONS,
  SAMPLE_CREATORS,
  SAMPLE_DISCIPLINES,
  categoryLabel,
}
