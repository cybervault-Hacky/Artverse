import { NavRoutes } from '@/app/routes'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { StudioCard } from '@/components/StudioCard/StudioCard'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { buildStudioDirectory } from '@/utils/studioProfile'
import { countLabel } from '@/utils/text'
import styles from './ArtistsPage.module.css'

/**
 * Artists & Studios — the studio directory.
 *
 * Every creator record in the data layer appears here, because the directory is
 * the catalogue of studios rather than a curated selection of them. Two
 * deliberate decisions:
 *
 * 1. Each card leads with the studio's *own* work, labelled as a sample work.
 *    This build holds no studio photography, and using a work is the one image
 *    relationship the data actually supports — the alternative would be
 *    inventing portraits of people who do not exist.
 * 2. Nothing here counts, ranks or scores anyone: no follower numbers, no sales,
 *    no ratings, no "featured" ordering. The list is the data's own order, and
 *    every entry says plainly that it is illustrative.
 */
export function ArtistsPage() {
  const studios = buildStudioDirectory()

  useDocumentTitle({
    title: 'Artists & Studios',
    description:
      'The ArtVerse directory of artists, studios and makers — each entry showing its practice, where it is based and the sample records it holds.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Artists & Studios"
        intro="The people behind the work. Each entry here is an illustrative placeholder profile — its practice, where it is based, and the sample records held in this build."
      />

      <Section spacing="tight" ariaLabelledBy="directory-title">
        <PageContainer>
          <div className={styles.heading}>
            <h2 id="directory-title" className={styles.headingTitle}>
              The directory
            </h2>
            <p className={styles.count}>
              {countLabel(studios.length, 'illustrative entry', 'illustrative entries')}
            </p>
          </div>

          <p className={styles.introNote}>
            Names are deliberately generic placeholders used to test routing and typography — no real
            artist, studio or seller is represented, and the images are each studio’s own sample work
            rather than photographs of a person.
          </p>

          {studios.length > 0 ? (
            <ul className={styles.grid}>
              {studios.map((entry) => (
                <li key={entry.creator.id} className={styles.item}>
                  <StudioCard entry={entry} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className={styles.grid}
              title="No studios in the directory yet"
              description="This build ships an illustrative sample set. When creator records are added, they appear here automatically."
            />
          )}

          <PhaseNote
            className={styles.note}
            phase="Phase 8"
            title="What the directory will carry later"
            description="The listing itself is in place. What is still missing is everything that has to come from the studios rather than from this build."
            items={[
              'Profiles written and maintained by the studios themselves.',
              'Process and studio photography in place of a sample work.',
              'Availability signals tied to genuine listings.',
              'Following a studio, and seeing new work from it first.',
            ]}
          />

          <p className={styles.crossLink}>
            Looking for the work rather than the people? Browse{' '}
            <TextLink to={NavRoutes.discover}>Explore Art</TextLink> or start from a{' '}
            <TextLink to={NavRoutes.collections}>collection</TextLink>.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
