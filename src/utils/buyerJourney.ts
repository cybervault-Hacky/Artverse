/**
 * The buyer journey model.
 *
 * Phase 10 adds the screens a buyer would use — saved works, a cart, a checkout
 * preview and an orders page — with no backend anywhere behind them. That makes
 * this module the whole state layer, and it exists so one honest question is
 * answered in one place rather than on each screen: *is this really a price?*
 *
 * 1. **Where the state lives.** `BuyerJourneyState` is two lists of artwork ids:
 *    the works saved, and the works in the cart. Both reducers are pure and
 *    idempotent, so saving a work twice is one save and adding it to the cart
 *    twice is one item — a work is a single object, and there is no quantity for
 *    a cart to hold. No storage API is touched: the lists live in memory for the
 *    visit, and every screen that shows them says so.
 * 2. **What a read tolerates.** `normaliseIdList` and `resolveArtworks` are the
 *    only way ids become records. Junk — a non-array, a number, a duplicate, an
 *    id with no record — is skipped rather than thrown on, so a corrupted list
 *    degrades to a shorter list instead of a blank screen. The reducer is
 *    stricter still: it never accepts an id the catalogue does not hold.
 * 3. **What a total may be.** `cartTotal` returns a named state rather than a
 *    number. A total exists only when every item carries a price and they all
 *    share one currency; anything else is one of four states that carry the
 *    wording explaining why no single figure can be shown. Nothing is converted,
 *    estimated or added across currencies, and no shipping, tax, discount or fee
 *    is ever added to a figure.
 */
import type { Artwork } from '@/types'
import { SAMPLE_ARTWORKS } from '@/data'
import { artworkPrice, formatPrice, type FormattedPrice } from '@/utils/pricing'

/** What the buyer journey holds for the visit: two lists of record ids. */
export interface BuyerJourneyState {
  /** Works saved from their own page, in the order they were saved. */
  savedIds: string[]
  /** Works put in the cart, in the order they were added. */
  cartIds: string[]
}

export const EMPTY_BUYER_JOURNEY: BuyerJourneyState = { savedIds: [], cartIds: [] }

export type BuyerJourneyAction =
  | { type: 'save'; artworkId: string }
  | { type: 'unsave'; artworkId: string }
  | { type: 'toggleSaved'; artworkId: string }
  | { type: 'addToCart'; artworkId: string }
  | { type: 'removeFromCart'; artworkId: string }
  | { type: 'emptyCart' }

/** Shown wherever the saved list or the cart is displayed. */
export const BUYER_STATE_NOTE =
  'Saved works and the cart are held in this browser tab for this visit. Nothing is written to your device, nothing is sent anywhere, and nothing is shared with an account or another device — ArtVerse has no accounts.'

/** Shown on the artwork page beside the two controls. */
export const BUYER_ACTION_NOTE =
  'Saving is a bookmark and the cart is a list to think with. Neither reserves a work: ArtVerse has no availability, no checkout and no payment, so nothing here can be bought.'

export const SAVED_EMPTY_TITLE = 'Nothing saved yet'
export const SAVED_EMPTY_TEXT =
  'Save a work from its own page and it will be listed here for the rest of this visit. Saving holds nothing — it is a bookmark, not a reservation.'

export const CART_EMPTY_TITLE = 'Your cart is empty'
export const CART_EMPTY_TEXT =
  'Add a work to the cart from its page and it will be listed here, with its price if the catalogue holds one. No work in this build carries a price, and nothing in it can be bought.'

export const CHECKOUT_EMPTY_TITLE = 'There is nothing to check out'
export const CHECKOUT_EMPTY_TEXT =
  'The checkout preview opens on an empty cart, so there is nothing to review. Add a sample record from its page to see the sections a real checkout would ask for.'

/**
 * An id worth holding: something the catalogue really has.
 *
 * The one place a mistaken or stale id is stopped, so no list in this build can
 * hold a reference to a record that does not exist.
 */
function isKnownArtworkId(value: unknown): value is string {
  return (
    typeof value === 'string' && SAMPLE_ARTWORKS.some((artwork) => artwork.id === value)
  )
}

