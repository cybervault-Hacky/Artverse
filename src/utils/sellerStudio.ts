/**
 * The seller workspace model.
 *
 * The workspace is a preview, so the first honest question is *whose* studio it
 * shows. There is no sign-in, so it cannot be the visitor's: it is shown with
 * one of the five illustrative studios this build ships, named on every screen
 * as a sample record.
 *
 * What this module decides, once, for every workspace surface:
 *
 * - **Which studio.** `PREVIEW_STUDIO_ID` — the record with the most works in
 *   the sample data, so the listings section has something real to show.
 * - **Which records.** That studio's own works, never another studio's. The
 *   relationship comes from the artwork records, as everywhere else.
 * - **What is prepared.** `buildStudioRecordCoverage` counts how many of those
 *   records carry each field. These are counts of real fields in the data, not
 *   sales, revenue or engagement figures — the workspace shows no metrics of
 *   that kind because ArtVerse has none.
 * - **Where the sections are.** One list, so the sidebar, the overview and the
 *   verification script all read the same destinations.
 */
import type { Artwork } from '@/types'
import { NavRoutes } from '@/app/routes'
import { SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, getCreatorById } from '@/data'
import type { ListingDraftOrigin } from '@/utils/listingDraft'
import { buildStudioEntry, type StudioEntry } from '@/utils/studioProfile'
import { hasText } from '@/utils/text'

/**
 * The studio the workspace is previewed with: Illustrative Studio A, which
 * holds two of the six sample records. Both appear in collections and carry a
 * full set of fields, so the listings and profile sections have real material.
 */
export const PREVIEW_STUDIO_ID = 'sample-studio-a'

/** Stated wherever the workspace shows the preview studio's identity. */
export const PREVIEW_STUDIO_NOTE =
  'This build has no sign-in, so the workspace is shown with one of the five illustrative studios in the sample data. A seller account would show your own record here.'

/** The one-line reminder that appears at the top of every workspace screen. */
export const WORKSPACE_PREVIEW_NOTICE =
  'Frontend preview. There is no account, no sign-in and no storage behind this workspace: nothing you type is uploaded, saved or published, and a draft lives only in this browser tab until you leave or reload the page.'

export interface StudioSection {
  id: string
  /** Sidebar label. */
  label: string
  /** What the section contains, in one line. */
  description: string
  to: string
}

/**
 * The workspace's sections, in reading order. The listings section is listed
 * once — the editor is reached from a listing or from the section's own action,
 * rather than being a fourth thing to keep in the navigation.
 */
export const STUDIO_SECTIONS: StudioSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'What the workspace holds today, and what is still missing.',
    to: NavRoutes.studio,
  },
  {
    id: 'listings',
    label: 'Artwork listings',
    description: 'The records attributed to this studio, and a listing draft you can prepare.',
    to: NavRoutes.studioListings,
  },
  {
    id: 'profile',
    label: 'Studio profile',
    description: 'How this studio appears in public, rendered from the same model the directory uses.',
    to: NavRoutes.studioProfile,
  },
  {
    id: 'certificate',
    label: 'Seller certificate',
    description: 'The verification certificate design, shown with placeholders and marked not issued.',
    to: NavRoutes.studioCertificate,
  },
]

/**
 * The preview studio, read through the data layer and built with the same model
 * the public directory uses — so the workspace preview cannot describe a studio
 * differently from the way the site does.
 */
export function getPreviewStudioEntry(): StudioEntry | undefined {
  const creator = getCreatorById(PREVIEW_STUDIO_ID)
  return creator ? buildStudioEntry(creator) : undefined
}

export interface RecordFieldCoverage {
  label: string
  /** How many of the studio's records carry this field. */
  recorded: number
  total: number
}

/**
 * How complete the studio's records are, field by field.
 *
 * A count of what the sample data actually holds. It is not a score, a rating
 * or a measure of quality, and the workspace presents it as preparation state
 * for the fields a public listing would need.
 */
