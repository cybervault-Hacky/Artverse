/**
 * The account preview model.
 *
 * Phase 11 adds the screens an account would use — sign in, create account,
 * request a password reset — with no account system behind them. That makes the
 * most important rules in this file rules about *absence*, and they are kept
 * here rather than in page copy so all three screens obey the same ones:
 *
 * 1. **Nothing is transmitted, and nothing is stored.** `accountFormReducer` is
 *    the whole state model: it holds what was typed for as long as the page is
 *    mounted and does nothing else with it. There is no storage API, no request,
 *    no cookie and no session anywhere in this module — and no export that could
 *    write a password anywhere.
 * 2. **A password is never checked against anything.** `validateAccountForm`
 *    tests the shape of what was typed — is it long enough, do the two entries
 *    match — and returns messages. It has nothing to compare a credential to,
 *    because no credential exists.
 * 3. **A passing check is not a success.** `accountOutcome('valid')` means the
 *    browser's own validation passed. `ACCOUNT_VALIDATED_NOTE` says exactly that
 *    and no more, so no screen can render a signed-in state, a created account
 *    or a sent email.
 *
 * The password fields carry one instruction above all others: do not type a real
 * password. A preview form with no secure backend must not invite one.
 */
import { NavRoutes } from '@/app/routes'
import { normaliseWhitespace } from '@/utils/text'

export type AccountFormName = 'signIn' | 'create' | 'reset'

export type AccountFieldName =
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'displayName'
  | 'acceptedPreview'

/** Every field any of the three forms can hold. Absent fields stay empty. */
export type AccountFormValues = Record<AccountFieldName, string>

export interface AccountFieldDefinition {
  name: AccountFieldName
  label: string
  type: 'email' | 'password' | 'text' | 'checkbox'
  required: boolean
  /** The other password control this one repeats, for the confirmation rule. */
  pairsWith?: AccountFieldName
  hint?: string
  placeholder?: string
  autocomplete?: string
}

/** The rule this preview applies to a password, and its own words for it. */
export const ACCOUNT_PASSWORD_MIN_LENGTH = 8

export const ACCOUNT_PREVIEW_NOTICE =
  'Preview. ArtVerse has no account system: no sign-in, no session, no cookie, no email and no server behind these fields. What you type is checked in your browser and then dropped — nothing is sent, stored or compared against anything.'

export const ACCOUNT_CREDENTIAL_WARNING =
  'Do not enter a real password. Nothing here is transmitted, stored or verified, and there is no account for it to belong to — use a made-up value so the form can be seen working.'

export const ACCOUNT_NO_SESSION =
  'Nothing about who you are is remembered. A refresh starts the form over, and no screen in this build can tell whether anyone has “signed in” — because nobody can.'

export const ACCOUNT_PASSWORD_HINT =
  `Use a made-up value. At least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters is this preview’s own rule for showing the check working — it is not a security policy, and no policy is applied to it.`

export const ACCOUNT_CONFIRM_HINT =
  'Typed again, so the matching rule can be seen working. Neither entry is kept.'

export const ACCOUNT_EMAIL_HINT =
  'Any address will do. Nothing is sent to it, no message is generated and no account is looked up.'

export const ACCOUNT_DISPLAY_NAME_HINT =
  'The name a profile would carry. It is not saved, and no profile is created.'

export const ACCOUNT_NO_EMAIL_NOTE =
  'No email will be sent, no reset link will be generated and no password can be changed: the fields are here so the request screen can be reviewed.'

export const ACCOUNT_VALIDATED_NOTE =
  'Every field in this preview checks out. Nothing was sent anywhere — the check ran in your browser and stopped there, and no session, account or message was created.'

export function accountInvalidNote(count: number): string {
  return `${count === 1 ? 'One field still needs' : `${count} fields still need`} attention. Nothing was sent, and nothing will be — there is no account system behind this form.`
}

/** What a real sign-in would need, stated where the preview stops. */
export const SIGN_IN_BLOCKERS: string[] = [
  'A server that can check a credential without ever storing it in the clear.',
  'Password hashing and a stored verifier — which means an accounts table that does not exist.',
  'A session or a token, and a cookie policy to go with it.',
  'Email verification, so an address on a record is one somebody can actually receive.',
  'A way to lock, revoke and recover an account, and somebody responsible for that.',
  'A privacy notice and a data-retention rule, because an account holds personal data.',
]

