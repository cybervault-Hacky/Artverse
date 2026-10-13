/**
 * The listing draft model.
 *
 * A seller listing is not a record in this build — there is no database, no
 * upload and no publication — so everything a listing form does is modelled
 * here as pure, deterministic functions over a plain draft object:
 *
 * 1. **Where a draft starts.** `emptyListingDraft()` for a new listing, or
 *    `draftFromArtwork()` to prepare one from an existing sample record. The
 *    record itself is never touched.
 * 2. **What a draft must carry.** `validateListingDraft()` returns a message
 *    per field that needs attention, and nothing for the fields that are fine.
 *    Optional fields stay optional: a draft without dimensions is valid.
 * 3. **How a draft changes.** `listingDraftReducer()` is the whole edit model —
 *    typing, resetting and checking — so the React layer only dispatches and
 *    the behaviour can be verified without a browser.
 *
 * Nothing here writes anywhere. A draft is held in the browser tab for the
 * length of the visit, and the workspace says so on every screen.
 *
 * Phase 9 added the price pair. It is optional, it is never published, and the
 * amount and its currency are validated together — see `src/utils/pricing.ts`,
 * which owns every rule about how an amount is written and what it means.
 */
import type { Artwork, ArtworkCategory, Collection } from '@/types'
import { ARTWORK_CATEGORIES, SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, categoryLabel } from '@/data'
import { getPrimaryCollection } from '@/utils/artworkDetail'
import {
  CURRENCY_OPTIONS,
  normaliseCurrencyCode,
  parsePriceAmount,
  priceAmountError,
} from '@/utils/pricing'
import { hasText, normaliseWhitespace } from '@/utils/text'

/** The fields a listing draft carries. `discipline` maps to `Artwork.category`. */
export type ListingFieldName =
  | 'title'
  | 'discipline'
  | 'medium'
  | 'dimensions'
  | 'year'
  | 'priceAmount'
  | 'priceCurrency'
  | 'description'
  | 'collectionId'
  | 'imageId'

/**
 * A listing draft, as the form holds it.
 *
 * Every value is a string, including the year, so an invalid entry can be shown
 * back to the writer exactly as typed instead of being silently discarded.
 * An empty string means “not filled in yet”.
 */
export interface ListingDraft {
  title: string
  discipline: ArtworkCategory | ''
  medium: string
  dimensions: string
  year: string
  /**
   * The amount as typed, digits only. Empty means “no price”, which is a valid
   * state: a listing without one is not an error, and nothing fills it in.
   */
  priceAmount: string
  /** An ISO 4217 code from `CURRENCY_OPTIONS`, or empty. Never inferred. */
  priceCurrency: string
  description: string
  /** A collection id, or empty for “not in a collection”. */
  collectionId: string
  /** The id of the sample record whose image the listing would use, or empty. */
  imageId: string
}

export const LISTING_LIMITS = {
  titleMin: 3,
  titleMax: 90,
  mediumMax: 60,
  dimensionsMax: 40,
  descriptionMin: 20,
  descriptionMax: 600,
} as const

export const LISTING_YEAR_MIN = 1800

/** The currency codes the price field offers, in the order it offers them. */
export const LISTING_CURRENCY_OPTIONS = CURRENCY_OPTIONS

/** A work cannot have been made after this year. */
export const LISTING_YEAR_MAX = new Date().getFullYear()

export interface ListingFieldDefinition {
  name: ListingFieldName
  label: string
  kind: 'text' | 'textarea' | 'select' | 'image'
  required: boolean
  hint?: string
  placeholder?: string
}

/**
 * The form, described once.
 *
 * The editor renders from this list and the verification script reads it, so
 * the labels a writer sees and the fields the tests exercise cannot drift apart.
 */
