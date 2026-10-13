/**
 * The seller application preview.
 *
 * A seller application is a form with consequences: something is received,
 * somebody reads it, and a decision follows. None of that exists in ArtVerse, so
 * this module keeps three promises in code:
 *
 * 1. **No document is asked for.** `APPLICATION_FIELDS` is the complete list of
 *    inputs, and every one of them is a name, an address, a discipline or a
 *    sentence about a practice. Identity documents, tax numbers and bank details
 *    are not collected here — asking for them with nowhere safe to put them would
 *    be the most damaging thing a preview could do.
 * 2. **Nothing is submitted.** The model has no state for “received”, “under
 *    review” or “approved”, so no screen can render one. A passing check produces
 *    a *local preview* of what was typed, labelled as exactly that.
 * 3. **Validation is real.** The same pure validator the verification script
 *    exercises decides whether the form is complete, and every message is a
 *    sentence a person can act on.
 *
 * What a real application would need on top of this is listed in
 * `APPLICATION_BLOCKERS`.
 */
import type { ArtworkCategory } from '@/types'
import { ARTWORK_CATEGORIES } from '@/data'
import { hasText, normaliseWhitespace } from '@/utils/text'

export type ApplicationFieldName =
  | 'studioName'
  | 'contactEmail'
  | 'discipline'
  | 'description'
  | 'portfolioUrl'
  | 'guidelines'

export type ApplicationValues = Record<ApplicationFieldName, string>

export interface ApplicationFieldDefinition {
  name: ApplicationFieldName
  label: string
  type: 'text' | 'email' | 'url' | 'select' | 'textarea' | 'checkbox'
  required: boolean
  hint?: string
  placeholder?: string
  /** Rows for a textarea, so the page can size it without a second rule. */
  rows?: number
}

export const APPLICATION_LIMITS = {
  studioNameMin: 2,
  studioNameMax: 60,
  descriptionMin: 40,
  descriptionMax: 600,
} as const

export const APPLICATION_PREVIEW_NOTICE =
  'Preview. There is no application system in ArtVerse: nothing you enter is submitted, received, stored or reviewed, and no reviewer exists. The form validates in your browser so the flow can be seen — and stops there.'

export const APPLICATION_NO_DOCUMENTS =
  'No identity document, tax number, bank detail or certificate is asked for here. A preview with nowhere safe to hold them must not invite them: when applications are real, document checks will belong to the verification step, with a system built for them.'

export const APPLICATION_NO_SUBMISSION =
  'Nothing has been received. This form has no submit action that reaches anywhere, no confirmation would be honest, and a refresh is exactly the same as arriving for the first time.'

export const APPLICATION_REVIEW_NOTE =
  'Every sample studio in this build shows the same state — no application submitted, because there is nowhere to submit one. No studio is marked as reviewed, verified or approved, because nothing reviews anybody.'

/** What a real application workflow would need before it could accept one. */
export const APPLICATION_BLOCKERS: string[] = [
  'A server to receive the application, and a record for it to live in.',
  'An account behind it, so an application belongs to somebody who can return to it.',
  'A review queue with named reviewers and a stated turnaround.',
  'Guidelines a seller can actually read before agreeing to them — there are none to agree to yet.',
  'Document checks for identity and tax, with the storage and retention rules they need.',
  'A decision that means something, and a way to appeal it.',
]

export const APPLICATION_ACKNOWLEDGEMENT = {
  label:
    'I understand this is a preview: no application will be submitted, received or reviewed, and no studio will be verified as a result.',
  hint: 'The acknowledgement a real application would ask for is not shown, because there are no marketplace guidelines to agree to yet.',
} as const

export const APPLICATION_FIELDS: ApplicationFieldDefinition[] = [
  {
    name: 'studioName',
    label: 'Display or studio name',
    type: 'text',
    required: true,
    hint: `The name your work would appear under. ${APPLICATION_LIMITS.studioNameMin}–${APPLICATION_LIMITS.studioNameMax} characters.`,
    placeholder: 'The name a studio would trade under',
  },
  {
    name: 'contactEmail',
    label: 'Contact email',
    type: 'email',
    required: true,
    hint: 'Where a reviewer would reply, if there were one. Nothing is sent to it from here.',
    placeholder: 'name@example.com',
  },
  {
    name: 'discipline',
    label: 'Creative discipline',
    type: 'select',
    required: true,
    hint: 'The five directions ArtVerse is organised around. One may be chosen.',
  },
  {
    name: 'description',
    label: 'A short description of your practice',
    type: 'textarea',
    required: true,
    rows: 6,
    hint: `${APPLICATION_LIMITS.descriptionMin}–${APPLICATION_LIMITS.descriptionMax} characters, in your own words. Nothing here is published.`,
  },
  {
    name: 'portfolioUrl',
    label: 'Portfolio or website',
    type: 'url',
    required: false,
    hint: 'Optional. A full address beginning with https://, and nothing else will be accepted.',
    placeholder: 'https://example.com',
  },
  {
    name: 'guidelines',
    label: APPLICATION_ACKNOWLEDGEMENT.label,
    type: 'checkbox',
    required: true,
    hint: APPLICATION_ACKNOWLEDGEMENT.hint,
  },
]

export function emptyApplication(): ApplicationValues {
  return {
    studioName: '',
    contactEmail: '',
    discipline: '',
    description: '',
    portfolioUrl: '',
    guidelines: '',
  }
}

export type ApplicationErrors = Partial<Record<ApplicationFieldName, string>>

const REQUIRED_MESSAGES: Record<ApplicationFieldName, string> = {
  studioName: 'Enter the name your work would appear under.',
  contactEmail: 'Enter an email address in the form name@example.com.',
  discipline: 'Choose the discipline your work belongs to.',
  description: 'Describe your practice in a sentence or two.',
  portfolioUrl: '',
  guidelines: 'Acknowledge that this form does not submit anything.',
}

