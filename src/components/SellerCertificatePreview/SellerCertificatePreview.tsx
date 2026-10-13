import { StatusTag } from '@/components/StatusTag/StatusTag'
import { cn } from '@/utils/cn'
import {
  CERTIFICATE_NOT_ISSUED,
  CERTIFICATE_QR_LABEL,
  CERTIFICATE_QR_NOTE,
  CERTIFICATE_STATUS,
  CERTIFICATE_TITLE,
  certificateFields,
  type CertificateEntry,
} from '@/utils/certificate'
import styles from './SellerCertificatePreview.module.css'

export interface SellerCertificatePreviewProps {
  /** What the reader has typed into the preview form, if anything. */
  entry?: CertificateEntry
  className?: string
}

/**
 * The design of the certificate a verified seller would eventually receive.
 *
 * Three things are structural rather than decorative:
 *
 * 1. **The status is not a variable.** `Preview — Not Issued` is written by the
 *    model and cannot be passed in, so no screen can render this component as
 *    though a certificate existed.
 * 2. **The fields are a definition list, not a picture.** Each line has a
 *    visible label, so the document's content is in the text of the page — which
 *    is also its accessible equivalent, and what survives printing.
 * 3. **The code frame is empty and says so.** The frame is hidden from assistive
 *    technology because it carries no information; the sentence beside it does,
 *    and that sentence is the one a reader would need either way.
 *
 * Nothing here is a claim: there is no seal, no signature, no accreditation mark
 * and no legal wording, and the closing sentence states plainly that nothing has
 * been issued.
 */
export function SellerCertificatePreview({ entry, className }: SellerCertificatePreviewProps) {
  const fields = certificateFields(entry)

  return (
    <article className={cn(styles.certificate, className)} aria-labelledby="certificate-title">
      <div className={styles.head}>
        <p className={styles.brand}>ArtVerse</p>
        <p className={styles.tagline}>Where Art Finds Its Universe.</p>
      </div>

      <div className={styles.titleBlock}>
        <p className={styles.eyebrow}>Seller verification</p>
        <h2 className={styles.title} id="certificate-title">
          {CERTIFICATE_TITLE}
        </h2>
        <p className={styles.status}>
          <StatusTag tone="neutral">{CERTIFICATE_STATUS}</StatusTag>
        </p>
      </div>

      <dl className={styles.fields}>
        {fields.map((field) => (
          <div key={field.id} className={styles.field}>
            <dt className={styles.fieldLabel} id={`${field.id}-label`}>
              {field.label}
            </dt>
            <dd className={styles.fieldValue}>
              <span
                className={cn(styles.valueText, field.placeholder && styles.placeholder)}
                aria-describedby={`${field.id}-note`}
              >
                {field.value}
              </span>
              <span className={styles.fieldNote} id={`${field.id}-note`}>
                {field.note}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className={styles.codeBlock}>
        <div className={styles.codeFrame} aria-hidden="true">
          <span className={styles.codeLabel}>{CERTIFICATE_QR_LABEL}</span>
        </div>
        <p className={styles.codeNote}>{CERTIFICATE_QR_NOTE}</p>
      </div>

      <p className={styles.issueNote}>{CERTIFICATE_NOT_ISSUED}</p>
    </article>
  )
}
