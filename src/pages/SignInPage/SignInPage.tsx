import { NavRoutes } from '@/app/routes'
import { AccountForm } from '@/components/AccountForm/AccountForm'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  ACCOUNT_NO_SESSION,
  ACCOUNT_PREVIEW_NOTICE,
  SIGN_IN_BLOCKERS,
} from '@/utils/account'
import styles from './SignInPage.module.css'

/**
 * Sign in, as a preview.
 *
 * The screen exists so the sign-in experience can be designed and reviewed, and
 * its honesty is structural rather than a disclaimer at the foot:
 *
 * 1. **The heading says preview.** So does the notice under it, and so does the
 *    action — “Check these details”, not “Sign in”, because pressing it can only
 *    run the browser's own check.
 * 2. **It asks for a made-up password.** There is no account for a real one to
 *    belong to, and a preview form must not collect a credential it cannot hold
 *    safely.
 * 3. **Nothing about the visit is remembered.** No session, no cookie, no
 *    storage: the page says so, and the model has no state that could mean
 *    signed in.
 *
 * The closing list is what a real sign-in would need — including the parts that
 * are not code: a session policy, an account-recovery route and somebody
 * responsible for both.
 */
export function SignInPage() {
  useDocumentTitle({
    title: 'Sign in preview',
    description:
      'A frontend preview of the ArtVerse sign-in screen. There is no account system: nothing is transmitted, stored or checked, and no session can be created.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Account preview"
        title="Sign in preview"
        intro="A preview of the sign-in screen, so its layout and validation can be reviewed. There is no account behind it: no credential is transmitted or stored, and no session is created."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Account previews', to: NavRoutes.signIn },
          { label: 'Sign in preview' },
        ]}
      />

      <PreviewNotice label="Preview">{ACCOUNT_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="signin-form">
        <PageContainer>
          <h2 className={styles.heading} id="signin-form">
            The sign-in form
          </h2>
          <p className={styles.intro}>
            Two fields, checked in your browser. Nothing leaves the page, and nothing will be
            remembered afterwards.
          </p>

          <AccountForm form="signIn" />

          <p className={styles.sessionNote}>{ACCOUNT_NO_SESSION}</p>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="signin-later">
        <PageContainer>
          <PhaseNote
            phase="Phase 9"
            title="What a real sign-in needs"
            description="None of these exists, so none of them is simulated here. The list is the honest distance between this screen and one that signs anybody in."
            items={SIGN_IN_BLOCKERS}
          />

          <p className={styles.links}>
            Browsing needs no account at all — see{' '}
            <TextLink to={NavRoutes.discover}>Explore Art</TextLink>, the{' '}
            <TextLink to={NavRoutes.artists}>studio directory</TextLink>, or the{' '}
            <TextLink to={NavRoutes.cart}>cart</TextLink> held in this tab.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
