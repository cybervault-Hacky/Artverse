import { NavRoutes } from '@/app/routes'
import { AccountForm } from '@/components/AccountForm/AccountForm'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ACCOUNT_NO_EMAIL_NOTE, ACCOUNT_PREVIEW_NOTICE } from '@/utils/account'
import styles from './ResetPasswordPage.module.css'

/** What a real reset request would need, over and above an address field. */
const RESET_BLOCKERS: string[] = [
  'A mail service able to send a message — nothing in this build sends email.',
  'A one-time token with an expiry, generated and stored server-side.',
  'A record of the account an address belongs to, and a policy for addresses that match none.',
  'Rate limiting, so the form cannot be used to send mail to somebody who did not ask for it.',
  'A password policy and a re-hash step, applied where the credential actually lives.',
  'A support route for somebody whose address no longer exists.',
]

/**
 * Requesting a password reset, as a preview.
 *
 * This is the smallest of the three screens, on purpose: a reset request asks for
 * one thing, and a version that also asked for a new password would be pretending
 * to a workflow that has not begun. The page therefore holds two sentences that
 * matter more than the field — no email is generated, and no password can be
 * changed — and the field's own hint says that nothing is sent to whatever is
 * typed into it.
 */
export function ResetPasswordPage() {
  useDocumentTitle({
    title: 'Password reset preview',
    description:
      'A frontend preview of the ArtVerse password-reset request screen. No email is sent, no reset link is generated and no password can be changed.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Account preview"
        title="Password reset preview"
        intro="A preview of the screen that asks for a reset. No message is generated, no link is created and no password exists to change."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Account previews', to: NavRoutes.signIn },
          { label: 'Password reset preview' },
        ]}
      />

      <PreviewNotice label="Preview">{ACCOUNT_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="reset-form">
        <PageContainer>
          <h2 className={styles.heading} id="reset-form">
            Request a reset
          </h2>
          <p className={styles.intro}>
            One field. On a real marketplace this is where the screen would say “if an account exists
            for that address, a message is on its way” — a sentence this build cannot honestly write,
            because no message would ever arrive.
          </p>

          <AccountForm form="reset" />

          <p className={styles.noEmailNote}>{ACCOUNT_NO_EMAIL_NOTE}</p>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="reset-later">
        <PageContainer>
          <h2 className={styles.blockTitle} id="reset-later">
            What a real reset request needs
          </h2>
          <p className={styles.blockIntro}>
            Listed here rather than implied, so nobody waits for a message that will not come.
          </p>

          <ul className={styles.blockers}>
            {RESET_BLOCKERS.map((blocker) => (
              <li key={blocker} className={styles.blocker}>
                <span className={styles.blockerMarker} aria-hidden="true">
                  —
                </span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </PageContainer>
      </Section>
    </>
  )
}
