import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { CollectionGrid } from '@/components/CollectionGrid/CollectionGrid'
import { DisciplineNav } from '@/components/DisciplineNav/DisciplineNav'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, getArtworkById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import styles from './DiscoverPage.module.css'

/**
 * Explore Art — the discovery catalogue.
 *
 * The page reads top to bottom as one idea: what can be explored, then the
 * works themselves, then the groupings. Three deliberate decisions:
 *
 * 1. The discipline row is an index, not a filter. No per-discipline route
 *    exists yet, so each entry opens the artwork that represents it rather than
 *    implying a filter that would silently do nothing.
 * 2. The whole catalogue is shown in one pass. Six sample records do not need
 *    pagination, and adding controls now would be decoration.
 * 3. The grid crops every work to one ratio so rows align; the artwork page
 *    still shows each piece in full. The note under the grid says so.
 */
export function DiscoverPage() {
  useDocumentTitle({
    title: 'Explore Art',
    description:
      'Discover works across five creative disciplines — fine paintings, digital artwork, decorative lamps, handmade products and custom creations.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Explore Art"
        intro="Works from independent creators across five disciplines — fine paintings, digital artwork, decorative lamps, handmade products and custom creations. Every record here is an illustrative placeholder made for this build."
      />

      <Section spacing="tight" ariaLabelledBy="disciplines-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Disciplines"
            title="Explore by discipline"
            id="disciplines-title"
            description="The five directions ArtVerse is built around. Each entry opens a representative work from the sample catalogue — filtering the catalogue by discipline arrives with the later filtering phase."
          />

          <DisciplineNav />
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="catalogue-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Catalogue"
            title="The catalogue"
            id="catalogue-title"
            description={`${countLabel(SAMPLE_ARTWORKS.length, 'record')} across five disciplines, shown in a consistent crop.`}
          />

          {SAMPLE_ARTWORKS.length > 0 ? (
            <>
              <ArtworkGrid
                className={styles.catalogue}
                artworks={SAMPLE_ARTWORKS}
                label="All artwork records"
                aspect="portrait"
                eagerCount={3}
              />
              <p className={styles.note}>
                The grid holds every work in a 4:5 frame so rows stay aligned; each artwork page
                shows the piece in full, at its own proportions. The studios behind these records
                are listed under{' '}
                <TextLink to={NavRoutes.artists}>Artists &amp; Studios</TextLink>.
              </p>
            </>
          ) : (
            <EmptyState
              className={styles.catalogue}
              title="No works in the catalogue yet"
              description="This build ships an illustrative sample set. When records are added, they appear here automatically."
            />
          )}
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="collections-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Collections"
            title="Collections to start from"
            id="collections-title"
            description="Four sample groupings that hold works together by mood, material and light rather than by category."
            action={
              <TextLink to={NavRoutes.collections} arrow>
                All collections
              </TextLink>
            }
          />

          <CollectionGrid
            className={styles.collections}
            collections={SAMPLE_COLLECTIONS}
            label="Sample collections"
            leadArtworkFor={(collection) => getArtworkById(collection.artworkIds[0])}
          />

          <PhaseNote
            className={styles.phase}
            phase="Phase 4"
            title="Still to come on this page"
            description="This page shows the whole sample set in one pass, which is the right behaviour for six records. These controls arrive once the catalogue outgrows a single page."
            items={[
              'Filtering by discipline, medium and dimensions.',
              'Sorting, and pagination as the catalogue grows.',
              'Indexed search across every work and studio.',
              'Saved views for returning to a search later.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
