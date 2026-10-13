import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './SellPage.module.css'

/**
 * Become a Seller.
 *
 * This page states the intent of the seller experience without offering a
 * sign-up form, an application or a pricing claim — none of which exist yet.
 */
const SELLER_STEPS = [
  {
    title: 'A studio profile',
    text: 'One place for your practice, your process and the works you are showing — written in your voice.',
  },
  {
    title: 'Listings you control',
    text: 'Publish a work with its medium, dimensions and images, and decide what is available and when.',
  },
  {
    title: 'Buyers around the world',
    text: 'Reach collectors browsing by category, collection and studio rather than by an algorithm.',
  },
]

export function SellPage() {
  useDocumentTitle({
    title: 'Become a Seller',
    description:
      'How selling on ArtVerse is being designed: studio profiles, self-managed listings and a global audience.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Become a Seller"
        title="Bring your work to a wider room"
        intro="ArtVerse is being built so that independent artists, studios and makers can present their work properly — carefully, without noise, and on terms they control."
        actions={
          <>
            <Button to={NavRoutes.artists} variant="secondary">
              See the directory
            </Button>
            <Button to={NavRoutes.about} variant="quiet">
              About ArtVerse
            </Button>
          </>
        }
      />

      <Section spacing="tight" ariaLabelledBy="seller-steps">
        <PageContainer>
          <h2 id="seller-steps" className="visually-hidden">
            How selling is being designed
          </h2>

          <div className={styles.steps}>
            {SELLER_STEPS.map((step) => (
              <div key={step.title} className={styles.step}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>

          <p className={styles.honestyNote}>
            There is no sign-up form on this page, because there is no seller account system yet.
            Application, verification, listing tools and payouts are planned for a later phase, and
            this page will be replaced by the real flow at that point.
          </p>

          <PhaseNote
            className={styles.note}
            phase="Phase 5"
            items={[
              'Seller accounts with a clear, honest verification step.',
              'Listing tools for images, dimensions and availability.',
              'Order handling and shipping options.',
              'Payouts and fees, stated plainly before anyone commits.',
            ]}
          />

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
