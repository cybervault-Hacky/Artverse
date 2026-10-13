import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ARTIST_WORKFLOW, WORKSPACE_NOT_INCLUDED } from '@/utils/sellerStudio'
import styles from './SellPage.module.css'

/**
 * For Artists — the entry point to the seller experience.
 *
 * This page explains the workflow and hands over to two places: the application
 * preview, where the details a studio applies with can be filled in and checked,
 * and the workspace preview, where the work itself is prepared. It still offers
 * no sign-up form, because there is no seller account system to sign up to, and
 * it still describes no part of the seller experience as working.
 */
export function SellPage() {
  useDocumentTitle({
    title: 'For Artists',
    description:
      'The artist workflow on ArtVerse — presenting work, preparing listings and keeping a studio profile — and the studio workspace preview that shows it.',
  })

  return (
    <>
      <PageHeader
        eyebrow="For Artists"
        title="Bring your work to a wider room"
        intro="ArtVerse is being built so that independent artists, studios and makers can present their work properly — carefully, without noise, and on terms they control. The workspace where that will happen exists today as a frontend preview."
        actions={
          <>
            <Button to={NavRoutes.sellApply}>See the application preview</Button>
            <Button to={NavRoutes.studio} variant="secondary">
              Open the studio workspace
            </Button>
          </>
        }
      />

      <PreviewNotice>
        The workspace is a frontend preview. There is no sign-in, no application and no storage:
        nothing entered there is uploaded, saved or published, and drafts live only in the browser
        tab that made them.
      </PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="artist-workflow">
        <PageContainer>
          <h2 id="artist-workflow" className={styles.sectionTitle}>
            The workflow this is being built for
          </h2>
          <p className={styles.sectionIntro}>
            Four things an artist will do on ArtVerse. The first three have screens in the workspace
            preview; the fourth waits on an account system that does not exist yet.
          </p>

          <ol className={styles.steps}>
            {ARTIST_WORKFLOW.map((step) => (
              <li className={styles.step} key={step.title}>
                <p className={styles.stepLabel}>{step.step}</p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>

          <div className={styles.handoff}>
            <div className={styles.handoffBody}>
              <h3 className={styles.handoffTitle}>Start where a seller starts</h3>
              <p className={styles.handoffText}>
                The application preview carries the details a studio would apply with — a name, a
                discipline, a sentence about the practice — validated in the browser and submitted
                nowhere. Beside it, the verification section describes what each state will mean and
                reports the truth about every studio in this build.
              </p>
            </div>
            <div className={styles.handoffActions}>
              <Button to={NavRoutes.sellApply}>See the application preview</Button>
              <Button to={NavRoutes.studioVerification} variant="quiet">
                Verification status
              </Button>
            </div>
          </div>

          <div className={styles.handoff}>
            <div className={styles.handoffBody}>
              <h3 className={styles.handoffTitle}>See it in the workspace</h3>
              <p className={styles.handoffText}>
                The preview opens on a studio overview, with artwork listings, a listing draft you
                can prepare and validate, and a preview of the public profile — all shown with one of
                the illustrative studios in this build.
              </p>
            </div>
            <div className={styles.handoffActions}>
              <Button to={NavRoutes.studio}>Open the studio workspace</Button>
              <Button to={NavRoutes.studioListings} variant="quiet">
                Go straight to listings
              </Button>
            </div>
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="artist-not-yet">
        <PageContainer>
          <h2 id="artist-not-yet" className={styles.sectionTitle}>
            What is not here yet
          </h2>
          <p className={styles.sectionIntro}>
            Stated plainly rather than left to be discovered by clicking.
          </p>

          <ul className={styles.absent}>
            {WORKSPACE_NOT_INCLUDED.map((item) => (
              <li className={styles.absentItem} key={item}>
                {item}
              </li>
            ))}
          </ul>

          <p className={styles.honestyNote}>
            There is no sign-up form on this page, because there is no seller account system to sign
            up to. The application and account screens exist as previews: they validate what is typed
            and submit nothing, and no studio is marked as applied, reviewed or verified.
          </p>

          <p className={styles.honestyNote}>
            In the meantime, see how the work is presented by browsing{' '}
            <TextLink to={NavRoutes.discover}>Explore Art</TextLink> or the{' '}
            <TextLink to={NavRoutes.artists}>studio directory</TextLink>.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
