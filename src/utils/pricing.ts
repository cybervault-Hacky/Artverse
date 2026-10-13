/**
 * Price presentation rules.
 *
 * ArtVerse has nothing for sale, so this module is mostly about what *not* to
 * do. Everything a price needs to be shown honestly is decided here, once:
 *
 * 1. **An amount without a currency is not a price.** `parsePriceAmount` and
 *    `normaliseCurrencyCode` are both required before anything is displayed, and
 *    the code is shown beside the amount wherever it appears — never a bare
 *    symbol, and never converted into another currency, because nothing in this
 *    build knows an exchange rate.
 * 2. **A missing price is stated, not implied.** `PRICE_NOT_PROVIDED` is what a
 *    record without a price says. It is never rendered as “free”, “price on
 *    application”, “from …” or a struck-through comparison.
 * 3. **A price is not an offer.** `PRICE_NOT_PURCHASABLE` sits with every price
 *    the build shows, because there is no basket, checkout, payment or order
 *    anywhere behind it.
 *
 * The one amount in this file is `ILLUSTRATIVE_PRICE`, used only by the
 * design-system reference so the price display can be seen working. It belongs
 * to no record: `hasUsablePrice` returns false for all six sample works, and the
 * verification script asserts that.
 */
import type { Artwork, ArtworkPrice } from '@/types'

/**
 * The currency codes the seller draft form offers.
 *
 * A short, plain list of ISO 4217 codes — not a currency policy, and not a
 * statement about which currencies ArtVerse will trade in. Every one of them is
 * displayed with its code, and nothing is ever converted between them.
 */
export const CURRENCY_OPTIONS: readonly string[] = ['INR', 'USD', 'EUR', 'GBP', 'AUD']

/** The most digits an amount may carry before the decimal point. */
export const PRICE_MAX_DIGITS = 10

/** How many decimal places an amount may carry. */
export const PRICE_MAX_DECIMALS = 2

/** Shown wherever a record carries no price. */
export const PRICE_NOT_PROVIDED =
  'No price has been provided for this sample record.'

/** Shown with every price, because nothing in this build can sell anything. */
export const PRICE_NOT_PURCHASABLE =
  'Nothing here can be purchased: ArtVerse has no basket, checkout, payment or order, and a price is a fact about a record rather than an offer.'

/** Shown beside a value typed into a listing draft. */
export const PRICE_DRAFT_NOTE =
  'A price prepared here stays in this draft. It is not published, not converted, and nothing can be bought with it.'

/**
 * An amount used by the design-system page to demonstrate the display. It
 * belongs to no record — see the module note.
 */
export const ILLUSTRATIVE_PRICE: ArtworkPrice = { amount: 2400, currency: 'USD' }

/** Labels the illustrative amount so it can never be mistaken for record data. */
export const ILLUSTRATIVE_PRICE_LABEL =
  'Illustrative amount, shown so the display can be reviewed. No record in this catalogue carries a price.'

/**
 * The ISO 4217 code for a value, uppercased, or undefined when it cannot be one.
 *
 * Only the shape is checked — three letters. Whether the code is one a real
 * currency uses is not this build's business to guess at, and a code it does not
 * recognise is still shown as written rather than converted or dropped.
 */
export function normaliseCurrencyCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const code = value.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : undefined
}

/**
 * A positive amount from a number or from what was typed into a field.
 *
 * Deliberately strict about typed values: digits with at most one decimal point
 * and at most two decimal places. Commas, symbols, spaces and anything else are
 * rejected rather than quietly stripped, because “1,200” means different things
 * in different places and guessing would be the kind of silent assumption this
 * module exists to avoid.
 */
export function parsePriceAmount(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined
  }
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const shape = new RegExp(
    `^\\d{1,${PRICE_MAX_DIGITS}}(\\.\\d{1,${PRICE_MAX_DECIMALS}})?$`,
  )
  if (!shape.test(trimmed)) return undefined

  const amount = Number(trimmed)
  return Number.isFinite(amount) && amount > 0 ? amount : undefined
}

/** Whether an amount can be shown as typed, and why not when it cannot. */
export function priceAmountError(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  if (/,/.test(trimmed))
    return 'Use digits only — no commas or thousands separators.'
  if (!/^[\d.]/.test(trimmed)) return 'Enter the amount as digits, e.g. 2400 or 2400.50.'
  if (!/^\d+(\.\d*)?$/.test(trimmed))
    return 'Enter the amount as digits and at most one decimal point, e.g. 2400.50.'
  if (/^\d+\.\d{3,}$/.test(trimmed)) return 'Use at most two decimal places.'
  const whole = trimmed.split('.')[0]
  if (whole.length > PRICE_MAX_DIGITS) return `Use at most ${PRICE_MAX_DIGITS} digits.`
  if (parsePriceAmount(trimmed) === undefined) return 'Enter an amount greater than zero.'
  return undefined
}

export interface FormattedPrice {
  /** Visible text, e.g. `USD 2,400`. The code is always part of it. */
  text: string
  /** The uppercased ISO 4217 code on its own. */
  code: string
  /** The amount, grouped, without the code. */
  amount: string
  /** Spelled-out currency name where the runtime can supply one. */
  name?: string
  /** What a screen reader should hear, e.g. `USD 2,400 (US Dollar)`. */
  spoken: string
}

/**
 * How a price is written.
 *
 * The code leads and the amount follows, in the same order in every locale, so
 * `USD 2,400` can never be misread as a different currency's amount. Grouping is
 * fixed to one locale deliberately: this build is not localising prices, and
 * pretending otherwise while showing an unconverted amount would be misleading.
 */
export function formatPrice(price: ArtworkPrice | undefined): FormattedPrice | undefined {
  const code = normaliseCurrencyCode(price?.currency)
  const amount = parsePriceAmount(price?.amount)
  if (!code || amount === undefined) return undefined

  const amountText = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: PRICE_MAX_DECIMALS,
  }).format(amount)

  let name: string | undefined
  try {
    name = new Intl.DisplayNames(['en'], { type: 'currency' }).of(code)
  } catch {
    name = undefined
  }

  const text = `${code} ${amountText}`
  return { text, code, amount: amountText, name, spoken: name ? `${text} (${name})` : text }
}

/** The price of a record, formatted — undefined unless the record really holds one. */
export function artworkPrice(artwork: Artwork | undefined): FormattedPrice | undefined {
  return formatPrice(artwork?.price)
}

/**
 * Whether a record carries a price that can be shown.
 *
 * A number on its own is not enough: the currency code is required, and the
 * amount has to survive the same parsing a typed value would.
 */
export function hasUsablePrice(artwork: Artwork): boolean {
  return artworkPrice(artwork) !== undefined
}

/** The amount a draft holds, or undefined when it holds none (or an invalid one). */
export function draftPrice(amount: string, currency: string): ArtworkPrice | undefined {
  const parsed = parsePriceAmount(amount)
  const code = normaliseCurrencyCode(currency)
  if (parsed === undefined || !code) return undefined
  return { amount: parsed, currency: code }
}
