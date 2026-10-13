import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { CollectionGrid } from '@/components/CollectionGrid/CollectionGrid'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { ARTWORK_CATEGORIES, SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, getArtworkById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import styles from './DiscoverPage.module.css'

/**
 * Explore Art — the entry point to browsing.
 *
 * Phase 1 renders the illustrative sample set so the grid, frames and card
 * behaviour can be reviewed. Real catalogue browsing arrives in Phase 3.
 */
export function DiscoverPage() {
  useDocumentTitle({
    title: 'Explore Art',
    description:
      'Browse the ArtVerse sample set — paintings, digital works, lighting, handmade objects and custom pieces.',
  })

  const categories = ARTWORK_CATEGORIES.map((category) => ({
    ...category,
    count: SAMPLE_ARTWORKS.filter((artwork) => artwork.category === category.id).length,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Explore Art"
        title="Browse the sample set"
        intro="Every record below is an illustrative placeholder created for this phase. It exists so the browsing surfaces can be designed and tested honestly before real works arrive."
        actions={undefined}
      />

      <Section spacing="tight" ariaLabelledBy="categories-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Categories"
            title="Five directions the marketplace is built around"
            description="Category browsing with filters, sorting and pagination is planned for Phase 3. For now this is a plain overview of how the sample set is distributed."
            id="categories-title"
          />

          <ul className={styles.categories}>
            {categories.map((category) => (
              <li key={category.id} className={styles.category}>
                <span className={styles.categoryName}>{category.label}</span>
                <span className={styles.categoryCount}>{countLabel(category.count, 'record')}</span>
              </li>
            ))}
          </ul>

          <div className={styles.catalogue}>
            <ArtworkGrid artworks={SAMPLE_ARTWORKS} label="Illustrative sample artworks" />
          </div>

          <p className={styles.note}>
            These records are also reachable from a collection or a studio profile — see{' '}
            <TextLink to={NavRoutes.collections}>Collections</TextLink> or{' '}
            <TextLink to={NavRoutes.artists}>Artists &amp; Studios</TextLink>.
          </p>
        </PageContainer>
      </Section>

      <Section divided tone="canvas" spacing="tight" ariaLabelledBy="collections-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Groupings"
            title="Sample collections"
            description="Hand-assembled groupings of the same sample records."
            id="collections-title"
          />

          <CollectionGrid
            className={styles.catalogue}
            collections={SAMPLE_COLLECTIONS}
            label="Sample collections"
            leadArtworkFor={(collection) => getArtworkById(collection.artworkIds[0])}
          />

          <PhaseNote
            className={styles.note}
            phase="Phase 3"
            items={[
              'Real catalogue browsing built on paginated data.',
              'Filtering by category, medium, size and availability.',
              'Sorting, saved views and recently added rows.',
              'Editorial rows curated for the homepage.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
