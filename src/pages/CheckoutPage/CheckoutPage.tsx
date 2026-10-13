import { useReducer } from 'react'
import { NavRoutes } from '@/app/routes'
import { useBuyerState } from '@/app/buyerState'
import { Button } from '@/components/Button/Button'
import { CartLine } from '@/components/CartLine/CartLine'
import { CheckoutReview } from '@/components/CheckoutReview/CheckoutReview'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { FormField } from '@/components/FormField/FormField'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PriceLine } from '@/components/PriceLine/PriceLine'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import {
  cartArtworks,
  cartTotal,
  CHECKOUT_EMPTY_TEXT,
  CHECKOUT_EMPTY_TITLE,
} from '@/utils/buyerJourney'
import {
  CHECKOUT_DETAILS_NOTE,
  CHECKOUT_PREVIEW_NOTICE,
  CHECKOUT_STAGES,
  checkoutDeliveryNote,
  checkoutReducer,
  fieldsForStage,
  initialCheckoutState,
} from '@/utils/checkout'
import styles from './CheckoutPage.module.css'

/**
 * The checkout, as a preview.
 *
 * Three sections in the order a real checkout asks for them — contact, delivery,
 * then a review where the order would be confirmed. Three things are deliberate:
 *
 * 1. **Nothing is submitted, and the model says so.** `checkoutReducer` has no
 *    state for a placed, confirmed or paid order, so no screen can render one.
 *    The action at the end of the review step is permanently disabled and carries
 *    its reason in the markup, connected to the button with `aria-describedby`.
 * 2. **Validation is real.** Sections open in order; continuing runs the pure
 *    validator and reports a message per field, tied to that field. Values are
 *    never thrown away — the whole form lives in one object, so moving between
 *    sections and back leaves every entry exactly as typed.
 * 3. **No payment surface exists.** There is no card field, no wallet address and
 *    no provider, and the review step states that plainly instead of showing a
 *    disabled card form, which would imply one was coming into this build.
 *
 * The order summary beside the sections is the cart's own model: each line is a
 * `CartLine` and the total is whatever `cartTotal` can honestly say — which, for
 * this catalogue, is that no work carries a price.
 */
export function CheckoutPage() {
  const { state: buyerState } = useBuyerState()
  const items = cartArtworks(buyerState)
  const total = cartTotal(items)

  const [state, dispatch] = useReducer(checkoutReducer, undefined, initialCheckoutState)

  const stage = CHECKOUT_STAGES[state.stageIndex]
  const isLastStage = state.stageIndex === CHECKOUT_STAGES.length - 1
  const digitalTitles = items
    .filter((artwork) => artwork.category === 'digital')
    .map((artwork) => artwork.title)
  const errorCount = Object.keys(state.errors).length

  useDocumentTitle({
    title: 'Checkout',
    description:
      'The ArtVerse checkout preview: the sections a real checkout would ask for, with a disabled order action and no payment anywhere in the build.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Buying"
        title="Checkout"
        intro="A preview of the sections a checkout will use. Fill them in to see how the flow works — nothing is sent anywhere, no payment is taken, and an order cannot be placed."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Cart', to: NavRoutes.cart },
          { label: 'Checkout' },
        ]}
      />

      <PreviewNotice label="Preview">{CHECKOUT_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="checkout-heading">
        <PageContainer>
          {items.length === 0 ? (
            <EmptyState
              title={CHECKOUT_EMPTY_TITLE}
              description={CHECKOUT_EMPTY_TEXT}
              headingLevel="h2"
              action={
                <div className={styles.emptyActions}>
                  <Button to={NavRoutes.discover}>Explore Art</Button>
                  <Button to={NavRoutes.cart} variant="quiet">
                    Back to the cart
                  </Button>
                </div>
              }
            />
          ) : (
            <div className={styles.layout}>
              <div className={styles.sections}>
                <p className={styles.stepLine}>
                  Step {state.stageIndex + 1} of {CHECKOUT_STAGES.length}
                </p>
                <h2 className={styles.stageTitle} id="checkout-heading">
                  {stage.label}
                </h2>
                <p className={styles.stageDescription}>{stage.description}</p>

                <ol className={styles.steps} aria-label="Checkout sections">
                  {CHECKOUT_STAGES.map((entry, index) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={styles.step}
                        aria-current={index === state.stageIndex ? 'step' : undefined}
                        disabled={index > state.furthestIndex}
                        onClick={() => dispatch({ type: 'goToStage', index })}
                      >
                        <span className="visually-hidden">
                          Section {index + 1} of {CHECKOUT_STAGES.length}:{' '}
                        </span>
                        {entry.label}
                      </button>
                    </li>
                  ))}
                </ol>

                {state.checked && errorCount > 0 ? (
                  <p className={styles.errorSummary} role="status">
                    {countLabel(errorCount, 'field')} still to complete in this section. Nothing has
                    been sent, and nothing will be until there is somewhere for it to go.
                  </p>
                ) : null}

                {stage.id === 'review' ? (
                  <CheckoutReview
                    details={state.details}
                    onEdit={(index) => dispatch({ type: 'goToStage', index })}
                  />
                ) : (
                  <div className={styles.fields}>
                    {stage.id === 'delivery' ? (
                      <p className={styles.deliveryNote}>{checkoutDeliveryNote(digitalTitles)}</p>
                    ) : null}

                    {fieldsForStage(stage.id).map((field) => (
                      <FormField
                        key={field.name}
                        id={`checkout-${field.name}`}
                        label={field.label}
                        hint={field.hint}
                        required={field.required}
                        error={state.errors[field.name]}
                      >
                        <input
                          type={field.kind}
                          value={state.details[field.name]}
                          placeholder={field.placeholder}
                          autoComplete={field.autocomplete}
                          onChange={(event) =>
                            dispatch({
                              type: 'setField',
                              field: field.name,
                              value: event.target.value,
                            })
                          }
                        />
                      </FormField>
                    ))}
                  </div>
                )}

                <div className={styles.controls}>
                  {state.stageIndex > 0 ? (
                    <Button variant="quiet" onClick={() => dispatch({ type: 'back' })}>
                      Back to {CHECKOUT_STAGES[state.stageIndex - 1].label.toLowerCase()}
                    </Button>
                  ) : null}

                  {isLastStage ? null : (
                    <Button onClick={() => dispatch({ type: 'continue' })}>
                      Continue to {CHECKOUT_STAGES[state.stageIndex + 1].label.toLowerCase()}
                    </Button>
                  )}
                </div>

                <p className={styles.tabNote}>{CHECKOUT_DETAILS_NOTE}</p>
              </div>

              <aside className={styles.summary} aria-labelledby="order-summary-heading">
                <h2 className={styles.summaryTitle} id="order-summary-heading">
                  Order summary
                </h2>

                <ul className={styles.summaryList}>
                  {items.map((artwork) => (
                    <CartLine key={artwork.id} artwork={artwork} variant="summary" />
                  ))}
                </ul>

                <h3 className={styles.summaryTotal} id="order-total-heading">
                  {total.heading}
                </h3>

                {total.groups.map((group) => (
                  <div key={group.code} className={styles.group}>
                    <PriceLine price={group.subtotal} />
                  </div>
                ))}

                <p className={styles.summaryMessage}>{total.message}</p>
                <p className={styles.summaryNote}>
                  No shipping, tax, discount or fee is added here, because ArtVerse has no rule for
                  any of them — and no address you type changes a figure on this page.
                </p>

                <TextLink to={NavRoutes.cart}>Back to the cart</TextLink>
              </aside>
            </div>
          )}
        </PageContainer>
      </Section>
    </>
  )
}
