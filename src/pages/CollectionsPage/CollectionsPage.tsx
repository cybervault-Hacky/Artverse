import { NavRoutes } from '@/app/routes'
import { CollectionCard } from '@/components/CollectionCard/CollectionCard'
import { CollectionGrid } from '@/components/CollectionGrid/CollectionGrid'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buildCollectionDirectory } from '@/utils/collections'
import { countLabel } from '@/utils/text'
import styles from './CollectionsPage.module.css'

/**
 * The collection directory.
 *
 * Four collections is not enough to justify filters, sorting or a category
 * system — those would be controls for their own sake. What the page needs is
 * composition, so it is built as an editorial spread rather than a grid of
 * four identical tiles:
 *
 * 1. The first collection is given a full-width moment — a wide image beside
 *    its title, summary and full description.
 * 2. The remaining three sit in a calmer grid beneath it.
 *
 * The scale difference is composition, not a ranking: nothing here calls a
 * collection "featured", "best" or "most popular", and the section copy says
 * plainly that the first is simply shown at full scale. Every card links to its
 * own page and carries an accurate count of what that page will render.
 */
export function CollectionsPage() {
  const [lead, ...rest] = buildCollectionDirectory()

  useDocumentTitle({
    title: 'Collections',
    description:
      'ArtVerse collections — sample groupings that hold works together across studios by mood, material and light rather than by category.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Collections"
        title="Curated Worlds"
        intro="A collection is how ArtVerse holds work together across studios — by mood, material or a shared idea, rather than by category. These four are sample groupings of the illustrative records in this build."
      />

      <Section spacing="tight" ariaLabelledBy="collections-all">
        <PageContainer>
          <div className={styles.heading}>
            <h2 id="collections-all" className={styles.headingTitle}>
              The collections
            </h2>
            <p className={styles.count}>
              {countLabel(buildCollectionDirectory().length, 'sample collection')}
            </p>
          </div>

          <p className={styles.note}>
            The first collection is shown at full scale; the rest follow in a grid. That is a
            composition choice, not a ranking — the groupings are presented in the order the build
            holds them, and nothing here is measured, rated or endorsed.
          </p>

          {lead ? (
            <CollectionCard
              className={styles.feature}
              entry={lead}
              variant="feature"
              sizes="(max-width: 767px) 92vw, 55vw"
            />
          ) : null}

          {rest.length > 0 ? (
            <CollectionGrid
              className={styles.grid}
              entries={rest}
              label="The other sample collections"
              sizes="(max-width: 699px) 92vw, (max-width: 1023px) 45vw, 30vw"
            />
          ) : null}

          {!lead ? (
            <EmptyState
              className={styles.grid}
              title="No collections yet"
              description="This build ships an illustrative sample set. When collections are added, they appear here automatically."
            />
          ) : null}

          <p className={styles.crossLink}>
            Collections cut across studios rather than following them — the same work can sit in more
            than one. To browse by discipline instead, start from{' '}
            <TextLink to={NavRoutes.discover}>Explore Art</TextLink>, or meet the makers in the{' '}
            <TextLink to={NavRoutes.artists}>studio directory</TextLink>.
          </p>

          <PhaseNote
            className={styles.phase}
            phase="Phase 8"
            title="How collections grow from here"
            description="The directory and the collection pages are in place. What is still missing needs curation and a larger catalogue behind it."
            items={[
              'Editorial notes written with context for each grouping.',
              'Ordering controls, so a collection can read as a narrative.',
              'Pagination and deeper filters as the catalogue outgrows one page.',
              'Collector-facing groupings, such as saved works.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
