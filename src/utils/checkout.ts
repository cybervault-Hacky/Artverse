/**
 * The checkout preview model.
 *
 * A checkout is the most dangerous screen to fake: every field it shows is a
 * field a real checkout would *collect*, and every figure it shows is a figure
 * somebody would pay. So this module keeps three promises in code rather than in
 * copy alone:
 *
 * 1. **No payment data exists here.** There is no card field, no wallet address
 *    and no provider — `CHECKOUT_FIELDS` is the complete list of inputs, and it
 *    holds a name, an email, a telephone number and a postal address.
 * 2. **Nothing is submitted.** The model has no state for “placed”, “confirmed”
 *    or “paid”, so no screen can render one. `CHECKOUT_NOT_PLACED` says so, and
 *    the review section's action is permanently disabled with its reason.
 * 3. **Validation is honest.** Sections open in order and are checked with the
 *    same pure validator the verification script exercises: a field that cannot
 *    be resolved to a sentence a person would understand is not required at all.
 *
 * What a real checkout would need on top of this is listed in `PLACE_ORDER_BLOCKERS`
 * — a payment provider, server-side order records, real availability, despatch
 * rules and tax rules. None of it exists, and none of it is simulated.
 */
import { hasText, normaliseWhitespace } from '@/utils/text'

export type CheckoutStageId = 'contact' | 'delivery' | 'review'

export interface CheckoutStage {
  id: CheckoutStageId
  /** Step label in the stepper. */
  label: string
  /** One line describing what the step would collect. */
  description: string
}

/**
 * The three sections, in order.
 *
 * Contact and delivery are the two things a checkout genuinely has to ask for.
 * Review is where the order would be confirmed — and where this build states
 * plainly that it cannot be.
 */
export const CHECKOUT_STAGES: CheckoutStage[] = [
  {
    id: 'contact',
    label: 'Contact',
    description: 'Who an order would be for, and where a receipt would go.',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    description: 'The address a shipment would need.',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'What the cart holds, and why it cannot be paid for yet.',
  },
]

export type CheckoutFieldName =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'postcode'
  | 'country'

export type CheckoutDetails = Record<CheckoutFieldName, string>

export interface CheckoutFieldDefinition {
  name: CheckoutFieldName
  label: string
  /** The section the field appears in. Review holds no inputs. */
  stage: Exclude<CheckoutStageId, 'review'>
  kind: 'text' | 'email'
  required: boolean
  hint?: string
  placeholder?: string
  /** Standard `autocomplete` token, so a browser can fill the field correctly. */
  autocomplete?: string
}

/**
 * The whole form, described once.
 *
 * The page renders from this list and the verification script reads it, so the
 * labels, the required flags and what the validator expects cannot drift apart.
 */
export const CHECKOUT_FIELDS: CheckoutFieldDefinition[] = [
  {
    name: 'fullName',
    label: 'Full name',
    stage: 'contact',
    kind: 'text',
    required: true,
    autocomplete: 'name',
    hint: 'The name an order would be recorded under.',
  },
  {
    name: 'email',
    label: 'Email',
    stage: 'contact',
    kind: 'email',
    required: true,
    autocomplete: 'email',
    hint: 'Where an order confirmation would be sent — if any confirmation existed.',
  },
  {
    name: 'phone',
    label: 'Telephone',
    stage: 'contact',
    kind: 'text',
    required: false,
    autocomplete: 'tel',
    hint: 'Optional. A carrier would use this for a delivery only if there were one.',
  },
  {
    name: 'addressLine1',
    label: 'Address',
    stage: 'delivery',
    kind: 'text',
    required: true,
    autocomplete: 'address-line1',
    placeholder: 'Street and number',
  },
  {
    name: 'addressLine2',
    label: 'Address line 2',
    stage: 'delivery',
    kind: 'text',
    required: false,
    autocomplete: 'address-line2',
    hint: 'Optional — flat, building or district.',
  },
  {
    name: 'city',
    label: 'Town or city',
    stage: 'delivery',
    kind: 'text',
    required: true,
    autocomplete: 'address-level2',
  },
  {
    name: 'postcode',
    label: 'Postal code',
    stage: 'delivery',
    kind: 'text',
    required: true,
    autocomplete: 'postal-code',
  },
  {
    name: 'country',
    label: 'Country',
    stage: 'delivery',
    kind: 'text',
    required: true,
    autocomplete: 'country-name',
  },
]

