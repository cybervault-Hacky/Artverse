import { useParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { NotFoundView } from '@/components/NotFoundView/NotFoundView'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { getCollectionById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buildCollectionEntry } from '@/utils/collections'
import { countLabel } from '@/utils/text'
import styles from './CollectionDetailPage.module.css'

/**
 * A single collection.
 *
 * The page opens with an editorial hero rather than the shared page header, so
 * a collection reads differently from an artwork page: one of the collection's
 * own works runs wide across the page as a band, and the title, description and
 * count sit beneath it on the canvas. Deliberately unlike the artwork detail
 * hero, which pairs a single work with its record side by side.
 *
 * Three things it does not do:
 * - It never presents the representative work as anything more than a sample
 *   image from the collection. There is no invented curator, no provenance and
 *   no story attached to it.
 * - It shows only the works the collection actually resolves to. The count, the
 *   hero caption and the grid all read the same resolved list.
 * - It never renders an image it cannot request: a collection whose works carry
 *   no usable image gets a rule-topped hero with no image at all.
 *
 * An unknown id renders the shared not-found experience, as everywhere else.
 */
export function CollectionDetailPage() {
  const { collectionId } = useParams()
  const collection = getCollectionById(collectionId)

  const entry = collection ? buildCollectionEntry(collection) : undefined

  useDocumentTitle({
    title: entry ? entry.collection.title : 'Collection not found',
    description: entry?.summary,
  })

  if (!entry) {
    return <NotFoundView subject="collection" reference={collectionId} />
  }

  const { collection: record, works, workCount, leadWork, hasWorks } = entry
  const title = record.title

  return (
    <>
      <PageContainer>
        <Breadcrumb
          className={styles.crumbs}
          items={[
            { label: 'Home', to: NavRoutes.home },
            { label: 'Collections', to: NavRoutes.collections },
            { label: title },
          ]}
        />
      </PageContainer>

      <Section spacing="tight" ariaLabelledBy="collection-title">
        <PageContainer>
          <article>
            {leadWork ? (
              <figure className={styles.hero}>
                <ArtworkFrame
                  className={styles.heroFrame}
                  src={leadWork.image.src}
                  alt={leadWork.image.alt}
                  width={leadWork.image.width}
                  height={leadWork.image.height}
                  aspect="landscape"
                  ratio={leadWork.image.width / leadWork.image.height}
                  radius="md"
                  elevation="rest"
                  loading="eager"
                  sizes="(min-width: 1200px) 1104px, 92vw"
                />
                <figcaption className={styles.heroCaption}>
                  <span className={styles.heroWork}>{leadWork.title}</span>
                  <span className={styles.heroDivider} aria-hidden="true">
                    ·
                  </span>
                  <span>{leadWork.medium}</span>
                  <span className={styles.heroDivider} aria-hidden="true">
                    ·
                  </span>
                  <span>A sample image from this collection</span>
                </figcaption>
              </figure>
            ) : null}

            <div className={styles.intro}>
              <p className={styles.eyebrow}>Sample collection</p>
              <h1 className={styles.title} id="collection-title">
                {title}
              </h1>

              {entry.description ? (
                <p className={styles.description}>{entry.description}</p>
              ) : entry.summary ? (
                <p className={styles.description}>{entry.summary}</p>
              ) : (
                <p className={styles.descriptionMissing}>
                  No description has been written for this collection yet.
                </p>
              )}

              <div className={styles.meta}>
                <span>{countLabel(workCount, 'work')} in this collection</span>
                <span>Illustrative sample records</span>
              </div>
            </div>
          </article>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="collection-works">
        <PageContainer>
          <h2 id="collection-works" className={styles.worksHeading}>
            Works in this collection
          </h2>

          {hasWorks ? (
            <ArtworkGrid
              className={styles.grid}
              artworks={works}
              label={`Works in ${title}`}
              aspect="portrait"
            />
          ) : (
            <EmptyState
              className={styles.grid}
              title="No works in this collection yet"
              description={`Nothing in this build is attributed to ${title}. The catalogue holds every record, and this page will only ever list works the collection actually holds.`}
              action={<Button to={NavRoutes.discover}>Browse the catalogue</Button>}
            />
          )}

          <div className={styles.returnRow}>
            <Button to={NavRoutes.collections} variant="secondary">
              All collections
            </Button>
            <Button to={NavRoutes.discover} variant="quiet">
              Explore Art
            </Button>
          </div>

          <PhaseNote
            className={styles.note}
            phase="Phase 8"
            title="What this collection page will carry later"
            description="The presentation is in place. What follows needs editorial work and a larger catalogue behind it."
            items={[
              'Curator’s notes written with context for each grouping.',
              'An intentional order, so the works read as a sequence.',
              'Related collections and adjacent studios.',
              'Saving a collection for a later visit.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
