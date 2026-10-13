/**
 * Provenance and attribution rules.
 *
 * “Provenance” is a word that invites invention — ownership chains, auction
 * records, signatures, certificates — and this build can support none of it, so
 * the module's job is to describe a record *only* as far as the catalogue
 * genuinely goes:
 *
 * 1. **Attribution is not authentication.** The catalogue records which studio a
 *    work is attributed to. That is all it records, and the row says so; nothing
 *    here claims the work has been examined or verified by anyone.
 * 2. **A statement appears only when it exists.** `ArtworkProvenance` is absent
 *    from every sample record, so every artwork page states that no provenance
 *    statement has been provided. A record that does carry one shows it verbatim
 *    with its source, and nothing is added around it.
 * 3. **Absences are stated, not hidden.** The verification row names what is not
 *    held — no authenticity check, no signature record, no edition record, no
 *    certificate. Those are honest negatives a buyer would otherwise have to
 *    guess at, and each is a statement about this build rather than about the
 *    work.
 */
import type { Artwork, Creator } from '@/types'
import { NavRoutes } from '@/app/routes'
import { getCollectionsForArtwork, type DetailRow } from '@/utils/artworkDetail'
import { hasText } from '@/utils/text'

/** Shown when the record names no creator the catalogue can resolve. */
export const NO_ATTRIBUTION = 'No creator is recorded for this record.'

/** The distinction the whole module exists to keep clear. */
export const AUTHENTICITY_NOT_VERIFIED =
  'Not examined or verified. The attribution above is what this catalogue records, not an authentication.'

/** What the build holds no document of at all, for any record. */
export const NO_DOCUMENTS_NOTE =
  'No signature record, edition record or certificate of authenticity is held for this record, and no verification workflow exists yet.'

/** Shown when the record carries no provenance statement at all. */
export const NO_PROVENANCE_STATEMENT =
  'No provenance statement or ownership history has been provided for this sample record. Nothing about where it has been is claimed here.'

export interface ProvenanceDetail {
  /** Attribution, authenticity, holding and documents — never more. */
  rows: DetailRow[]
  /** The statement the record holds, verbatim, or undefined. */
  statement?: string
  /** Where that statement came from, when the record says. */
  source?: string
  /** True when the record carries no provenance statement. */
  statementMissing: boolean
}

/**
 * Everything the provenance section shows, derived from the record.
 *
 * Only the first row can vary: attribution follows the creator record, and the
 * other three state what this build holds (and does not hold) for every work.
 * The collection links come from the same relationship the rest of the site
 * reads, so a holding here cannot disagree with the collections pages.
 */
export function buildProvenance(artwork: Artwork, creator?: Creator): ProvenanceDetail {
  const rows: DetailRow[] = []

  if (creator && hasText(creator.name) && hasText(creator.id)) {
    rows.push({
      label: 'Attribution',
      links: [{ label: creator.name, to: NavRoutes.artist(creator.id) }],
    })
  } else {
    rows.push({ label: 'Attribution', value: NO_ATTRIBUTION })
  }

  rows.push({ label: 'Authenticity', value: AUTHENTICITY_NOT_VERIFIED })
  rows.push({ label: 'Documents', value: NO_DOCUMENTS_NOTE })

  const collections = getCollectionsForArtwork(artwork)
  rows.push(
    collections.length > 0
      ? {
          label: 'Holding',
          links: collections.map((collection) => ({
            label: collection.title,
            to: NavRoutes.collection(collection.id),
          })),
        }
      : { label: 'Holding', value: 'Not part of any collection in this build.' },
  )

  const statementText = artwork.provenance?.statement
  const sourceText = artwork.provenance?.source
  const statement = hasText(statementText) ? statementText.trim() : undefined
  const source = hasText(sourceText) ? sourceText.trim() : undefined

  return {
    rows,
    statement,
    source,
    statementMissing: statement === undefined,
  }
}