/** The discipline options, straight from the catalogue's own categories. */
export function applicationDisciplines(): { id: ArtworkCategory; label: string }[] {
  return ARTWORK_CATEGORIES
}

/**
 * The whole check.
 *
 * Required fields, a name and description inside their stated limits, an address
 * that looks like an address and — where one is given — a full web address with
 * a scheme. An empty optional field is never an error.
 */
export function validateApplication(values: ApplicationValues): ApplicationErrors {
  const errors: ApplicationErrors = {}
  const trimmed = (name: ApplicationFieldName) => normaliseWhitespace(values[name] ?? '')

  for (const field of APPLICATION_FIELDS) {
    const value = trimmed(field.name)

    if (field.type === 'checkbox') {
      // A checkbox is agreed to or it is not; there is no “too short” about it.
      if (field.required && values[field.name] !== 'yes') {
        errors[field.name] = REQUIRED_MESSAGES[field.name]
      }
      continue
    }

    if (!hasText(value)) {
      if (field.required) errors[field.name] = REQUIRED_MESSAGES[field.name]
      continue
    }

    if (field.name === 'studioName') {
      if (value.length < APPLICATION_LIMITS.studioNameMin) {
        errors.studioName = `Use at least ${APPLICATION_LIMITS.studioNameMin} characters.`
      } else if (value.length > APPLICATION_LIMITS.studioNameMax) {
        errors.studioName = `Use at most ${APPLICATION_LIMITS.studioNameMax} characters.`
      }
    }

    if (field.name === 'contactEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      errors.contactEmail = 'Enter an email address in the form name@example.com.'
    }

    if (field.name === 'discipline' && !ARTWORK_CATEGORIES.some((entry) => entry.id === value)) {
      errors.discipline = 'Choose one of the five disciplines ArtVerse is organised around.'
    }

    if (field.name === 'description') {
      if (value.length < APPLICATION_LIMITS.descriptionMin) {
        errors.description = `Use at least ${APPLICATION_LIMITS.descriptionMin} characters — a sentence or two.`
      } else if (value.length > APPLICATION_LIMITS.descriptionMax) {
        errors.description = `Use at most ${APPLICATION_LIMITS.descriptionMax} characters.`
      }
    }

    if (field.name === 'portfolioUrl' && !/^https:\/\/[^\s.]+\.[^\s]{2,}$/.test(value)) {
      errors.portfolioUrl = 'Enter a full address beginning with https://, or clear the field.'
    }
  }

  return errors
}

export function applicationIsComplete(values: ApplicationValues): boolean {
  return Object.keys(validateApplication(values)).length === 0
}

export interface ApplicationPreviewRow {
  label: string
  /** The value as entered, or the plain statement that none was given. */
  value: string
  /** True when the row is showing an absence rather than an entry. */
  absent: boolean
}

/**
 * The information entered, read back for review.
 *
 * This is a preview of the form's own contents, not a summary of an application:
 * `APPLICATION_PREVIEW_LABEL` says so wherever the rows are shown. The
 * acknowledgement is reported as plain text rather than a checkbox, because a
 * checked box in a read-back is the shape of a completed submission.
 */
export const APPLICATION_PREVIEW_LABEL =
  'Preview of what you entered — held in this browser tab, submitted nowhere.'

export function applicationPreview(values: ApplicationValues): ApplicationPreviewRow[] {
  const discipline = ARTWORK_CATEGORIES.find((entry) => entry.id === values.discipline)?.label

  return [
    { label: 'Display or studio name', value: values.studioName, absent: false },
    { label: 'Contact email', value: values.contactEmail, absent: false },
    {
      label: 'Creative discipline',
      value: discipline ?? '',
      absent: !discipline,
    },
    { label: 'Practice', value: values.description, absent: false },
    {
      label: 'Portfolio or website',
      value: values.portfolioUrl,
      absent: values.portfolioUrl.trim() === '',
    },
    {
      label: 'Acknowledgement',
      value: values.guidelines === 'yes' ? 'Acknowledged in the form above' : '',
      absent: values.guidelines !== 'yes',
    },
  ].map((row) => ({
    ...row,
    value: row.absent && row.value === '' ? 'Not provided' : row.value,
  }))
}

/* ── The form's edit model ───────────────────────────────────────────────── */

export type ApplicationOutcome = 'none' | 'invalid' | 'valid'

export interface ApplicationState {
  values: ApplicationValues
  errors: ApplicationErrors
  checked: boolean
  outcome: ApplicationOutcome
}

export type ApplicationAction =
  | { type: 'setField'; field: ApplicationFieldName; value: string }
  | { type: 'check' }
  | { type: 'clear' }

export function initialApplicationState(): ApplicationState {
  return { values: emptyApplication(), errors: {}, checked: false, outcome: 'none' }
}

/**
 * The edit model, in full.
 *
 * A passing check means the form is complete and stops there: `outcome` has no
 * value that could mean submitted, and the page renders the read-back above
 * instead of a confirmation.
 */
export function applicationReducer(
  state: ApplicationState,
  action: ApplicationAction,
): ApplicationState {
  switch (action.type) {
    case 'setField': {
      const errors = { ...state.errors }
      delete errors[action.field]
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors,
        checked: false,
        outcome: 'none',
      }
    }

    case 'check': {
      const errors = validateApplication(state.values)
      return {
        ...state,
        errors,
        checked: true,
        outcome: Object.keys(errors).length > 0 ? 'invalid' : 'valid',
      }
    }

    case 'clear':
      return initialApplicationState()

    default:
      return state
  }
}