export const LISTING_FIELDS: ListingFieldDefinition[] = [
  {
    name: 'title',
    label: 'Title',
    kind: 'text',
    required: true,
    hint: `How the work will be named. ${LISTING_LIMITS.titleMin}–${LISTING_LIMITS.titleMax} characters.`,
  },
  {
    name: 'discipline',
    label: 'Discipline',
    kind: 'select',
    required: true,
  },
  {
    name: 'medium',
    label: 'Medium',
    kind: 'text',
    required: true,
    hint: 'The material or technique, e.g. Oil on canvas.',
  },
  {
    name: 'dimensions',
    label: 'Dimensions',
    kind: 'text',
    required: false,
    hint: 'Optional. Include units, e.g. 60 × 90 cm.',
  },
  {
    name: 'year',
    label: 'Year',
    kind: 'text',
    required: false,
    hint: `Optional. Four digits, between ${LISTING_YEAR_MIN} and ${LISTING_YEAR_MAX}.`,
  },
  {
    name: 'priceAmount',
    label: 'Price',
    kind: 'text',
    required: false,
    hint: 'Optional. Digits only, e.g. 2400 or 2400.50. No currency symbol, and no thousands separators.',
  },
  {
    name: 'priceCurrency',
    label: 'Currency',
    kind: 'select',
    required: false,
    hint: 'Optional, and required whenever an amount is given. Amounts are shown with this code and never converted.',
  },
  {
    name: 'description',
    label: 'Description',
    kind: 'textarea',
    required: true,
    hint: `What the work is, in your own words. ${LISTING_LIMITS.descriptionMin}–${LISTING_LIMITS.descriptionMax} characters.`,
  },
  {
    name: 'collectionId',
    label: 'Collection',
    kind: 'select',
    required: false,
    hint: 'Optional. Collections in this build are sample groupings.',
  },
  {
    name: 'imageId',
    label: 'Image',
    kind: 'image',
    required: true,
    hint: 'This build holds six sample images and no upload, so a draft can only use one of them.',
  },
]

/** The editable fields, in form order, without the image chooser. */
export const LISTING_TEXT_FIELDS: ListingFieldName[] = LISTING_FIELDS.filter(
  (field) => field.kind !== 'image',
).map((field) => field.name)

export type ListingErrors = Partial<Record<ListingFieldName, string>>

/** A draft with nothing in it. */
export function emptyListingDraft(): ListingDraft {
  return {
    title: '',
    discipline: '',
    medium: '',
    dimensions: '',
    year: '',
    priceAmount: '',
    priceCurrency: '',
    description: '',
    collectionId: '',
    imageId: '',
  }
}

/** A text value from a record, or an empty string — records may carry blanks. */
function textOrEmpty(value: unknown): string {
  return hasText(value) ? normaliseWhitespace(String(value)) : ''
}

/**
 * Prepares a draft from an existing record.
 *
 * Nothing is invented: a field the record leaves blank stays blank in the
 * draft, which is exactly what an editor would have to fill in.
 */
export function draftFromArtwork(artwork: Artwork): ListingDraft {
  const year = typeof artwork.year === 'number' && Number.isFinite(artwork.year)
    ? String(artwork.year)
    : ''
  const primaryCollection = getPrimaryCollection(artwork)

  // A price is carried across only when the record really holds one with its
  // currency. No sample record does, so a draft prepared from one leaves both
  // fields empty rather than guessing at either.
  const recordAmount = parsePriceAmount(artwork.price?.amount)
  const recordCurrency = recordAmount === undefined ? undefined : normaliseCurrencyCode(artwork.price?.currency)

  return {
    title: textOrEmpty(artwork.title),
    discipline: artwork.category ?? '',
    medium: textOrEmpty(artwork.medium),
    dimensions: textOrEmpty(artwork.dimensions),
    year,
    priceAmount: recordAmount === undefined ? '' : String(recordAmount),
    priceCurrency: recordCurrency ?? '',
    description: textOrEmpty(artwork.description),
    collectionId: primaryCollection?.id ?? '',
    imageId: hasText(artwork.image?.src) ? artwork.id : '',
  }
}

export interface ListingImageOption {
  /** The sample record the image comes from. */
  id: string
  label: string
  src: string
  alt: string
  width: number
  height: number
}

/**
 * The images a draft can use: the six local sample images that ship with this
 * build. Records without a usable image path are left out, so a chooser option
 * can never point at an empty `src`.
 */
export function listingImageOptions(artworks: Artwork[] = SAMPLE_ARTWORKS): ListingImageOption[] {
  return artworks
    .filter((artwork) => hasText(artwork.image?.src) && hasText(artwork.id))
    .map((artwork) => ({
      id: artwork.id,
      label: artwork.title,
      src: artwork.image.src,
      alt: artwork.image.alt,
      width: artwork.image.width,
      height: artwork.image.height,
    }))
}

/** The chosen image, or undefined when the draft has none (or an unknown) one. */
export function listingDraftImage(draft: ListingDraft): ListingImageOption | undefined {
  if (!hasText(draft.imageId)) return undefined
  return listingImageOptions().find((option) => option.id === draft.imageId)
}

/** The collections a draft can be filed under. */
export function listingCollectionOptions(collections: Collection[] = SAMPLE_COLLECTIONS): Collection[] {
  return collections.filter((collection) => hasText(collection.id) && hasText(collection.title))
}

/**
 * Every reason a draft is not ready, keyed by field.
 *
 * A field that passes is absent from the result rather than mapped to an empty
 * message, so `Object.keys(errors).length` is a truthful count of what is left.
 */
