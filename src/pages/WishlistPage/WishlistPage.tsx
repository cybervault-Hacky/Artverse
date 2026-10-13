import { NavRoutes } from '@/app/routes'
import { useBuyerState } from '@/app/buyerState'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Button } from '@/components/Button/Button'
import { CartAction, WishlistButton } from '@/components/BuyerActions/BuyerActions'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import { BUYER_STATE_NOTE, SAVED_EMPTY_TEXT, SAVED_EMPTY_TITLE, savedArtworks } from '@/utils/buyerJourney'
import styles from './WishlistPage.module.css'

/**
 * Saved works — the list a visitor keeps while browsing.
 *
 * The route is `/wishlist` because that is the word a buyer looks for; the page
 * calls itself “Saved works”, because that is what it honestly is. Two things
 * are load-bearing here:
 *
 * 1. **The list is local.** It lives in the browser tab for the visit. There is
 *    no account to sync it to and no storage API behind it, and the notice at
 *    the top says exactly that rather than implying a saved list somewhere else.
 * 2. **A save holds nothing.** Wording on the card and in the empty state says a
 *    save is a bookmark, not a reservation — ArtVerse has no availability, no
 *    checkout and no payment, so a saved work cannot be “held” for anyone.
 *
 * The grid is the catalogue's own `ArtworkGrid`, with a control row per card, so
 * a saved work looks exactly like it does everywhere else on the site.
 */
export function WishlistPage() {
  const { state } = useBuyerState()
  const saved = savedArtworks(state)

  useDocumentTitle({
    title: 'Saved works',
    description:
      'Works saved while browsing ArtVerse, each with its studio and its price where the catalogue holds one. The list is held in this browser tab and is never sent anywhere.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved works"
        intro="Works you have saved from their own pages. Saving is a bookmark rather than a hold: nothing here reserves a work, and nothing in ArtVerse can be bought yet."
        crumbs={[{ label: 'Home', to: NavRoutes.home }, { label: 'Saved works' }]}
      />

      <PreviewNotice label="Local to this tab">{BUYER_STATE_NOTE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="saved-heading">
        <PageContainer>
          {saved.length === 0 ? (
            <EmptyState
              title={SAVED_EMPTY_TITLE}
              description={SAVED_EMPTY_TEXT}
              headingLevel="h2"
              action={
                <div className={styles.emptyActions}>
                  <Button to={NavRoutes.discover}>Explore Art</Button>
                  <Button to={NavRoutes.collections} variant="quiet">
                    Browse collections
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              <SectionHeading
                eyebrow="Saved"
                title={`${countLabel(saved.length, 'work')} saved`}
                id="saved-heading"
                description="Each work is shown as the catalogue holds it, with the two buyer controls beside it — remove it from the list, or add it to the cart."
              />

              <ArtworkGrid
                className={styles.grid}
                artworks={saved}
                label="Saved sample records"
                aspect="portrait"
                eagerCount={3}
                renderActions={(artwork) => (
                  <>
                    <WishlistButton
                      artworkId={artwork.id}
                      ariaLabel={`Remove ${artwork.title} from saved works`}
                    />
                    <CartAction artworkId={artwork.id} />
                  </>
                )}
              />

              <div className={styles.footer}>
                <p className={styles.note}>
                  Removing a work takes it off this list straight away. The catalogue record itself
                  is never changed by anything on this page.
                </p>
                <TextLink to={NavRoutes.discover}>Keep exploring the catalogue</TextLink>
              </div>
            </>
          )}
        </PageContainer>
      </Section>
    </>
  )
}
