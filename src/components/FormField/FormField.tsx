import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './FormField.module.css'

/** The ARIA wiring this component injects into its control. */
type FormControl = ReactElement<{
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}>

interface FormFieldProps {
  /** Ties the label, hint, error and control together. Must be unique per page. */
  id: string
  label: string
  /** Guidance shown before the control — read out as part of its description. */
  hint?: string
  /** The message returned by validation. Its presence marks the field invalid. */
  error?: string
  required?: boolean
  /**
   * Where the label sits relative to the control.
   *
   * `stacked` is the form default: label, hint, then the control. `inline` puts
   * a checkbox or radio and its label on one row, which is the shape those
   * controls need — and it exists here rather than as a second component so the
   * label, hint, error and ARIA wiring stay identical across both.
   */
  layout?: 'stacked' | 'inline'
  /** A single form control. Its `id` and ARIA wiring are supplied here. */
  children: ReactNode
  className?: string
}

/**
 * One labelled field.
 *
 * The label is always tied to its control, the hint and the error are both
 * exposed through `aria-describedby`, and an invalid field is marked
 * `aria-invalid`. A required field carries `aria-required` and says so in its
 * label. The error text is prefixed with a visually hidden “Error:”, so the
 * state is never carried by colour alone.
 *
 * The control is passed in rather than generated, which keeps this component
 * useful for text inputs, textareas, selects — and, if the workspace ever needs
 * one, a date field — without a prop per input type.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  layout = 'stacked',
  children,
  className,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children as FormControl, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        // `required` is stated in the label as well, and read out here: the two
        // together mean neither sight nor a screen reader can miss it — and the
        // form still reports its own messages rather than the browser's.
        'aria-required': required ? true : undefined,
      })
    : children

  const labelElement = (
    <label className={styles.label} htmlFor={id}>
      {label}
      {required ? (
        <>
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
          <span className="visually-hidden"> (required)</span>
        </>
      ) : null}
    </label>
  )

  const errorElement = error ? (
    <p className={styles.error} id={errorId}>
      <span className="visually-hidden">Error: </span>
      {error}
    </p>
  ) : null

  /*
   * The inline layout puts the control first and the label beside it — the
   * order a checkbox is read in — while the association stays the same, because
   * `htmlFor` does not care where on the page the label sits.
   */
  if (layout === 'inline') {
    return (
      <div
        className={cn(styles.field, styles.inline, error && styles.fieldInvalid, className)}
      >
        {control}
        <div className={styles.inlineBody}>
          {labelElement}
          {hint ? (
            <p className={styles.hint} id={hintId}>
              {hint}
            </p>
          ) : null}
        </div>
        {errorElement}
      </div>
    )
  }

  return (
    <div className={cn(styles.field, error && styles.fieldInvalid, className)}>
      {labelElement}

      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}

      {control}

      {errorElement}
    </div>
  )
}