/** What creating an account would need, over and above a sign-in. */
export const CREATE_ACCOUNT_BLOCKERS: string[] = [
  'The same accounts table and credential handling a sign-in needs.',
  'A unique-address rule, so one email cannot quietly hold two accounts.',
  'A confirmation email — and a mail service able to send it.',
  'A password policy that is actually enforced, rather than a preview’s shape check.',
  'A route for somebody who cannot get into their own account.',
]

/**
 * The fields each form shows, in order.
 *
 * The sign-in form deliberately has no confirmation field and the reset form has
 * no password field at all: a reset request asks for an address and nothing
 * else, and a screen that asked for a new password before any email could be
 * sent would be pretending to a workflow that does not exist.
 */
export const ACCOUNT_FORMS: Record<AccountFormName, AccountFieldDefinition[]> = {
  signIn: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      hint: ACCOUNT_EMAIL_HINT,
      placeholder: 'name@example.com',
      autocomplete: 'off',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      hint: ACCOUNT_PASSWORD_HINT,
      placeholder: 'A made-up value',
      autocomplete: 'off',
    },
  ],
  create: [
    {
      name: 'displayName',
      label: 'Name',
      type: 'text',
      required: true,
      hint: ACCOUNT_DISPLAY_NAME_HINT,
      autocomplete: 'off',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      hint: ACCOUNT_EMAIL_HINT,
      placeholder: 'name@example.com',
      autocomplete: 'off',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      hint: ACCOUNT_PASSWORD_HINT,
      placeholder: 'A made-up value',
      autocomplete: 'off',
    },
    {
      name: 'confirmPassword',
      label: 'Password again',
      type: 'password',
      required: true,
      // Declared here, on the field that repeats the other one: the mismatch is
      // reported where the second entry was typed.
      pairsWith: 'password',
      hint: ACCOUNT_CONFIRM_HINT,
      placeholder: 'The same made-up value',
      autocomplete: 'off',
    },
  ],
  reset: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      hint: ACCOUNT_EMAIL_HINT,
      placeholder: 'name@example.com',
      autocomplete: 'off',
    },
  ],
}

export function accountFields(form: AccountFormName): AccountFieldDefinition[] {
  return ACCOUNT_FORMS[form]
}

export function emptyAccountForm(): AccountFormValues {
  return {
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptedPreview: '',
  }
}

/** Whether a form shows a password field at all — the reset request does not. */
export function accountFormHasPassword(form: AccountFormName): boolean {
  return accountFields(form).some((field) => field.type === 'password')
}

export type AccountErrors = Partial<Record<AccountFieldName, string>>

/*
 * The messages, written out rather than generated from a label: “Enter Email.”
 * is not a sentence, and a message nobody can read is not validation.
 */
const REQUIRED_MESSAGES: Partial<Record<AccountFieldName, string>> = {
  email: 'Enter an email address in the form name@example.com.',
  password: `Enter a made-up password of at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters.`,
  confirmPassword: 'Enter the same made-up password again.',
  displayName: 'Enter the name a profile would carry.',
}

/**
 * The whole check, for one of the three forms.
 *
 * Shape only: an address that looks like an address, two password entries that
 * match, and a length. Nothing here can reach a credential, because none exists.
 */
export function validateAccountForm(
  form: AccountFormName,
  values: AccountFormValues,
): AccountErrors {
  const errors: AccountErrors = {}

  for (const field of accountFields(form)) {
    const value = normaliseWhitespace(values[field.name] ?? '')

    if (value === '') {
      if (field.required) errors[field.name] = REQUIRED_MESSAGES[field.name]
      continue
    }

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      errors[field.name] = 'Enter an email address in the form name@example.com.'
    }

    if (field.type === 'text' && value.length < 2) {
      errors[field.name] = 'Use at least two characters.'
    }

    /*
     * A typed password is never trimmed before it is measured: spaces are
     * ordinary characters in one, and silently ignoring them would be the sort of
     * shaping this module exists to avoid.
     */
    if (field.type === 'password') {
      const typed = values[field.name] ?? ''
      if (typed.length < ACCOUNT_PASSWORD_MIN_LENGTH) {
        errors[field.name] = `Use at least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters. This preview asks for no more than that, and applies no other rule.`
      }
    }
  }

  // Two entries that do not match are reported on the second, where the mistake
  // was made — never by clearing or keeping either value.
  const confirmField = accountFields(form).find((field) => field.pairsWith)
  if (confirmField?.pairsWith) {
    const first = values[confirmField.pairsWith] ?? ''
    const second = values[confirmField.name] ?? ''
    if (first !== '' && second !== '' && first !== second) {
      errors[confirmField.name] = 'The two entries do not match. Nothing was sent, so nothing was lost — retype either one.'
    }
  }

  return errors
}