export function validateListingDraft(draft: ListingDraft): ListingErrors {
  const errors: ListingErrors = {}

  const title = normaliseWhitespace(draft.title ?? '')
  if (!hasText(title)) errors.title = 'Give the listing a title.'
  else if (title.length < LISTING_LIMITS.titleMin)
    errors.title = `Titles need at least ${LISTING_LIMITS.titleMin} characters.`
  else if (title.length > LISTING_LIMITS.titleMax)
    errors.title = `Keep the title to ${LISTING_LIMITS.titleMax} characters or fewer.`

  const disciplines = ARTWORK_CATEGORIES.map((option) => option.id)
  if (!hasText(draft.discipline)) errors.discipline = 'Choose the discipline this work belongs to.'
  else if (!disciplines.includes(draft.discipline as ArtworkCategory))
    errors.discipline = 'Choose a discipline from the list.'

  const medium = normaliseWhitespace(draft.medium ?? '')
  if (!hasText(medium)) errors.medium = 'Name the material or technique.'
  else if (medium.length > LISTING_LIMITS.mediumMax)
    errors.medium = `Keep the medium to ${LISTING_LIMITS.mediumMax} characters or fewer.`

  // Optional: only checked when something has been typed.
  const dimensions = normaliseWhitespace(draft.dimensions ?? '')
  if (hasText(dimensions)) {
    if (dimensions.length > LISTING_LIMITS.dimensionsMax)
      errors.dimensions = `Keep dimensions to ${LISTING_LIMITS.dimensionsMax} characters or fewer.`
    else if (!/\d/.test(dimensions))
      errors.dimensions = 'Include at least one measurement, e.g. 60 × 90 cm.'
  }

  // Optional, and the one numeric field: an invalid entry is reported, never
  // parsed into something misleading.
  const year = normaliseWhitespace(draft.year ?? '')
  if (hasText(year)) {
    if (!/^\d{4}$/.test(year)) errors.year = 'Enter a four-digit year, e.g. 2024.'
    else {
      const parsed = Number(year)
      if (parsed < LISTING_YEAR_MIN || parsed > LISTING_YEAR_MAX)
        errors.year = `Enter a year between ${LISTING_YEAR_MIN} and ${LISTING_YEAR_MAX}.`
    }
  }

  /*
   * The price pair. Both halves are checked together, because either one alone
   * is not a price: an amount with no currency says nothing, and a currency with
   * no amount says nothing either. Leaving both blank stays valid.
   */
  const amountTyped = hasText(draft.priceAmount)
  const currencyTyped = hasText(draft.priceCurrency)
  const currency = normaliseCurrencyCode(draft.priceCurrency)

  if (amountTyped) {
    const problem = priceAmountError(draft.priceAmount)
    if (problem) errors.priceAmount = problem
    if (!currency) errors.priceCurrency = 'Choose the currency this amount is in.'
  } else if (currencyTyped) {
    errors.priceAmount = 'Enter the amount, or clear the currency.'
  }

  if (currencyTyped && !currency) {
    errors.priceCurrency = 'Choose a currency from the list.'
  }

  const description = normaliseWhitespace(draft.description ?? '')
  if (!hasText(description)) errors.description = 'Write a short description of the work.'
  else if (description.length < LISTING_LIMITS.descriptionMin)
    errors.description = `Descriptions need at least ${LISTING_LIMITS.descriptionMin} characters.`
  else if (description.length > LISTING_LIMITS.descriptionMax)
    errors.description = `Keep the description to ${LISTING_LIMITS.descriptionMax} characters or fewer.`

  if (hasText(draft.collectionId)) {
    const known = listingCollectionOptions().some((collection) => collection.id === draft.collectionId)
    if (!known) errors.collectionId = 'Choose a collection from the list.'
  }

  if (!hasText(draft.imageId)) errors.imageId = 'Choose an image for this listing.'
  else if (!listingDraftImage(draft)) errors.imageId = 'Choose an image from the sample set.'

  return errors
}

/** The discipline label for a chosen value, or undefined when none is chosen. */
export function listingDisciplineLabel(draft: ListingDraft): string | undefined {
  if (!hasText(draft.discipline)) return undefined
  try {
    return categoryLabel(draft.discipline as ArtworkCategory)
  } catch {
    return undefined
  }
}

/* ── Draft state ─────────────────────────────────────────────────────────── */

/** Where a draft came from. There is no other kind of origin in this build. */
export type ListingDraftOrigin = { kind: 'new' } | { kind: 'artwork'; artworkId: string }

export type ListingDraftOutcome = 'none' | 'incomplete' | 'complete'