/**
 * A list of ids, from anything at all.
 *
 * Non-arrays become an empty list, non-strings are dropped, and the first
 * occurrence of an id wins — so the order a list was written in survives and no
 * id can appear twice.
 */
export function normaliseIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  for (const entry of value) {
    if (typeof entry === 'string' && entry.trim() !== '' && !seen.has(entry)) {
      seen.add(entry)
    }
  }

  return [...seen]
}

/**
 * The records behind a list of ids, skipping anything unknown.
 *
 * Ids are resolved against the data layer, so a list can be full of junk and the
 * worst outcome is a shorter list.
 */
export function resolveArtworks(ids: unknown): Artwork[] {
  return normaliseIdList(ids)
    .map((id) => SAMPLE_ARTWORKS.find((artwork) => artwork.id === id))
    .filter((artwork): artwork is Artwork => Boolean(artwork))
}

/** The works currently saved, in the order they were saved. */
export function savedArtworks(state: BuyerJourneyState): Artwork[] {
  return resolveArtworks(state.savedIds)
}

/** The works currently in the cart, in the order they were added. */
export function cartArtworks(state: BuyerJourneyState): Artwork[] {
  return resolveArtworks(state.cartIds)
}

export function isSaved(state: BuyerJourneyState, artworkId: string): boolean {
  return state.savedIds.includes(artworkId)
}

export function isInCart(state: BuyerJourneyState, artworkId: string): boolean {
  return state.cartIds.includes(artworkId)
}

/**
 * The state model, in full.
 *
 * Every branch is idempotent and ignores an id the catalogue does not hold, so
 * a control can be pressed twice — or handed something stale — without changing
 * anything it should not.
 */
export function buyerJourneyReducer(
  state: BuyerJourneyState,
  action: BuyerJourneyAction,
): BuyerJourneyState {
  switch (action.type) {
    case 'save':
      if (!isKnownArtworkId(action.artworkId)) return state
      return state.savedIds.includes(action.artworkId)
        ? state
        : { ...state, savedIds: [...state.savedIds, action.artworkId] }

    case 'unsave':
      return state.savedIds.includes(action.artworkId)
        ? { ...state, savedIds: state.savedIds.filter((id) => id !== action.artworkId) }
        : state

    case 'toggleSaved':
      return buyerJourneyReducer(state, {
        type: state.savedIds.includes(action.artworkId) ? 'unsave' : 'save',
        artworkId: action.artworkId,
      })

    case 'addToCart':
      if (!isKnownArtworkId(action.artworkId)) return state
      return state.cartIds.includes(action.artworkId)
        ? state
        : { ...state, cartIds: [...state.cartIds, action.artworkId] }

    case 'removeFromCart':
      return state.cartIds.includes(action.artworkId)
        ? { ...state, cartIds: state.cartIds.filter((id) => id !== action.artworkId) }
        : state

    case 'emptyCart':
      return state.cartIds.length === 0 ? state : { ...state, cartIds: [] }

    default:
      return state
  }
}

/* ── Totals ───────────────────────────────────────────────────────────────
 *
 * Four ways there is no single figure, and one way there is. `kind` is what a
 * screen branches on; `heading` and `message` are the wording it shows, written
 * here once so the cart, the checkout and the orders page cannot describe the
 * same state differently.
 */

export type CartTotalKind = 'empty' | 'unpriced' | 'partial' | 'complete' | 'mixed'

/** One currency's share of the cart, when a subtotal can be worked out in it. */
export interface CartCurrencyGroup {
  /** The ISO 4217 code every amount in this group is in. */
  code: string
  /** The group's own subtotal, code-first and never converted. */
  subtotal: FormattedPrice
  /** How many works the group covers. */
  count: number
}

export interface CartTotal {
  kind: CartTotalKind
  /** Works in the cart, resolved against the catalogue. */
  itemCount: number
  /** How many of them carry a usable price. */
  pricedCount: number
  /** How many of them carry none. */
  unpricedCount: number
  /** Per-currency subtotals. Empty unless at least one work is priced. */
  groups: CartCurrencyGroup[]
  /** Short label for the figure, or for why there is not one. */
  heading: string
  /** The explanation that goes with the heading. */
  message: string
}