export type AccountOutcome = 'none' | 'invalid' | 'valid'

export interface AccountFormState {
  form: AccountFormName
  values: AccountFormValues
  /** Only ever the result of an explicit check, minus any field since edited. */
  errors: AccountErrors
  /** Whether a check has run on what is currently typed. */
  checked: boolean
  /**
   * The result of that check. There is deliberately no `success`: the model has
   * no state that could mean signed in, created or sent.
   */
  outcome: AccountOutcome
}

export type AccountAction =
  | { type: 'setField'; field: AccountFieldName; value: string }
  | { type: 'check' }
  | { type: 'clear' }

export function initialAccountState(form: AccountFormName): AccountFormState {
  return { form, values: emptyAccountForm(), errors: {}, checked: false, outcome: 'none' }
}

/**
 * The edit model, in full.
 *
 * Editing any field drops that field's error and clears the last verdict, so a
 * passing check is never left standing over a form that then changed. `clear`
 * empties every value at once — the one honest “reset” this build has, and it
 * throws away exactly as much as a refresh would.
 */
export function accountFormReducer(
  state: AccountFormState,
  action: AccountAction,
): AccountFormState {
  switch (action.type) {
    case 'setField': {
      const errors = { ...state.errors }
      delete errors[action.field]
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors,
        checked: false,
        outcome: 'none',
      }
    }

    case 'check': {
      const errors = validateAccountForm(state.form, state.values)
      return {
        ...state,
        errors,
        checked: true,
        outcome: Object.keys(errors).length > 0 ? 'invalid' : 'valid',
      }
    }

    case 'clear':
      return { ...initialAccountState(state.form) }

    default:
      return state
  }
}

/**
 * Whether a password is shown as typed.
 *
 * The toggle changes the input's type and nothing else — the value is untouched,
 * and the control always announces which way round it is.
 */
export function passwordInputType(visible: boolean): 'text' | 'password' {
  return visible ? 'text' : 'password'
}

export function passwordToggleLabel(visible: boolean): string {
  return visible ? 'Hide password' : 'Show password'
}

/** The page title each form carries, used for the heading and the document title. */
export const ACCOUNT_FORM_TITLES: Record<AccountFormName, string> = {
  signIn: 'Sign in preview',
  create: 'Create account preview',
  reset: 'Password reset preview',
}

/**
 * What each form's action says.
 *
 * Not “Sign in” and not “Create account”: a button is a promise about what will
 * happen when it is pressed, and all of these do one thing — run the preview's
 * own check in the browser.
 */
export const ACCOUNT_SUBMIT_LABELS: Record<AccountFormName, string> = {
  signIn: 'Check these details',
  create: 'Check this form',
  reset: 'Check this request',
}

export interface AccountCrossLink {
  label: string
  to: string
}

/**
 * The links between the three screens.
 *
 * Every label carries the word *preview*, including the ones in the site footer:
 * a link is a promise too, and “Sign in” on its own would promise an account
 * system this build does not have.
 */
export function accountCrossLinks(form: AccountFormName): AccountCrossLink[] {
  const links: Record<AccountFormName, AccountCrossLink[]> = {
    signIn: [
      { label: 'Create account preview', to: NavRoutes.createAccount },
      { label: 'Password reset preview', to: NavRoutes.resetPassword },
    ],
    create: [
      { label: 'Sign in preview', to: NavRoutes.signIn },
      { label: 'Password reset preview', to: NavRoutes.resetPassword },
    ],
    reset: [
      { label: 'Sign in preview', to: NavRoutes.signIn },
      { label: 'Create account preview', to: NavRoutes.createAccount },
    ],
  }

  return links[form]
}

/** The sentence above the cross-links, which differ per screen. */
export function accountCrossNote(form: AccountFormName): string {
  if (form === 'create') {
    return 'Already have an account? There are no accounts, so there is nothing to have — but the other two screens can be reviewed the same way.'
  }
  if (form === 'reset') {
    return 'Remembered a made-up value? Neither of the other screens can get you anywhere, and neither can this one.'
  }
  return 'No account is needed to browse ArtVerse, and none can be created here yet.'
}
