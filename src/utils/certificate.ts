/**
 * The seller certificate preview, as a model.
 *
 * A certificate is a document that makes a claim about a person, so the wording
 * is decided here — once, in one place — rather than being typed into a
 * component where it could drift:
 *
 * 1. **Nothing has been issued.** The status is `Preview — Not Issued` and stays
 *    that way: it is not a field, it cannot be edited, and no code path sets it
 *    to anything else.
 * 2. **Nothing is invented.** The certificate ID and the issue date are
 *    placeholders and only ever placeholders. This build has no way to assign an
 *    identifier or to know a date, so no value is generated, defaulted or
 *    guessed — a made-up serial number on a preview would be exactly the kind of
 *    detail a reader could mistake for a real one.
 * 3. **Only what the reader types is filled in**, and only in their own tab: the
 *    recipient name and the optional studio name are local preview state. They
 *    are never sent anywhere, and clearing them restores the placeholders.
 * 4. **Nothing verifies anybody.** There is no signature, no seal, no
 *    accreditation mark and no legal claim, and the QR space is an empty frame
 *    that says so — there is no code to scan and no endpoint to scan it against.
 */
import { hasText } from '@/utils/text'

/** The document's own title. Precise about what it is a certificate *of*. */
export const CERTIFICATE_TITLE = 'Seller Verification Certificate'

/** The one status this preview may ever show. */
export const CERTIFICATE_STATUS = 'Preview — Not Issued'

/** Said in full wherever the preview appears. */
export const CERTIFICATE_NOT_ISSUED =
  'No certificate has been issued. This is a design preview of the wording a verified seller would receive once a verification workflow exists — and no such workflow exists in ArtVerse today.'

/** The words inside the empty code frame. */
export const CERTIFICATE_QR_LABEL = 'QR placeholder'

/** The accessible text equivalent of that frame. */
export const CERTIFICATE_QR_NOTE =
  'Verification code placeholder. No code is generated, nothing is scannable, and there is no endpoint to verify against.'

/** Shown wherever the preview studio is named. */
export const CERTIFICATE_STUDIO_NOTE =
  'A studio name is optional: it is shown only for a seller who trades under one.'

/** What a reader's own entry does and does not do. */
export const CERTIFICATE_LOCAL_INPUT_NOTE =
  'Anything typed here is held in this browser tab to fill the template. It is not saved, not sent anywhere and not attached to any record.'

export interface CertificateField {
  /** Stable id, also used to link the field to its explanation. */
  id: string
  label: string
  /** What the template shows: a placeholder until something is typed. */
  value: string
  /** True when `value` is a placeholder rather than entered text. */
  placeholder: boolean
  /** When this line would be filled in, on a certificate that was issued. */
  note: string
}

/** What the reader has typed so far. Both entries are optional. */
export interface CertificateEntry {
  recipient?: string
  studio?: string
}

const RECIPIENT_PLACEHOLDER = '[Recipient name]'
const STUDIO_PLACEHOLDER = '[Studio name]'

/** Never populated: no identifier exists, and none is generated here. */
export const CERTIFICATE_ID_PLACEHOLDER = '[Certificate ID]'

/** Never populated: no date of issue exists for an unissued document. */
export const CERTIFICATE_DATE_PLACEHOLDER = '[Issue date]'

/**
 * The four lines of the template.
 *
 * Two can be filled by the reader, two never can: the identifier and the date
 * are the two facts a real certificate would have to come from a real issuance
 * workflow, so they stay bracketed however the form is used.
 */
export function certificateFields(entry: CertificateEntry = {}): CertificateField[] {
  const recipient = hasText(entry.recipient) ? entry.recipient.trim() : ''
  const studio = hasText(entry.studio) ? entry.studio.trim() : ''

  return [
    {
      id: 'certificate-recipient',
      label: 'Recipient',
      value: recipient || RECIPIENT_PLACEHOLDER,
      placeholder: recipient === '',
      note: 'The name a verified seller would be certified under. Filled in here only to show how it would read.',
    },
    {
      id: 'certificate-studio',
      label: 'Studio',
      value: studio || STUDIO_PLACEHOLDER,
      placeholder: studio === '',
      note: CERTIFICATE_STUDIO_NOTE,
    },
    {
      id: 'certificate-id',
      label: 'Certificate ID',
      value: CERTIFICATE_ID_PLACEHOLDER,
      placeholder: true,
      note: 'Assigned when a certificate is issued. No identifier exists for this preview, and none is generated.',
    },
    {
      id: 'certificate-date',
      label: 'Issue date',
      value: CERTIFICATE_DATE_PLACEHOLDER,
      placeholder: true,
      note: 'Set on the day of issue. Nothing has been issued, so no date is set.',
    },
  ]
}

/** True when a field is still showing a bracketed placeholder. */
export function isPlaceholderValue(value: string): boolean {
  return /^\[.+\]$/.test(value.trim())
}
