import type { Artwork, Collection, Creator, Discipline } from '@/types'
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
 * Case-insensitive search across the sample records only.
 *
 * Phase 1 deliberately searches the placeholder set so the search route can be
 * built and reviewed honestly — it is not a marketplace search index.
 */
export function searchSampleArtworks(query: string): Artwork[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  return SAMPLE_ARTWORKS.filter((artwork) => {
    const creator = getCreatorForArtwork(artwork)
    const haystack = [
      artwork.title,
      artwork.medium,
      artwork.dimensions,
      artwork.description,
      categoryLabel(artwork.category),
      creator?.name ?? '',
      creator?.discipline ?? '',
      creator?.location ?? '',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(needle)
  })
}

export {
  ARTWORK_CATEGORIES,
  SAMPLE_ARTWORKS,
  SAMPLE_COLLECTIONS,
  SAMPLE_CREATORS,
  SAMPLE_DISCIPLINES,
  categoryLabel,
}
