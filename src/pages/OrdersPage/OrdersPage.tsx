import { Link } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { useBuyerState } from '@/app/buyerState'
import { Button } from '@/components/Button/Button'
import { CartLine } from '@/components/CartLine/CartLine'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cartArtworks } from '@/utils/buyerJourney'
import {
  ORDERS_EMPTY_TEXT,
  ORDERS_EMPTY_TITLE,
  ORDERS_PREVIEW_NOTICE,
  ORDER_STRUCTURE_NOTICE,
  orderStructure,
  orderStructureArtwork,
} from '@/utils/orders'
import styles from './OrdersPage.module.css'

/**
 * Orders.
 *
 * There is no account and no order store, so this page cannot show an order. It
 * shows two things instead, and is careful about both:
 *
 * 1. **The true empty state.** No account holds an order, no checkout can create
 *    one, and the page says so in the state a real orders page would use — not as
 *    a footnote under a fake one.
 * 2. **A structure preview.** One card, built around a real sample record so its
 *    link resolves, showing the fields an order record will carry: a reference, a
 *    date, a status, a payment line and a despatch line. Reference, date and
 *    despatch are bracketed placeholders that nothing generates; status and
 *    payment are the only accurate values in this build — no order placed, no
 *    payment taken. The card is labelled as a structure on its face, with a
 *    `StatusTag`, so it cannot be mistaken for a purchase.
 *
 * No figures, dates, tracking numbers or seller payouts appear anywhere on it.
 */
export function OrdersPage() {
  const { state } = useBuyerState()
  const items = cartArtworks(state)
  const fields = orderStructure()
  const artwork = orderStructureArtwork()

  useDocumentTitle({
    title: 'Orders',
    description:
      'The ArtVerse orders page: the true empty state, and one labelled structure preview of the fields an order record will carry once orders exist.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Buying"
        title="Orders"
        intro="Where your orders will live once there is a checkout that can place one. Until then this page reports the truth: there are none, and none can be created."
        crumbs={[{ label: 'Home', to: NavRoutes.home }, { label: 'Orders' }]}
      />

      <PreviewNotice label="Preview">{ORDERS_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="orders-empty-heading">
        <PageContainer>
          <EmptyState
            title={ORDERS_EMPTY_TITLE}
            headingLevel="h2"
            description={ORDERS_EMPTY_TEXT}
            action={
              <div className={styles.emptyActions}>
                <Button to={NavRoutes.discover}>Explore Art</Button>
                <Button to={NavRoutes.cart} variant="quiet">
                  Your cart
                </Button>
              </div>
            }
          />

          {items.length > 0 ? (
            <div className={styles.cartContext}>
              <h2 className={styles.cartContextTitle} id="orders-cart-heading">
                What is in your cart
              </h2>
              <p className={styles.cartContextNote}>
                These works are in the cart, not in an order. Nothing moves them from one to the
                other, because no checkout can place an order.
              </p>
              <ul className={styles.cartContextList}>
                {items.map((entry) => (
                  <CartLine key={entry.id} artwork={entry} variant="summary" />
                ))}
              </ul>
            </div>
          ) : null}
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="order-structure-heading">
        <PageContainer>
          <SectionHeading
            eyebrow="Structure"
            title="What an order record will hold"
            id="order-structure-heading"
            description="One card, shown with a real sample record so the link below resolves. It is a shape, not a purchase: every invented field is marked as a placeholder on the row itself."
          />

          <article className={styles.card} aria-labelledby="order-sample-title">
            <div className={styles.cardHead}>
              <div>
                <p className={styles.cardLabel}>Demonstration data</p>
                <h3 className={styles.cardTitle} id="order-sample-title">
                  A sample order card
                </h3>
              </div>
              <StatusTag tone="accent">Not a real order</StatusTag>
            </div>

            <p className={styles.cardNotice}>{ORDER_STRUCTURE_NOTICE}</p>

            {artwork ? (
              <div className={styles.cardWork}>
                <p className={styles.cardWorkLabel}>The work it points at</p>
                <p className={styles.cardWorkTitle}>
                  <Link className={styles.cardWorkLink} to={NavRoutes.artwork(artwork.id)}>
                    {artwork.title}
                  </Link>
                </p>
                <p className={styles.cardWorkMeta}>
                  Illustrative sample record · {artwork.medium}
                </p>
              </div>
            ) : null}

            <dl className={styles.rows}>
              {fields.map((field) => (
                <div key={field.label} className={styles.row}>
                  <dt className={styles.rowLabel}>{field.label}</dt>
                  <dd className={styles.rowValue}>
                    <span className={field.placeholder ? styles.placeholder : styles.fact}>
                      {field.value}
                    </span>
                    <span className={styles.rowNote}>{field.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <PhaseNote
            phase="Phase 11"
            title="What a real order would need"
            description="Order records are the part of the plan this page is drawn from. None of it exists, so nothing here is simulated."
            items={[
              'Order records on a server, with a reference a person can quote.',
              'A status that means something — confirmed, despatched, delivered — set by real events.',
              'Carrier and tracking information supplied by a seller, never invented by the site.',
              'Payment records from a payment provider, for orders that were actually paid.',
              'Despatch and returns rules that apply to the countries being sold into.',
              'Seller payouts, which belong to the studios that sold the work and not to this page.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
