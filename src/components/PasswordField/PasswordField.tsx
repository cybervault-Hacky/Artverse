import { useId, useState } from 'react'
import { FormField } from '@/components/FormField/FormField'
import { cn } from '@/utils/cn'
import { passwordInputType, passwordToggleLabel } from '@/utils/account'
import styles from './PasswordField.module.css'

interface PasswordFieldProps {
  /** Ties the label, hint, error and control together. Must be unique per page. */
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  /**
   * Forwarded to the control. Every account preview passes `off`, because a
   * browser offering to save a credential for a form with no account behind it
   * would be exactly the wrong memory.
   */
  autoComplete?: string
  className?: string
}

/**
 * A password field, with a control for reading it back.
 *
 * Two decisions:
 *
 * 1. **The value never leaves the field.** The input is controlled by the page's
 *    own reducer state and nothing else — no storage, no request, no logging —
 *    and this component keeps only one piece of its own state: whether the value
 *    is currently visible. Showing it re-renders the input as text; it does not
 *    copy, cache or keep it anywhere else.
 * 2. **The control always says what it will do.** It carries `aria-pressed` and
 *    a label that changes from “Show password” to “Hide password”, so the state
 *    is announced rather than carried by the shape of the glyph. It is connected
 *    to the input with `aria-controls`, so a reader can tell which field it acts
 *    on when a page holds two.
 *
 * The field itself is the shared `FormField`, so its label, hint, error and ARIA
 * wiring are identical to every other field in ArtVerse.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  required = false,
  placeholder,
  autoComplete,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const describedById = useId()

  return (
    <div className={cn(styles.password, className)}>
      <FormField id={id} label={label} hint={hint} error={error} required={required}>
        <input
          type={passwordInputType(visible)}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      </FormField>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={visible}
          aria-controls={id}
          aria-describedby={describedById}
          onClick={() => setVisible((current) => !current)}
        >
          {passwordToggleLabel(visible)}
        </button>
        <p className={styles.note} id={describedById}>
          {visible
            ? 'The value is shown as ordinary text in this field only. It is still typed nowhere but your browser.'
            : 'Showing the value changes nothing about where it goes: it stays in this tab, and is never sent or stored.'}
        </p>
      </div>
    </div>
  )
}
