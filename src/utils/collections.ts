/**
 * The collection directory model.
 *
 * A collection holds works by id, and `getArtworksForCollection` resolves those
 * ids against the artwork records. That resolved list is the only membership
 * this module reads — there is no second relationship array anywhere, so a
 * collection can never disagree with itself.
 *
 * What this module adds is the three decisions every collection surface needs,
 * in one place rather than repeated per page:
 *
 * 1. **What it holds.** `works` is the resolved list, so the count shown on a
 *    card, in a hero and in the grid are all the same number, and it is the
 *    number of works actually rendered.
 * 2. **What represents it.** `leadWork` is the first id in the collection's own
 *    order that resolves *and* carries a requestable image. Deterministic, and
 *    it can never ask the browser for an empty `src`.
 * 3. **Where it goes.** `href` is only built from a usable id, so a card can
 *    never point at a route that would 404.
 */
import type { Artwork, Collection } from '@/types'
import { NavRoutes } from '@/app/routes'
import { SAMPLE_COLLECTIONS, getArtworksForCollection } from '@/data'
import { hasText } from '@/utils/text'

/**
 * The work that stands for a collection: the first of its own records, in the
 * collection's order, that resolves and has an image the browser can request.
 *
 * Undefined when none of them does — which renders as a neutral panel rather
 * than a broken image or an empty `src`.
 */
export function leadArtworkFor(collection: Collection): Artwork | undefined {
  return getArtworksForCollection(collection).find((artwork) => hasText(artwork.image?.src))
}

export interface CollectionEntry {
  collection: Collection
  /** The collection's works, resolved and in its own order. */
  works: Artwork[]
  /** How many works it really holds — the number every count must use. */
  workCount: number
  /** The work chosen to represent it, when one has a usable image. */
  leadWork?: Artwork
  /** True when the collection holds at least one resolvable work. */
  hasWorks: boolean
  /** Only built from a usable id, so a broken link is impossible. */
  href?: string
  /** The one-line summary, when the record carries one. */
  summary?: string
  /** The longer editorial description, when the record carries one. */
  description?: string
}

/** Everything a collection surface needs about one collection. */
export function buildCollectionEntry(collection: Collection): CollectionEntry {
  const works = getArtworksForCollection(collection)

  return {
    collection,
    works,
    workCount: works.length,
    leadWork: leadArtworkFor(collection),
    hasWorks: works.length > 0,
    href: hasText(collection.id) ? NavRoutes.collection(collection.id) : undefined,
    summary: hasText(collection.summary) ? collection.summary : undefined,
    description: hasText(collection.description) ? collection.description : undefined,
  }
}

/** The whole directory, in the order the data holds it. */
export function buildCollectionDirectory(
  collections: Collection[] = SAMPLE_COLLECTIONS,
): CollectionEntry[] {
  return collections.map(buildCollectionEntry)
}
