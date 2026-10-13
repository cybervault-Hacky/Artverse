import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CERTIFICATE_STATUS } from '@/utils/certificate'
import {
  PREVIEW_STUDIO_ID,
  getPreviewStudioEntry,
  WORKSPACE_PREVIEW_NOTICE,
} from '@/utils/sellerStudio'
import {
  CERTIFICATE_DESIGN_VS_ISSUED,
  TRUST_DISTINCTIONS,
  VERIFICATION_HEADLINE,
  VERIFICATION_STAGES,
  VERIFICATION_STATUS_NOTE,
  sellerVerification,
  verificationSummaryLine,
} from '@/utils/verification'
import styles from './StudioVerificationPage.module.css'

/**
 * Verification status, for the studio the workspace is shown with.
 *
 * The page is built to make three different kinds of statement impossible to
 * confuse, because that confusion is how trust screens lie:
 *
 * 1. **What is true now** comes first: the derived state of the preview studio,
 *    with the reason it is what it is. It is derived from the sample data through
 *    `sellerVerification`, so it cannot say anything the records do not support —
 *    and today it says verification has not started, for every studio.
 * 2. **The five states are definitions**, listed under a heading that says so.
 *    “Verified” appears because the workflow needs the word described, and the
 *    page states in as many words that no studio in the build is in that state.
 * 3. **The certificate stays a design.** The route is linked, not reimplemented:
 *    it carries its own `Preview — Not Issued` status, and the sentence beside
 *    the link is the difference between a design and a real, issuable document.
 *
 * There is no score, no tier, no star, no badge and no date anywhere on it.
 */
export function StudioVerificationPage() {
  const entry = getPreviewStudioEntry()
  const verification = sellerVerification(PREVIEW_STUDIO_ID)

  useDocumentTitle({
    title: 'Verification status',
    description:
      'Seller verification on ArtVerse: the workflow states as definitions, the actual state of every studio in this build — none verified, none reviewed — and the route to the certificate design preview.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Artist studio"
        title="Verification status"
        intro="Where a studio stands in the verification workflow, and what verification will mean when there is a system behind it. Today the answer is short: nothing has been submitted, nobody has reviewed anything, and no studio in this build is verified."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Studio workspace', to: NavRoutes.studio },
          { label: 'Verification status' },
        ]}
      />

      <PreviewNotice>{WORKSPACE_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="verification-current">
        <PageContainer>
          <div className={styles.current}>
            <div className={styles.currentHead}>
              <div>
                <p className={styles.currentLabel}>Standing of</p>
                <h2 className={styles.currentName} id="verification-current">
                  {entry ? entry.name : 'Studio name not recorded'}
                </h2>
                <p className={styles.currentMeta}>
                  Illustrative studio · the record this workspace is previewed with
                </p>
              </div>
              <StatusTag tone={verification.stage.tone}>{verification.stage.label}</StatusTag>
            </div>

            <p className={styles.currentHeadline}>{VERIFICATION_HEADLINE}</p>
            <p className={styles.currentBasis}>{verification.basis}</p>
            <p className={styles.currentBasis}>{verificationSummaryLine()}</p>

            <div className={styles.currentLinks}>
              <Button to={NavRoutes.sellApply} variant="secondary">
                See the application preview
              </Button>
              <Button to={NavRoutes.studioCertificate} variant="quiet">
                The certificate design
              </Button>
            </div>
          </div>

          <p className={styles.statusNote}>{VERIFICATION_STATUS_NOTE}</p>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="verification-stages">
        <PageContainer>
          <h2 className={styles.sectionTitle} id="verification-stages">
            What each state will mean
          </h2>
          <p className={styles.sectionIntro}>
            Five definitions, in the order a studio would move through them. Each one describes what
            it will be granted for and what moves a seller on from it — not who is in it.
          </p>

          <ol className={styles.stages}>
            {VERIFICATION_STAGES.map((stage) => (
              <li key={stage.id} className={styles.stage}>
                <div className={styles.stageHead}>
                  <StatusTag tone={stage.tone}>{stage.label}</StatusTag>
                  {stage.id === 'verified' ? (
                    <span className={styles.stageMarker}>No studio is in this state</span>
                  ) : (
                    <span className={styles.stageMarker}>Illustrative state</span>
                  )}
                </div>
                <p className={styles.stageMeaning}>{stage.meaning}</p>
                <p className={styles.stageNext}>
                  <span className={styles.stageNextLabel}>What moves it on</span> {stage.next}
                </p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" tone="surface" ariaLabelledBy="verification-distinctions">
        <PageContainer>
          <h2 className={styles.sectionTitle} id="verification-distinctions">
            Three kinds of statement, kept apart
          </h2>
          <p className={styles.sectionIntro}>
            A trust screen is only worth reading if it is clear which sentences are design, which are
            drawn from records, and which describe things that do not exist yet.
          </p>

          <div className={styles.distinctions}>
            {TRUST_DISTINCTIONS.map((group) => (
              <article key={group.id} className={styles.distinction} aria-labelledby={`trust-${group.id}`}>
                <h3 className={styles.distinctionTitle} id={`trust-${group.id}`}>
                  {group.title}
                </h3>
                <p className={styles.distinctionText}>{group.text}</p>
                <ul className={styles.distinctionList}>
                  {group.items.map((item) => (
                    <li key={item} className={styles.distinctionItem}>
                      <span className={styles.marker} aria-hidden="true">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="verification-certificate">
        <PageContainer>
          <h2 className={styles.sectionTitle} id="verification-certificate">
            The certificate, and what is not one
          </h2>

          <div className={styles.certificate}>
            <div className={styles.certificateBody}>
              <p className={styles.certificateStatus}>
                <StatusTag tone="quiet">{CERTIFICATE_STATUS}</StatusTag>
              </p>
              <p className={styles.certificateText}>{CERTIFICATE_DESIGN_VS_ISSUED}</p>
              <p className={styles.certificateText}>
                The document itself is drawn at its own route, so there is one certificate component
                in this build rather than two that could drift apart. Its identifier, its issue date
                and the frame where a verification code would sit are all placeholders, and it says on
                its face that nothing has been issued.
              </p>
            </div>

            <div className={styles.certificateLinks}>
              <Button to={NavRoutes.studioCertificate}>Open the certificate preview</Button>
              <TextLink to={NavRoutes.sellApply}>How an application would start</TextLink>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}
