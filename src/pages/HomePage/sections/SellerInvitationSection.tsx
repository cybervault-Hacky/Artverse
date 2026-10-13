import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { Section } from '@/components/Section/Section'
import { getArtworkById } from '@/data'
import { INVITATION_ARTWORK_ID } from '@/data/homepage'
import styles from './SellerInvitationSection.module.css'

/**
 * Artist invitation band.
 *
 * The one charcoal section on the homepage. It states the intent — connecting
 * independent makers with a worldwide audience — and links to the seller page,
 * which is honest about what does not exist yet. No sign-up is implied.
 */
export function SellerInvitationSection() {
  const texture = getArtworkById(INVITATION_ARTWORK_ID)

  return (
    <Section tone="charcoal" divided ariaLabelledBy="invitation-title">
      <PageContainer>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>For artists &amp; studios</p>
            <h2 className={styles.title} id="invitation-title">
              Share Your Creative Vision.
            </h2>
            <p className={styles.text}>
              ArtVerse is built to connect independent artists, studios and makers with collectors
              around the world — a calm place to show your work, where a studio is found by what it
              makes.
            </p>
            <div className={styles.actions}>
              <Button to={NavRoutes.sell} variant="inverse" size="lg">
                Become a Seller
              </Button>
            </div>
            <p className={styles.note}>
              Seller accounts, verification and payouts arrive in a later phase. The seller page
              states exactly what exists today.
            </p>
          </div>

          {texture ? (
            <div className={styles.texture}>
              <ArtworkFrame
                className={styles.textureFrame}
                src={texture.image.src}
                alt={texture.image.alt}
                width={texture.image.width}
                height={texture.image.height}
                aspect="portrait"
                ratio={texture.image.width / texture.image.height}
                radius="lg"
                sizes="(min-width: 900px) 26rem, 92vw"
              />
            </div>
          ) : null}
        </div>
      </PageContainer>
    </Section>
  )
}