export type CheckoutErrors = Partial<Record<CheckoutFieldName, string>>

export function emptyCheckoutDetails(): CheckoutDetails {
  return {
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: '',
  }
}

/** The sections a field belongs to, so a section can name its own inputs. */
export function fieldsForStage(stage: CheckoutStageId): CheckoutFieldDefinition[] {
  return CHECKOUT_FIELDS.filter((field) => field.stage === stage)
}

/**
 * What a section is waiting for, in plain language.
 *
 * Only the fields the section actually shows are looked at, and a blank
 * optional field is never an error — an order with no telephone number is an
 * ordinary order.
 */
/**
 * What a section says when a field is empty.
 *
 * Written out rather than generated from the label: “Enter Postal code.” is not
 * a sentence, and a message a person cannot read is not validation.
 */
const REQUIRED_MESSAGES: Record<CheckoutFieldName, string> = {
  fullName: 'Enter the full name an order would be recorded under.',
  email: 'Enter an email address in the form name@example.com.',
  phone: '',
  addressLine1: 'Enter the street and number, or the first line of the address.',
  addressLine2: '',
  city: 'Enter the town or city.',
  postcode: 'Enter the postal code or ZIP.',
  country: 'Enter the country.',
}

export function validateCheckoutStage(
  details: CheckoutDetails,
  stage: CheckoutStageId,
): CheckoutErrors {
  const errors: CheckoutErrors = {}

  for (const field of fieldsForStage(stage)) {
    const value = normaliseWhitespace(details[field.name] ?? '')

    if (!hasText(value)) {
      if (field.required) errors[field.name] = REQUIRED_MESSAGES[field.name]
      continue
    }

    if (field.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      errors[field.name] = 'Enter an email address in the form name@example.com.'
    }

    if (field.name === 'addressLine1' && value.length < 4) {
      errors[field.name] = 'Enter the street and number, or the first line of the address.'
    }

    if (field.name === 'city' && value.length < 2) {
      errors[field.name] = 'Enter the town or city.'
    }

    if (field.name === 'country' && value.length < 2) {
      errors[field.name] = 'Enter the country.'
    }

    if (field.name === 'postcode') {
      if (value.length < 3) errors[field.name] = 'Enter the postal code or ZIP.'
      else if (value.length > 12) errors[field.name] = 'Use at most 12 characters.'
    }

    if (field.name === 'phone' && !/^\+?[\d()[\]\s.-]{6,24}$/.test(value)) {
      errors[field.name] = 'Use digits, spaces and the usual punctuation, or leave the field empty.'
    }
  }

  return errors
}

/** Every section checked at once. Used by the review step and the tests. */
export function validateCheckoutDetails(details: CheckoutDetails): CheckoutErrors {
  return CHECKOUT_STAGES.reduce<CheckoutErrors>(
    (errors, stage) => ({ ...errors, ...validateCheckoutStage(details, stage.id) }),
    {},
  )
}

export function checkoutStageIsValid(details: CheckoutDetails, stage: CheckoutStageId): boolean {
  return Object.keys(validateCheckoutStage(details, stage)).length === 0
}

export interface CheckoutState {
  details: CheckoutDetails
  /** Index into `CHECKOUT_STAGES` for the section on screen. */
  stageIndex: number
  /** The furthest section reached, so the stepper cannot skip ahead. */
  furthestIndex: number
  /** Messages for the section currently on screen, after a check was asked for. */
  errors: CheckoutErrors
  /** Whether a check has run on the current section. */
  checked: boolean
}

export type CheckoutAction =
  | { type: 'setField'; field: CheckoutFieldName; value: string }
  | { type: 'continue' }
  | { type: 'back' }
  | { type: 'goToStage'; index: number }

export function initialCheckoutState(): CheckoutState {
  return {
    details: emptyCheckoutDetails(),
    stageIndex: 0,
    furthestIndex: 0,
    errors: {},
    checked: false,
  }
}

/**
 * The section model, in full.
 *
 * Typed values are never thrown away: `details` is one object that survives
 * every move between sections, and only the messages change. A section can only
 * be left by continuing, and continuing runs the validator — so the review step
 * cannot be reached on an incomplete address.
 */
