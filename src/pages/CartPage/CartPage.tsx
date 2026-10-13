import { useMemo } from 'react'
import { NavRoutes } from '@/app/routes'
import { useBuyerState } from '@/app/buyerState'
import { Button } from '@/components/Button/Button'
import { CartLine } from '@/components/CartLine/CartLine'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { PriceLine } from '@/components/PriceLine/PriceLine'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import {
  BUYER_STATE_NOTE,
  CART_EMPTY_TEXT,
  CART_EMPTY_TITLE,
  cartArtworks,
  cartTotal,
} from '@/utils/buyerJourney'
import { PRICE_NOT_PURCHASABLE } from '@/utils/pricing'
import styles from './CartPage.module.css'

/**
 * The cart.
 *
 * A cart is where a marketplace is most tempted to lie: a subtotal that quietly
 * assumes a currency, a shipping line invented to look complete, a “reserved for
 * you” that holds nothing. This one is built the other way round.
 *
 * - Every line shows the record's own fields — its image, title, discipline,
 *   medium and the studio it is attributed to — and its price only where a price
 *   exists. Where it does not, the line carries the same “no price has been
 *   provided” sentence the artwork page uses.
 * - The total is computed by `cartTotal`, which returns a named state rather
 *   than a number: an empty cart, a cart with no prices, a cart with some priced
 *   works and a cart priced in more than one currency each get their own honest
 *   sentence. A single figure appears only when every work is priced in one
 *   currency, and even then it is labelled a subtotal with no shipping, tax,
 *   discount or fee added.
 * - The checkout link leads to a preview that cannot place an order, and the
 *   page says so where the link is rather than on the far side of a click.
 */
export function CartPage() {
  const { state, dispatch } = useBuyerState()
  const items = cartArtworks(state)
  const total = useMemo(() => cartTotal(items), [items])

  useDocumentTitle({
    title: 'Cart',
    description:
      'Works collected in the ArtVerse cart, with a total only where every work carries a price in a single currency. The cart is held in this browser tab and nothing in it can be bought.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Buying"
        title="Your cart"
        intro="Works you have collected while browsing. The cart is a list to think with: nothing in it is reserved, and no payment can be made."
        crumbs={[{ label: 'Home', to: NavRoutes.home }, { label: 'Cart' }]}
        actions={
          items.length > 0 ? (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => dispatch({ type: 'emptyCart' })}
            >
              Empty the cart
            </Button>
          ) : null
        }
      />

      <PreviewNotice label="Local to this tab">{BUYER_STATE_NOTE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="cart-heading">
        <PageContainer>
          {items.length === 0 ? (
            <EmptyState
              title={CART_EMPTY_TITLE}
              description={CART_EMPTY_TEXT}
              headingLevel="h2"
              action={
                <div className={styles.emptyActions}>
                  <Button to={NavRoutes.discover}>Explore Art</Button>
                  <Button to={NavRoutes.wishlist} variant="quiet">
                    Saved works
                  </Button>
                </div>
              }
            />
          ) : (
            <div className={styles.layout}>
              <div className={styles.items}>
                <h2 className={styles.itemsTitle} id="cart-heading">
                  {countLabel(items.length, 'work')} in the cart
                </h2>

                <ul className={styles.list}>
                  {items.map((artwork) => (
                    <CartLine
                      key={artwork.id}
                      artwork={artwork}
                      onRemove={() => dispatch({ type: 'removeFromCart', artworkId: artwork.id })}
                    />
                  ))}
                </ul>

                <p className={styles.note}>
                  A work is a single object, so the cart holds one of each and there is no quantity
                  to set. Removing a line takes the work out of the cart and changes nothing about
                  the record itself.
                </p>
              </div>

              <aside className={styles.summary} aria-labelledby="cart-total-heading">
                <h2 className={styles.summaryTitle} id="cart-total-heading">
                  {total.heading}
                </h2>

                {total.groups.map((group) => (
                  <div key={group.code} className={styles.group}>
                    <PriceLine price={group.subtotal} />
                    <p className={styles.groupNote}>
                      {group.count === 1
                        ? '1 work priced in this currency'
                        : `${group.count} works priced in this currency`}
                      {total.groups.length > 1 ? ' — kept apart, never added to another currency' : ''}
                    </p>
                  </div>
                ))}

                <p className={styles.summaryMessage}>{total.message}</p>

                <div className={styles.summaryActions}>
                  <Button to={NavRoutes.checkout} variant="secondary" block>
                    Continue to checkout preview
                  </Button>
                  <p className={styles.summaryNote}>
                    The next screen is a preview of the checkout: it asks for the details a real
                    one would, and it cannot take a payment or place an order.
                  </p>
                </div>

                <p className={styles.summaryFoot}>{PRICE_NOT_PURCHASABLE}</p>

                <TextLink to={NavRoutes.orders}>What an order would look like</TextLink>
              </aside>
            </div>
          )}
        </PageContainer>
      </Section>
    </>
  )
}
