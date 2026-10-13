import { Button } from '@/components/Button/Button'
import {
  CHECKOUT_PAYMENT_NOTE,
  CHECKOUT_STAGES,
  PLACE_ORDER_BLOCKERS,
  PLACE_ORDER_LABEL,
  PLACE_ORDER_REASON,
  type CheckoutDetails,
  fieldsForStage,
  incompleteStages,
} from '@/utils/checkout'
import styles from './CheckoutReview.module.css'

interface CheckoutReviewProps {
  details: CheckoutDetails
  /** Moves the checkout back to a section, so a field can be corrected. */
  onEdit: (index: number) => void
}

/**
 * The last checkout section, before a payment that does not exist.
 *
 * It does three jobs and refuses a fourth:
 *
 * 1. It reads back what was entered, section by section, with a way to correct
 *    each one — the values themselves are the caller's state, so nothing here
 *    can lose them.
 * 2. It holds the order action, permanently disabled, with its reason attached
 *    by `aria-describedby` rather than sitting in a tooltip nobody can read.
 *
 * What it refuses to do is show a payment form. There is no card field, no
 * wallet and no provider in this build, and a disabled card form would imply one
 * was on its way into the page — so the section describes the payment that will
 * exist instead, and lists what has to be built before it can.
 *
 * The component takes its state through props rather than reading the context,
 * which keeps it a plain function of what it is given — and lets the route
 * verification render it directly and check that the order action really is
 * disabled, rather than trusting the page that mounts it.
 */
export function CheckoutReview({ details, onEdit }: CheckoutReviewProps) {
  const remaining = incompleteStages(details)

  return (
    <div className={styles.review}>
      <h3 className={styles.title}>What you have entered</h3>

      {CHECKOUT_STAGES.filter((stage) => stage.id !== 'review').map((stage) => {
        const index = CHECKOUT_STAGES.findIndex((candidate) => candidate.id === stage.id)

        return (
          <div key={stage.id} className={styles.block}>
            <div className={styles.head}>
              <h4 className={styles.blockTitle}>{stage.label}</h4>
              <Button variant="quiet" size="sm" onClick={() => onEdit(index)}>
                Edit {stage.label.toLowerCase()}
              </Button>
            </div>

            <ul className={styles.list}>
              {fieldsForStage(stage.id).map((field) => (
                <li key={field.name} className={styles.row}>
                  <span className={styles.rowLabel}>{field.label}</span>
                  <span className={styles.rowValue}>
                    {details[field.name].trim() === '' ? 'Not provided' : details[field.name]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      <h3 className={styles.title} id="checkout-payment-heading">
        Payment
      </h3>
      <p className={styles.note}>{CHECKOUT_PAYMENT_NOTE}</p>

      <div className={styles.action}>
        <Button id="place-order" variant="primary" disabled aria-describedby="place-order-reason">
          {PLACE_ORDER_LABEL}
        </Button>
        <p className={styles.reason} id="place-order-reason">
          {PLACE_ORDER_REASON}
        </p>
        <p className={styles.reason}>
          {remaining.length === 0
            ? 'Every section above is complete. The order still cannot be placed, for the reason above.'
            : `Sections still to complete: ${remaining.map((stage) => stage.label).join(', ')}.`}
        </p>
      </div>

      <div className={styles.blockers}>
        <h3 className={styles.title}>What a real checkout needs</h3>
        <p className={styles.note}>
          These are the pieces between this preview and a checkout that can take an order. None of
          them is simulated here.
        </p>
        <ul className={styles.blockerList}>
          {PLACE_ORDER_BLOCKERS.map((blocker) => (
            <li key={blocker} className={styles.blocker}>
              <span className={styles.blockerMarker} aria-hidden="true">
                —
              </span>
              <span>{blocker}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
