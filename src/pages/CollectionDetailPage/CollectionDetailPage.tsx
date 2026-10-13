import { useParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { NotFoundView } from '@/components/NotFoundView/NotFoundView'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { getArtworksForCollection, getCollectionById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import styles from './CollectionDetailPage.module.css'

/**
 * A single collection.
 *
 * An unknown `:collectionId` renders the shared not-found experience rather
 * than an empty shell, so a stale link is never mistaken for a real page.
 */
export function CollectionDetailPage() {
  const { collectionId } = useParams()
  const collection = getCollectionById(collectionId)

  useDocumentTitle({
    title: collection ? collection.title : 'Collection not found',
    description: collection?.summary,
  })

  if (!collection) {
    return <NotFoundView subject="collection" reference={collectionId} />
  }

  const works = getArtworksForCollection(collection)

  return (
    <>
      <PageHeader
        eyebrow="Sample collection"
        title={collection.title}
        intro={collection.description}
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Explore Art', to: NavRoutes.discover },
          { label: collection.title },
        ]}
      />

      <Section spacing="tight" ariaLabelledBy="collection-works">
        <PageContainer>
          <div className={styles.summary}>
            <span>{countLabel(works.length, 'work')} in this collection</span>
            <span>Illustrative sample records</span>
          </div>

          <h2 id="collection-works" className="visually-hidden">
            Works in this collection
          </h2>

          <ArtworkGrid
            className={styles.grid}
            artworks={works}
            label={`Works in ${collection.title}`}
          />

          <PhaseNote
            className={styles.note}
            phase="Phase 4"
            title="What this collection page will become"
            items={[
              'A curated introduction written with editorial context.',
              'Ordered presentation so the works read in sequence.',
              'Related collections and adjacent studio suggestions.',
              'Saving a collection for a later visit.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
