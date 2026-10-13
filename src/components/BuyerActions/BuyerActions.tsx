import { useBuyerState } from '@/app/buyerState'
import { Button } from '@/components/Button/Button'
import { TextLink } from '@/components/TextLink/TextLink'
import { NavRoutes } from '@/app/routes'
import { cn } from '@/utils/cn'
import { isInCart, isSaved } from '@/utils/buyerJourney'
import styles from './BuyerActions.module.css'

interface WishlistButtonProps {
  artworkId: string
  /** Visible text when the work is not saved. */
  label?: string
  /** Visible text when it is. */
  savedLabel?: string
  /**
   * Accessible name, which stays the same whatever the state: “Save”, plus the
   * work where the control sits in a grid of them. The visible label shortens to
   * “Saved” when the work is in the list; `aria-pressed` is what announces that,
   * so the name a screen reader hears never changes under the reader's feet.
   */
  ariaLabel?: string
  className?: string
}

/**
 * The save control.
 *
 * A toggle, not a bookmark-and-forget: it carries `aria-pressed`, and its label
 * changes from “Save” to “Saved” so the state is never carried by colour alone.
 * Saving twice changes nothing — the reducer is idempotent — and nothing about a
 * save is stored anywhere, which is why the copy around it says the list lives
 * in this tab.
 */
export function WishlistButton({
  artworkId,
  label = 'Save',
  savedLabel = 'Saved',
  ariaLabel,
  className,
}: WishlistButtonProps) {
  const { state, dispatch } = useBuyerState()
  const saved = isSaved(state, artworkId)

  return (
    <button
      type="button"
      className={cn(styles.toggle, saved && styles.toggleOn, className)}
      aria-pressed={saved}
      aria-label={ariaLabel ?? label}
      onClick={() => dispatch({ type: 'toggleSaved', artworkId })}
    >
      {saved ? savedLabel : label}
    </button>
  )
}

interface CartActionProps {
  artworkId: string
  /** How the “already in the cart” line reads. */
  className?: string
}

/**
 * The add-to-cart control.
 *
 * Once a work is in the cart the button is replaced by a statement and a link to
 * the cart, so the cart is never a hidden part of the page and the same work
 * cannot appear to be added twice.
 */
export function CartAction({ artworkId, className }: CartActionProps) {
  const { state, dispatch } = useBuyerState()
  const inCart = isInCart(state, artworkId)

  if (inCart) {
    return (
      <p className={cn(styles.inCart, className)}>
        <span className={styles.inCartText}>This work is in your cart.</span>
        <TextLink to={NavRoutes.cart}>View cart</TextLink>
      </p>
    )
  }

  return (
    <Button
      className={className}
      variant="secondary"
      onClick={() => dispatch({ type: 'addToCart', artworkId })}
    >
      Add to cart
    </Button>
  )
}
