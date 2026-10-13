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
  CREATE_ACCOUNT_BLOCKERS,
} from '@/utils/account'
import styles from './CreateAccountPage.module.css'

/**
 * Account creation, as a preview.
 *
 * The form asks for a name, an address, a password and the password typed again
 * — enough to show every validation rule a real screen would apply, and nothing
 * more. Three things it deliberately does not do:
 *
 * 1. **It asks for no real credential.** The warning above the password fields
 *    says so plainly; there is no account for a genuine one to belong to.
 * 2. **It asks nobody to agree to anything.** Terms, a privacy notice and a
 *    data-retention rule would all have to exist before a form could ask for
 *    agreement to them, and inventing them here would be inventing a contract.
 * 3. **It creates nothing.** There is no request and no storage, so a passing
 *    check reports the check — never an account, and never a confirmation email.
 */
export function CreateAccountPage() {
  useDocumentTitle({
    title: 'Create account preview',
    description:
      'A frontend preview of the ArtVerse account-creation screen. No account is created, no credential is stored and no email is sent.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Account preview"
        title="Create account preview"
        intro="A preview of the account-creation screen, with every field and rule a real one would use. Nothing is created: there is no accounts table, no email service and no session behind it."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Account previews', to: NavRoutes.signIn },
          { label: 'Create account preview' },
        ]}
      />

      <PreviewNotice label="Preview">{ACCOUNT_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="create-form">
        <PageContainer>
          <h2 className={styles.heading} id="create-form">
            Your details
          </h2>
          <p className={styles.intro}>
            Four fields, checked in your browser. The matching rule between the two password entries
            is real; everything else about them is deliberately absent, because there is nothing to
            validate a credential against.
          </p>

          <AccountForm form="create" />

          <p className={styles.sessionNote}>{ACCOUNT_NO_SESSION}</p>

          <p className={styles.browsingNote}>
            There is nothing to agree to on this screen. Terms, a privacy notice and a data-retention
            rule would all have to exist before a form could honestly ask for agreement to them, and
            none of them does.
          </p>

          <p className={styles.browsingNote}>
            You do not need this screen for anything on ArtVerse today. Saving works and filling a
            cart need no account — see{' '}
            <TextLink to={NavRoutes.wishlist}>saved works</TextLink> and the{' '}
            <TextLink to={NavRoutes.cart}>cart</TextLink>, both held in this browser tab.
          </p>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="create-later">
        <PageContainer>
          <PhaseNote
            phase="Phase 9"
            title="What a real account would need"
            description="Creating an account means holding somebody's personal data, which is a commitment rather than a form. None of this exists yet."
            items={CREATE_ACCOUNT_BLOCKERS}
          />
        </PageContainer>
      </Section>
    </>
  )
}
