import { NavRoutes } from '@/app/routes'
import { CollectionGrid } from '@/components/CollectionGrid/CollectionGrid'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { getArtworkById, getCollectionsByIds } from '@/data'
import { HOMEPAGE_COLLECTION_IDS } from '@/data/homepage'
import styles from './CollectionsSection.module.css'

/**
 * Four artistic worlds.
 *
 * The four collections in the sample data, each linking to its own collection
 * route. Every id resolves through `getCollectionsByIds`, so the section can
 * never render a collection that does not exist.
 */
export function CollectionsSection() {
  const collections = getCollectionsByIds(HOMEPAGE_COLLECTION_IDS)

  if (collections.length === 0) return null

  return (
    <Section divided ariaLabelledBy="worlds-title">
      <PageContainer>
        <SectionHeading
          eyebrow="Collections"
          title="Four Artistic Worlds"
          id="worlds-title"
          description="Groupings from the sample catalogue, held together by mood, material and light rather than by category."
          action={
            <TextLink to={NavRoutes.collections} arrow>
              All collections
            </TextLink>
          }
        />

        <CollectionGrid
          className={styles.grid}
          collections={collections}
          columns="two"
          label="Artistic worlds"
          sizes="(max-width: 699px) 92vw, (max-width: 1247px) 45vw, 520px"
          leadArtworkFor={(collection) => getArtworkById(collection.artworkIds[0])}
        />

        <p className={styles.note}>
          Every work on this page is an illustrative sample record created for the ArtVerse build,
          not a live listing from a studio.
        </p>
      </PageContainer>
    </Section>
  )
}
