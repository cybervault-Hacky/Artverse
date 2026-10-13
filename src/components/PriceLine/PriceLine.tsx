import { cn } from '@/utils/cn'
import type { FormattedPrice } from '@/utils/pricing'
import styles from './PriceLine.module.css'

export interface PriceLineProps {
  /** A price that has already been through `formatPrice` — never a raw number. */
  price: FormattedPrice
  /** One quiet line under the amount, e.g. why the price is shown at all. */
  note?: string
  className?: string
}

/**
 * An amount and its currency code.
 *
 * The component is deliberately narrow: it cannot be handed a bare number, so
 * there is no way to render an amount whose currency was forgotten. The code is
 * always visible — `USD 2,400` rather than `$2,400` — because a symbol alone is
 * ambiguous and this build never converts between currencies.
 *
 * Nothing here is a control. There is no basket, no enquiry button and no
 * “buy”, and the note is where a caller states that, so a price can be shown
 * without anything about it being clickable.
 */
export function PriceLine({ price, note, className }: PriceLineProps) {
  return (
    <span className={cn(styles.line, className)}>
      <span className={styles.amount}>
        {price.text}
        {/* Read aloud with the currency's name where the runtime supplies one. */}
        {price.name ? <span className="visually-hidden"> ({price.name})</span> : null}
      </span>
      {note ? <span className={styles.note}>{note}</span> : null}
    </span>
  )
}