export function buildStudioRecordCoverage(works: Artwork[]): RecordFieldCoverage[] {
  const total = works.length
  const count = (predicate: (artwork: Artwork) => boolean) => works.filter(predicate).length

  return [
    {
      label: 'Description',
      recorded: count((artwork) => hasText(artwork.description)),
      total,
    },
    { label: 'Medium', recorded: count((artwork) => hasText(artwork.medium)), total },
    { label: 'Dimensions', recorded: count((artwork) => hasText(artwork.dimensions)), total },
    {
      label: 'Year',
      recorded: count((artwork) => typeof artwork.year === 'number' && Number.isFinite(artwork.year)),
      total,
    },
    { label: 'Image', recorded: count((artwork) => hasText(artwork.image?.src)), total },
    {
      label: 'In a collection',
      recorded: count((artwork) =>
        SAMPLE_COLLECTIONS.some((collection) => collection.artworkIds.includes(artwork.id)),
      ),
      total,
    },
  ]
}

export interface StudioOverview {
  entry?: StudioEntry
  works: Artwork[]
  workCount: number
  coverage: RecordFieldCoverage[]
  /** How many collections the studio's records appear in. */
  collectionCount: number
  /** How many records the whole sample catalogue holds, for honest context. */
  catalogueCount: number
  /** How many records in the catalogue belong to another studio. */
  otherStudioCount: number
}

/** Everything the overview and the listings section read, derived from the data. */
export function buildStudioOverview(): StudioOverview {
  const entry = getPreviewStudioEntry()
  const works = entry?.works ?? []
  const collections = SAMPLE_COLLECTIONS.filter((collection) =>
    collection.artworkIds.some((id) => works.some((artwork) => artwork.id === id)),
  )

  return {
    entry,
    works,
    workCount: works.length,
    coverage: buildStudioRecordCoverage(works),
    collectionCount: collections.length,
    catalogueCount: SAMPLE_ARTWORKS.length,
    otherStudioCount: SAMPLE_ARTWORKS.length - works.length,
  }
}

export interface WorkflowStep {
  step: string
  title: string
  text: string
}

/**
 * The artist workflow, as stated on the entry page. These are the four things
 * the workspace is being prepared to do; none of them is claimed as working.
 */
export const ARTIST_WORKFLOW: WorkflowStep[] = [
  {
    step: 'Step one',
    title: 'Present your work',
    text: 'A studio page that shows your practice and your pieces at their own proportions, in the same editorial layouts the rest of ArtVerse uses.',
  },
  {
    step: 'Step two',
    title: 'Organise artwork listings',
    text: 'Prepare each work with its title, discipline, medium, dimensions, year and image — the fields the catalogue already reads.',
  },
  {
    step: 'Step three',
    title: 'Maintain a professional studio profile',
    text: 'Keep the practice, the location and the note about how you work in one place, rather than repeating it on every piece.',
  },
  {
    step: 'Step four',
    title: 'Prepare to manage your future ArtVerse account',
    text: 'See where availability, enquiries and payouts will live once there is an account system to manage them.',
  },
]

/**
 * Which draft the workspace should be holding, read from the address.
 *
 * The layout seeds its reducer from this, so the first render of a record-backed
 * editor already carries that record's fields — no effect, no flash of an empty
 * form, and the same result on the server as in the browser.
 *
 * A malformed id is returned as written rather than thrown: the editor reports
 * that no record matches it, which is a better answer than a crash.
 */
export function originFromPath(pathname: string): ListingDraftOrigin {
  const match = /^\/sell\/studio\/listings\/([^/]+)\/?$/.exec(pathname)
  if (!match) return { kind: 'new' }

  let segment = match[1]
  try {
    segment = decodeURIComponent(segment)
  } catch {
    // A malformed escape sequence stays as typed; it will not resolve to a
    // record, and the editor says so.
  }

  if (segment === 'new' || segment === '') return { kind: 'new' }
  return { kind: 'artwork', artworkId: segment }
}

/** Plain statements of what the workspace deliberately does not do yet. */
export const WORKSPACE_NOT_INCLUDED: string[] = [
  'No sign-in, account creation or session of any kind.',
  'No seller application, review or verification.',
  'No image upload: a draft can only use the sample images shipped with this build.',
  'No storage: closing the tab discards the draft.',
  'No publication: nothing prepared here appears anywhere else on ArtVerse.',
  'No availability, orders, fees or payouts — and no checkout of any kind.',
  'No verification and no issued certificates: the certificate section draws the document and says on its face that nothing has been issued.',
]