export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'setField': {
      const errors = { ...state.errors }
      delete errors[action.field]
      return {
        ...state,
        details: { ...state.details, [action.field]: action.value },
        errors,
      }
    }

    case 'continue': {
      const stage = CHECKOUT_STAGES[state.stageIndex]
      const errors = validateCheckoutStage(state.details, stage.id)

      if (Object.keys(errors).length > 0) {
        return { ...state, errors, checked: true }
      }

      const stageIndex = Math.min(state.stageIndex + 1, CHECKOUT_STAGES.length - 1)
      return {
        ...state,
        stageIndex,
        furthestIndex: Math.max(state.furthestIndex, stageIndex),
        errors: {},
        checked: false,
      }
    }

    case 'back': {
      const stageIndex = Math.max(state.stageIndex - 1, 0)
      return { ...state, stageIndex, errors: {}, checked: false }
    }

    case 'goToStage': {
      // A section already visited can be returned to; one that has not been
      // reached cannot be jumped to.
      if (action.index < 0 || action.index > state.furthestIndex) return state
      return { ...state, stageIndex: action.index, errors: {}, checked: false }
    }

    default:
      return state
  }
}

/** The sections still waiting for something, for the review step to name. */
export function incompleteStages(details: CheckoutDetails): CheckoutStage[] {
  return CHECKOUT_STAGES.filter((stage) => !checkoutStageIsValid(details, stage.id))
}

/* ── What this screen is not ─────────────────────────────────────────────── */

export const CHECKOUT_PREVIEW_NOTICE =
  'Checkout preview. No payment is taken, no order is placed and nothing you type is sent anywhere: ArtVerse has no payment provider, no order records and no server behind this form.'

export const CHECKOUT_DETAILS_NOTE =
  'What you type stays in this tab. It is not sent, not stored and not attached to any account — there are no accounts — and it disappears when you leave or reload the page.'

export const CHECKOUT_PAYMENT_NOTE =
  'No card fields are shown and no card data is collected, stored or transmitted anywhere in this build. When payments arrive they will be handled by a payment provider, on the provider’s own secure form — ArtVerse itself will never hold card details.'

export const PLACE_ORDER_LABEL = 'Place order — not available'

/**
 * Why the action cannot be taken, in one sentence.
 *
 * This is not a state that changes: nothing in the build can place an order, so
 * the sentence is a constant rather than a message a payment step could clear.
 */
export const PLACE_ORDER_REASON =
  'There is no payment provider, no order record and no seller behind this screen, so no order can be placed — this button stays disabled until those exist.'

/** What a real checkout would need before it could take an order. */
export const PLACE_ORDER_BLOCKERS: string[] = [
  'A payment provider, with its own secure form — no card details would pass through ArtVerse.',
  'Order records on a server, so an order exists somewhere other than a browser tab.',
  'Real availability: whether a work is still there to sell, which no record in this build can say.',
  'Despatch and delivery rules per work, including how a digital work would ever reach anyone.',
  'Tax and fee rules for the countries being sold into, stated before payment rather than after.',
  'Confirmations, receipts and a way to ask about an order — none of which exists.',
]

/**
 * What the delivery section can honestly say.
 *
 * The catalogue records a work's discipline and medium, and nothing about
 * despatch, packaging, carriers or delivery times. Where the cart holds work the
 * catalogue records as digital, that fact is used for exactly what it is worth:
 * a note that a file or a download link would need storage and an account, and
 * that neither exists — never a promise that a download would arrive.
 */
export function checkoutDeliveryNote(digitalTitles: string[]): string {
  if (digitalTitles.length === 0) {
    return 'The catalogue records each work’s discipline and medium, and nothing about despatch or delivery. This section collects the address a shipment would need. Nothing is dispatched, no carrier is involved, and no delivery date can be given — there is no stock, no seller and no order behind this screen.'
  }

  const list = digitalTitles.join(', ')
  return `Recorded as digital work: ${list}. A file or a download link would need storage and an account to hold it, and ArtVerse has neither — this build delivers nothing and promises no download. The address below is the one a physical shipment would need if a seller ever sent one.`
}
