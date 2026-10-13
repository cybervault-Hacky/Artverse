import type { Artwork, Collection, Creator } from '@/types'
import { ARTWORK_CATEGORIES, SAMPLE_CREATORS, categoryLabel } from './creators'
import { SAMPLE_ARTWORKS } from './artworks'
import { SAMPLE_COLLECTIONS } from './collections'

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

/** Resolves a collection's artwork ids, skipping any id that has no record. */
export function getArtworksForCollection(collection: Collection): Artwork[] {
  return collection.artworkIds
    .map((id) => getArtworkById(id))
    .filter((artwork): artwork is Artwork => Boolean(artwork))
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
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(needle)
  })
}

export { ARTWORK_CATEGORIES, SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, SAMPLE_CREATORS, categoryLabel }
