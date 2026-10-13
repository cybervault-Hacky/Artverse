import { CollectionGrid } from '@/components/CollectionGrid/CollectionGrid'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SAMPLE_COLLECTIONS, getArtworkById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './CollectionsPage.module.css'

/** Collections directory. Curation tooling and editorial collections come later. */
export function CollectionsPage() {
  useDocumentTitle({
    title: 'Collections',
    description:
      'Sample collections that group ArtVerse placeholder works by mood, material and light.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Collections"
        title="Groupings, not folders"
        intro="Collections are how ArtVerse will hold works together across studios — by mood, material or a shared idea. The three below are sample groupings of the placeholder records."
      />

      <Section spacing="tight" ariaLabelledBy="collections-directory">
        <PageContainer>
          <h2 id="collections-directory" className="visually-hidden">
            All collections
          </h2>

          <CollectionGrid
            className={styles.grid}
            collections={SAMPLE_COLLECTIONS}
            label="Sample collections"
            headingLevel="h3"
            leadArtworkFor={(collection) => getArtworkById(collection.artworkIds[0])}
          />

          <PhaseNote
            className={styles.note}
            phase="Phase 3"
            title="How collections will grow"
            items={[
              'Editorial collections curated with context and notes.',
              'Collector-facing groupings such as saved works.',
              'Studio-defined series that sit alongside curated sets.',
              'Ordering controls so a collection can read as a narrative.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
