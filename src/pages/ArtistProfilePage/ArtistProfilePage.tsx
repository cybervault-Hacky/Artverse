import { useParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { NotFoundView } from '@/components/NotFoundView/NotFoundView'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { getArtworksByCreator, getCreatorById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import styles from './ArtistProfilePage.module.css'

/**
 * A single artist or studio profile.
 *
 * Unknown ids render the shared not-found experience. Profiles hold only what
 * genuinely exists today: the placeholder name, its discipline and any
 * sample records attributed to it.
 */
export function ArtistProfilePage() {
  const { artistId } = useParams()
  const creator = getCreatorById(artistId)

  useDocumentTitle({
    title: creator ? creator.name : 'Artist not found',
    description: creator ? `${creator.discipline} on ArtVerse.` : undefined,
  })

  if (!creator) {
    return <NotFoundView subject="artist" reference={artistId} />
  }

  const works = getArtworksByCreator(creator.id)

  return (
    <>
      <PageHeader
        eyebrow={creator.location ? `${creator.discipline} · ${creator.location}` : creator.discipline}
        title={creator.name}
        intro="A placeholder profile in the ArtVerse directory. Real studios will add practice notes, process imagery and the works they are currently showing."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Artists & Studios', to: NavRoutes.artists },
          { label: creator.name },
        ]}
      />

      <Section spacing="tight" ariaLabelledBy="profile-works">
        <PageContainer>
          <p className={styles.placeholderNote}>
            Illustrative entry. No biography, verification, follower count or sales history is
            implied by this page.
          </p>

          <h2 id="profile-works" className="visually-hidden">
            Sample records from this creator
          </h2>

          {works.length > 0 ? (
            <>
              <p className={styles.works}>{countLabel(works.length, 'sample record')}</p>
              <ArtworkGrid artworks={works} label={`Sample records from ${creator.name}`} />
            </>
          ) : (
            <EmptyState
              className={styles.works}
              title="No sample records yet"
              description="This placeholder creator has no illustrative records attached yet."
              action={
                <span className={styles.placeholderNote}>
                  Real studio catalogues follow in a later phase.
                </span>
              }
            />
          )}

          <PhaseNote
            className={styles.note}
            phase="Phase 7"
            title="What this profile will hold"
            items={[
              'A written practice statement from the studio itself.',
              'Process and studio imagery, not just finished work.',
              'The full catalogue with availability per work.',
              'Contact and enquiry routes once those exist.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