/**
 * Adds amounts in one currency.
 *
 * Rounded to the cent so a long list of amounts cannot accumulate a floating
 * point tail that then prints as a figure nobody typed.
 */
function sumAmounts(amounts: number[]): number {
  const total = amounts.reduce((running, amount) => running + amount, 0)
  return Math.round(total * 100) / 100
}

/**
 * What the cart adds up to — or which of the honest reasons it does not.
 *
 * `complete` is the only state with a single figure, and it requires both
 * conditions: every item priced, and one currency across all of them. A cart
 * with nothing in it, a cart with no prices, a cart with some prices and a cart
 * with more than one currency each get their own state and their own sentence.
 */
export function cartTotal(artworks: Artwork[]): CartTotal {
  const priced = artworks
    .map((artwork) => ({ artwork, price: artworkPrice(artwork) }))
    .filter(
      (entry): entry is { artwork: Artwork; price: FormattedPrice } => entry.price !== undefined,
    )

  const itemCount = artworks.length
  const pricedCount = priced.length
  const unpricedCount = itemCount - pricedCount

  if (itemCount === 0) {
    return {
      kind: 'empty',
      itemCount,
      pricedCount,
      unpricedCount,
      groups: [],
      heading: 'No total',
      message: 'The cart is empty, so there is nothing to add up.',
    }
  }

  if (pricedCount === 0) {
    return {
      kind: 'unpriced',
      itemCount,
      pricedCount,
      unpricedCount,
      groups: [],
      heading: 'A total cannot be shown',
      message: `None of the ${itemCount === 1 ? 'work' : `${itemCount} works`} in the cart carries a price. No record in this catalogue does, and ArtVerse will not invent one to fill the gap — an estimate here would be a made-up figure wearing a currency code.`,
    }
  }

  // Group by the code each work is priced in. Nothing is converted: two
  // currencies are two groups, never one sum.
  const codes = [...new Set(priced.map((entry) => entry.price.code))]
  const groups: CartCurrencyGroup[] = codes.flatMap((code) => {
    const entries = priced.filter((entry) => entry.price.code === code)
    const subtotal = formatPrice({
      amount: sumAmounts(entries.map((entry) => entry.price.value)),
      currency: code,
    })

    // Unreachable: every amount here came from a price that already formatted.
    // Written as a guard rather than a cast so no figure is ever shown unformatted.
    return subtotal ? [{ code, subtotal, count: entries.length }] : []
  })

  if (groups.length === 0) {
    return {
      kind: 'unpriced',
      itemCount,
      pricedCount,
      unpricedCount,
      groups: [],
      heading: 'A total cannot be shown',
      message: 'No work in the cart carries a price that can be displayed, so there is nothing to add up.',
    }
  }

  if (groups.length > 1) {
    const list = groups.map((group) => `${group.code} (${group.count})`).join(' and ')
    return {
      kind: 'mixed',
      itemCount,
      pricedCount,
      unpricedCount,
      groups,
      heading: 'No combined total',
      message: `The cart holds works priced in more than one currency — ${list}. ArtVerse has no exchange rate and does not treat currencies as interchangeable, so each currency is shown on its own line and they are never added together.`,
    }
  }

  const group = groups[0]

  if (unpricedCount > 0) {
    return {
      kind: 'partial',
      itemCount,
      pricedCount,
      unpricedCount,
      groups,
      heading: 'A subtotal for part of the cart',
      message: `${pricedCount} of ${itemCount} works carry a price, all in ${group.code}, so this subtotal covers only those. ${unpricedCount === 1 ? 'One work carries' : `${unpricedCount} works carry`} no price at all, and no figure is invented for ${unpricedCount === 1 ? 'it' : 'them'} — the cart therefore has no complete total.`,
    }
  }

  return {
    kind: 'complete',
    itemCount,
    pricedCount,
    unpricedCount,
    groups,
    heading: 'Subtotal',
    message: `Every work in the cart is priced in ${group.code}. Nothing has been converted. This is a subtotal only: ArtVerse adds no shipping, tax, discount or fee, and nothing can be completed — there is no payment and no order behind this figure.`,
  }
}
