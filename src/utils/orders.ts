/**
 * The orders page model.
 *
 * ArtVerse has no accounts and no order records, so an orders page cannot show
 * an order — and the one thing it must never do is invent one. What it can do is
 * show the *shape* an order will take, with the fields that a backend would fill
 * left as visible placeholders, and be explicit about that on the card itself.
 *
 * The two states the page renders come from here:
 *
 * - `ORDERS_EMPTY_*` — the true state of this build: there is no account to hold
 *   an order and no checkout that could create one.
 * - `orderStructure(artwork)` — one card built around a **real** sample record,
 *   so its link goes somewhere, whose reference, date, status and despatch lines
 *   are bracketed placeholders that no code path fills. `ORDER_STRUCTURE_NOTICE`
 *   labels the card as a structure rather than a purchase, and the page shows it
 *   as such.
 */
import type { Artwork } from '@/types'
import { SAMPLE_ARTWORKS } from '@/data'

export const ORDERS_EMPTY_TITLE = 'No orders — and no way to place one'

export const ORDERS_EMPTY_TEXT =
  'ArtVerse has no accounts, no checkout and no payment, so nothing you do here creates an order. When orders exist, this page will list them, and every line on it will trace back to a real purchase.'

export const ORDERS_PREVIEW_NOTICE =
  'Frontend preview. There is no account behind this page and no order records anywhere: the card below shows the structure an order will take, built from a real sample record. It is not a purchase, and no figure on this page is real.'

export const ORDER_STRUCTURE_NOTICE =
  'Structure preview, shown with the sample record it points at. The reference, date, status and despatch lines are placeholders a backend would fill — nothing here was ordered, paid for or sent.'

export interface OrderStructureField {
  label: string
  /** What the row shows: a bracketed placeholder, or a plain statement. */
  value: string
  /** True when the value is a placeholder rather than a fact about this build. */
  placeholder: boolean
  /** One line explaining where the value would come from, or why it cannot. */
  note: string
}

/**
 * The rows an order summary will need, with nothing invented for them.
 *
 * `Status` is the one row that is not a placeholder: "No order placed" is the
 * true state of every order that does not exist, and stating it is more honest
 * than a bracketed blank.
 */
export function orderStructure(): OrderStructureField[] {
  return [
    {
      label: 'Reference',
      value: '[Order reference]',
      placeholder: true,
      note: 'Issued by a backend that does not exist yet, so nothing generates one here.',
    },
    {
      label: 'Placed on',
      value: '[Date]',
      placeholder: true,
      note: 'The day a real order was placed. No date is written or guessed at.',
    },
    {
      label: 'Status',
      value: 'No order placed',
      placeholder: false,
      note: 'The only accurate status in this build, for every artwork in it.',
    },
    {
      label: 'Payment',
      value: 'No payment taken',
      placeholder: false,
      note: 'ArtVerse holds no card details and talks to no payment provider.',
    },
    {
      label: 'Despatch',
      value: '[Despatch method]',
      placeholder: true,
      note: 'Carrier, tracking and delivery window would come from the seller and the carrier.',
    },
  ]
}

/**
 * The record the structure preview is built around.
 *
 * A real sample record, deliberately: the card's link resolves to a page that
 * exists, and the work named on it is one the catalogue actually holds.
 */
export function orderStructureArtwork(): Artwork | undefined {
  return SAMPLE_ARTWORKS[0]
}
