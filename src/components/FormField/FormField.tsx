import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './FormField.module.css'

/** The ARIA wiring this component injects into its control. */
type FormControl = ReactElement<{
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
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
  /** A single form control. Its `id` and ARIA wiring are supplied here. */
  children: ReactNode
  className?: string
}

/**
 * One labelled field.
 *
 * The label is always tied to its control, the hint and the error are both
 * exposed through `aria-describedby`, and an invalid field is marked
 * `aria-invalid`. The error text is prefixed with a visually hidden “Error:”,
 * so the state is never carried by colour alone.
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
      })
    : children

  return (
    <div className={cn(styles.field, error && styles.fieldInvalid, className)}>
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

      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}

      {control}

      {error ? (
        <p className={styles.error} id={errorId}>
          <span className="visually-hidden">Error: </span>
          {error}
        </p>
      ) : null}
    </div>
  )
}
