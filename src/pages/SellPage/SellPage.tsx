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
 * This page explains the workflow and hands over to the workspace preview. Two
 * things it deliberately does not do: offer a sign-up form, and describe any
 * part of the seller experience as working. There is no account system, no
 * application and no pricing anywhere in ArtVerse yet, and the page says so
 * before it offers anything to click.
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
            <Button to={NavRoutes.studio}>Open the studio workspace</Button>
            <Button to={NavRoutes.artists} variant="secondary">
              See the directory
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
            up to. Application, verification, listing tools and payouts are planned for later phases,
            and this page will hand over to the real flow at that point.
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
