import { useState } from 'react'
import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { FormField } from '@/components/FormField/FormField'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { SellerCertificatePreview } from '@/components/SellerCertificatePreview/SellerCertificatePreview'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CERTIFICATE_LOCAL_INPUT_NOTE, CERTIFICATE_STATUS } from '@/utils/certificate'
import { WORKSPACE_PREVIEW_NOTICE } from '@/utils/sellerStudio'
import styles from './StudioCertificatePage.module.css'

/**
 * The seller certificate, as a design preview.
 *
 * The page exists to answer one question — what would this document look like —
 * without ever implying that one exists:
 *
 * 1. **The status is fixed.** `Preview — Not Issued` comes from the certificate
 *    model, so there is no state, no prop and no form field that can change it.
 * 2. **Two lines are typed, two never are.** A recipient name and an optional
 *    studio name live in this tab's memory and fill the template as they are
 *    typed. The certificate ID and the issue date stay bracketed, because a real
 *    identifier and a real date could only come from an issuance workflow.
 * 3. **Printing shows the document, not the page.** The chrome, the form and the
 *    buttons are dropped in the print stylesheet, leaving the certificate's own
 *    wording — which is what a print view is for.
 *
 * There is no signature, no seal, no accreditation mark, no legal claim and no
 * scannable code anywhere on it, and the closing sentence of the document says
 * that nothing has been issued.
 */
export function StudioCertificatePage() {
  const [recipient, setRecipient] = useState('')
  const [studio, setStudio] = useState('')

  useDocumentTitle({
    title: 'Seller certificate preview',
    description:
      'A design preview of the ArtVerse seller verification certificate. Preview — not issued: no certificate exists and none is issued anywhere in this build.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Artist studio"
        title="Seller certificate preview"
        intro="The design of the document a verified seller would eventually receive, shown with placeholders so its wording and layout can be reviewed. Nothing is issued, and nothing here verifies anybody."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Studio workspace', to: NavRoutes.studio },
          { label: 'Seller certificate' },
        ]}
      />

      <PreviewNotice>{WORKSPACE_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="certificate-intro">
        <PageContainer>
          <h2 id="certificate-intro" className="visually-hidden">
            How to read this preview
          </h2>

          <div className={styles.layout}>
            {/* The controls are part of the page, not the document: they are
                dropped from the print stylesheet entirely. */}
            <form className={styles.controls} onSubmit={(event) => event.preventDefault()}>
              <h3 className={styles.controlsTitle}>Fill the template</h3>
              <p className={styles.controlsNote}>
                {CERTIFICATE_LOCAL_INPUT_NOTE} The certificate ID and the issue date are
                placeholders and cannot be filled in: this preview has no way to assign either.
              </p>

              <div className={styles.controlsFields}>
                <FormField
                  id="certificate-entry-recipient"
                  label="Recipient name"
                  hint="Optional. A placeholder is shown until something is typed."
                >
                  <input
                    type="text"
                    name="recipient"
                    autoComplete="off"
                    value={recipient}
                    maxLength={80}
                    onChange={(event) => setRecipient(event.target.value)}
                  />
                </FormField>

                <FormField
                  id="certificate-entry-studio"
                  label="Studio name"
                  hint="Optional. Shown only for a seller who trades under a studio name."
                >
                  <input
                    type="text"
                    name="studio"
                    autoComplete="off"
                    value={studio}
                    maxLength={80}
                    onChange={(event) => setStudio(event.target.value)}
                  />
                </FormField>
              </div>

              <div className={styles.controlsActions}>
                <Button variant="secondary" onClick={() => window.print()}>
                  Print this preview
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => {
                    setRecipient('')
                    setStudio('')
                  }}
                  disabled={recipient === '' && studio === ''}
                >
                  Clear placeholders
                </Button>
              </div>

              <p className={styles.statusLine}>
                The document below always reads{' '}
                <span className={styles.statusValue}>{CERTIFICATE_STATUS}</span> — it is written by
                the certificate model and cannot be changed from this page. What verification itself
                will mean, and where a studio stands in it, is set out on the{' '}
                <TextLink to={NavRoutes.studioVerification}>verification status</TextLink> screen.
              </p>
            </form>

            <div className={styles.document}>
              <SellerCertificatePreview entry={{ recipient, studio }} />
            </div>
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="certificate-first">
        <PageContainer>
          <SectionHeading
            eyebrow="Before anything could be issued"
            title="What has to exist first"
            id="certificate-first"
            description="A certificate is a small document with a large dependency: everything below would have to be built and running before a single one could honestly be printed."
          />

          <PhaseNote
            phase="Phase 9"
            title="Nothing here is a step towards issuing one"
            description="This phase draws the document. The workflow that would give it meaning is planned for the seller-account phase and the commerce phase, and neither is built."
            items={[
              'A verification process: an application, evidence, a human decision, and a record of the outcome.',
              'A store for what was issued, to whom and when — with an identifier scheme that is not guessable.',
              'A public verification endpoint the printed code would point at. Nothing to scan exists today.',
              'A revocation path, because a certificate that cannot be withdrawn is worth very little.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