export interface ListingDraftState {
  origin: ListingDraftOrigin
  /** The values this origin starts from — what Reset returns to. */
  baseline: ListingDraft
  draft: ListingDraft
  /** Only ever the result of an explicit check, minus any field since edited. */
  errors: ListingErrors
  /** Whether a check has run on the current draft. */
  checked: boolean
  outcome: ListingDraftOutcome
}

export type ListingDraftAction =
  | { type: 'selectOrigin'; origin: ListingDraftOrigin }
  | { type: 'setField'; field: ListingFieldName; value: string }
  | { type: 'reset' }
  | { type: 'check' }

/** Two origins are the same origin — compared without building anything. */
export function sameListingOrigin(a: ListingDraftOrigin, b: ListingDraftOrigin): boolean {
  if (a.kind !== b.kind) return false
  return a.kind === 'artwork' && b.kind === 'artwork' ? a.artworkId === b.artworkId : true
}

/** The baseline a draft starts from. An unknown record yields an empty draft. */
export function listingDraftBaseline(origin: ListingDraftOrigin): ListingDraft {
  if (origin.kind === 'new') return emptyListingDraft()
  const artwork = SAMPLE_ARTWORKS.find((candidate) => candidate.id === origin.artworkId)
  return artwork ? draftFromArtwork(artwork) : emptyListingDraft()
}

export function initialListingDraftState(origin: ListingDraftOrigin): ListingDraftState {
  const baseline = listingDraftBaseline(origin)
  return {
    origin,
    baseline,
    draft: { ...baseline },
    errors: {},
    checked: false,
    outcome: 'none',
  }
}

/**
 * The edit model, in full.
 *
 * Two behaviours are deliberate:
 * - Selecting the origin a draft already has keeps the working draft, so
 *   navigating away from the editor and back does not throw away an edit.
 * - Editing any field drops that field's error and clears the last verdict, so
 *   a “complete” message is never left standing over a draft that changed.
 */
export function listingDraftReducer(
  state: ListingDraftState,
  action: ListingDraftAction,
): ListingDraftState {
  switch (action.type) {
    case 'selectOrigin': {
      if (sameListingOrigin(state.origin, action.origin)) return state
      return initialListingDraftState(action.origin)
    }
    case 'setField': {
      const errors = { ...state.errors }
      delete errors[action.field]
      return {
        ...state,
        draft: { ...state.draft, [action.field]: action.value },
        errors,
        checked: false,
        outcome: 'none',
      }
    }
    case 'reset':
      return {
        ...state,
        draft: { ...state.baseline },
        errors: {},
        checked: false,
        outcome: 'none',
      }
    case 'check': {
      const errors = validateListingDraft(state.draft)
      return {
        ...state,
        errors,
        checked: true,
        outcome: Object.keys(errors).length > 0 ? 'incomplete' : 'complete',
      }
    }
    default:
      return state
  }
}

/** Whether the working draft differs from what its origin started from. */
export function listingDraftIsDirty(state: ListingDraftState): boolean {
  return LISTING_TEXT_FIELDS.concat('imageId').some(
    (field) => state.draft[field] !== state.baseline[field],
  )
}

/** How many fields carry something, out of the whole form. */
export function listingDraftFilledCount(draft: ListingDraft): number {
  return LISTING_FIELDS.filter((field) => hasText(draft[field.name])).length
}

export interface ListingDraftSummary {
  label: string
  tone: 'accent' | 'neutral' | 'quiet'
}

/**
 * A short, honest status for a draft — never a claim that anything was saved.
 * Returns undefined when there is nothing yet to say.
 */
export function listingDraftSummary(state: ListingDraftState): ListingDraftSummary | undefined {
  const filled = listingDraftFilledCount(state.draft)
  const dirty = listingDraftIsDirty(state)

  if (state.checked && state.outcome === 'complete') {
    return { label: 'Every field checks out', tone: 'accent' }
  }
  if (state.checked && state.outcome === 'incomplete') {
    const count = Object.keys(state.errors).length
    return { label: `${count} field${count === 1 ? '' : 's'} need attention`, tone: 'neutral' }
  }
  if (filled === 0) return undefined
  if (dirty) return { label: 'Draft in progress', tone: 'neutral' }
  return { label: 'Prepared from a sample record', tone: 'quiet' }
}

/** A human label for where the draft came from. */
export function listingOriginLabel(origin: ListingDraftOrigin): string {
  if (origin.kind === 'new') return 'New listing draft'
  const artwork = SAMPLE_ARTWORKS.find((candidate) => candidate.id === origin.artworkId)
  return artwork ? `Draft prepared from “${artwork.title}”` : 'New listing draft'
}
