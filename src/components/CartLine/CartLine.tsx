import { Link } from 'react-router-dom'
import type { Artwork } from '@/types'
import { NavRoutes } from '@/app/routes'
import { categoryLabel, getCreatorForArtwork } from '@/data'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { Button } from '@/components/Button/Button'
import { PriceLine } from '@/components/PriceLine/PriceLine'
import { TextLink } from '@/components/TextLink/TextLink'
import { cn } from '@/utils/cn'
import { PRICE_NOT_PROVIDED, artworkPrice } from '@/utils/pricing'
import styles from './CartLine.module.css'

interface CartLineProps {
  artwork: Artwork
  /**
   * Removes the work. Omitted in the checkout summary, where the line is a
   * reading of the cart rather than a place to edit it.
   */
  onRemove?: () => void
  /**
   * `full` is the cart row: a small frame, the record's own details and the
   * remove action. `summary` is the same line without the frame or the action,
   * for the narrow column beside the checkout sections.
   */
  variant?: 'full' | 'summary'
  className?: string
}

/**
 * One work in the cart.
 *
 * A list item — it belongs inside a `ul` — showing only what the catalogue
 * holds: the work's own image and title, its discipline and medium, the studio
 * record it is attributed to, and its price where a price exists. Where it does
 * not, the line says so with the same sentence the artwork page uses, so a
 * missing price reads the same everywhere.
 *
 * There is no quantity control. A work is a single object and the cart holds one
 * of each, so a stepper would be a control that could not honestly do anything.
 */
export function CartLine({ artwork, onRemove, variant = 'full', className }: CartLineProps) {
  const creator = getCreatorForArtwork(artwork)
  const price = artworkPrice(artwork)
  const summary = variant === 'summary'

  return (
    <li className={cn(styles.line, summary && styles.summary, className)}>
      {summary ? null : (
        <ArtworkFrame
          className={styles.frame}
          src={artwork.image.src}
          alt={artwork.image.alt}
          width={artwork.image.width}
          height={artwork.image.height}
          aspect="portrait"
          radius="sm"
          sizes="(max-width: 599px) 30vw, 7rem"
        />
      )}

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link className={styles.titleLink} to={NavRoutes.artwork(artwork.id)}>
            {artwork.title}
          </Link>
        </h3>

        <p className={styles.meta}>
          {categoryLabel(artwork.category)} · {artwork.medium}
        </p>

        <p className={styles.studio}>
          <span className={styles.studioLabel}>Studio</span>{' '}
          {creator ? (
            <TextLink to={NavRoutes.artist(creator.id)}>{creator.name}</TextLink>
          ) : (
            <span className={styles.studioAbsent}>not recorded for this work</span>
          )}
        </p>

        <div className={styles.price}>
          {price ? (
            <PriceLine price={price} />
          ) : (
            <span className={styles.priceAbsent}>{PRICE_NOT_PROVIDED}</span>
          )}
        </div>
      </div>

      {onRemove ? (
        <div className={styles.actions}>
          <Button
            variant="quiet"
            size="sm"
            onClick={onRemove}
            aria-label={`Remove ${artwork.title} from the cart`}
          >
            Remove
          </Button>
        </div>
      ) : null}
    </li>
  )
}
