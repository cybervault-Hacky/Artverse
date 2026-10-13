import { useReducer } from 'react'
import { Button } from '@/components/Button/Button'
import { FormField } from '@/components/FormField/FormField'
import { PasswordField } from '@/components/PasswordField/PasswordField'
import { TextLink } from '@/components/TextLink/TextLink'
import { cn } from '@/utils/cn'
import {
  ACCOUNT_CREDENTIAL_WARNING,
  ACCOUNT_SUBMIT_LABELS,
  ACCOUNT_VALIDATED_NOTE,
  accountCrossLinks,
  accountCrossNote,
  accountFields,
  accountFormHasPassword,
  accountFormReducer,
  accountInvalidNote,
  initialAccountState,
  type AccountFormName,
} from '@/utils/account'
import styles from './AccountForm.module.css'

interface AccountFormProps {
  form: AccountFormName
  /**
   * A component the page adds under the form, e.g. its own list of what a real
   * implementation would need. Kept as a slot so each screen can say what is
   * specific to it without this component growing a branch per screen.
   */
  children?: React.ReactNode
  className?: string
}

/**
 * One of the three account previews.
 *
 * The form is the same component for all three screens, driven by the field
 * definitions in `src/utils/account.ts`, so a label, a hint or a validation rule
 * cannot drift between them. What it does and does not do:
 *
 * - **It validates for real.** The action runs the pure validator and reports a
 *   message per field, tied to that field, with typed values kept exactly as
 *   entered. Nothing is checked as you type.
 * - **It does not submit.** There is no request, no storage and no session
 *   anywhere behind it, so a passing check produces `ACCOUNT_VALIDATED_NOTE` —
 *   a statement about a browser-side check — and never a confirmation.
 * - **It asks for a made-up password.** `ACCOUNT_CREDENTIAL_WARNING` sits above
 *   every password field, because the one thing a preview form with no secure
 *   backend must not do is invite a real credential.
 *
 * It also carries no loading state, because nothing here is asynchronous: a
 * spinner would be a claim about a request that never happens.
 */
export function AccountForm({ form, children, className }: AccountFormProps) {
  const [state, dispatch] = useReducer(accountFormReducer, form, initialAccountState)
  const errorCount = Object.keys(state.errors).length
  const passwordFields = accountFormHasPassword(form)

  return (
    <div className={cn(styles.wrapper, className)}>
      {passwordFields ? (
        <p className={styles.warning}>{ACCOUNT_CREDENTIAL_WARNING}</p>
      ) : null}

      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          // The only thing this form can do: run its own check and report it.
          event.preventDefault()
          dispatch({ type: 'check' })
        }}
      >
        {accountFields(form).map((field) => {
          const fieldId = `${form}-${field.name}`
          const value = state.values[field.name]
          const error = state.errors[field.name]

          if (field.type === 'password') {
            return (
              <PasswordField
                key={field.name}
                id={fieldId}
                label={field.label}
                value={value}
                hint={field.hint}
                error={error}
                required={field.required}
                placeholder={field.placeholder}
                autoComplete={field.autocomplete}
                onChange={(next) => dispatch({ type: 'setField', field: field.name, value: next })}
              />
            )
          }

          return (
            <FormField
              key={field.name}
              id={fieldId}
              label={field.label}
              hint={field.hint}
              error={error}
              required={field.required}
            >
              <input
                type={field.type}
                value={value}
                placeholder={field.placeholder}
                autoComplete={field.autocomplete}
                onChange={(event) =>
                  dispatch({ type: 'setField', field: field.name, value: event.target.value })
                }
              />
            </FormField>
          )
        })}

        <div className={styles.actions}>
          <Button type="submit">{ACCOUNT_SUBMIT_LABELS[form]}</Button>
          <Button
            variant="quiet"
            onClick={() => dispatch({ type: 'clear' })}
            disabled={state.values.email === '' && state.values.password === '' && state.values.confirmPassword === '' && state.values.displayName === ''}
          >
            Clear the form
          </Button>
        </div>

        <p className={styles.tabNote}>
          Everything typed here is held in this browser tab until the form is cleared or the page is
          reloaded, and it goes nowhere else.
        </p>
      </form>

      {/*
       * The outcome. There is no success branch because there is nothing to
       * succeed at: the passing message describes a check, not an account.
       */}
      <div className={styles.outcome} role="status" aria-live="polite">
        {state.outcome === 'valid' ? (
          <>
            <p className={styles.outcomeLabel}>The check passed</p>
            <p className={styles.outcomeText}>{ACCOUNT_VALIDATED_NOTE}</p>
          </>
        ) : null}

        {state.outcome === 'invalid' ? (
          <>
            <p className={styles.outcomeLabel}>
              {errorCount === 1 ? 'One field needs attention' : `${errorCount} fields need attention`}
            </p>
            <p className={styles.outcomeText}>{accountInvalidNote(errorCount)}</p>
          </>
        ) : null}
      </div>

      {children}

      <div className={styles.crossLinks}>
        <p className={styles.crossNote}>{accountCrossNote(form)}</p>
        <ul className={styles.crossList}>
          {accountCrossLinks(form).map((link) => (
            <li key={link.to}>
              <TextLink to={link.to}>{link.label}</TextLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
