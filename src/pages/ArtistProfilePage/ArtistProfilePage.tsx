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
import { getCreatorById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  NO_PRACTICE_NOTE,
  buildStudioEntry,
  buildStudioFacts,
  studioPracticeLine,
} from '@/utils/studioProfile'
import { countLabel } from '@/utils/text'
import styles from './ArtistProfilePage.module.css'

/**
 * A single studio profile.
 *
 * The page holds only what genuinely exists in this build: the record's name,
 * its practice and location, the practice note it carries, and the sample works
 * attributed to it by `creatorId`. Three deliberate decisions:
 *
 * 1. The lead image is the studio's own work, captioned as a work. There is no
 *    portrait here because none exists — presenting a photograph of a person
 *    who does not exist would be fabrication, and the caption says so plainly.
 * 2. A creator without a practice note is told so. The alternative — writing a
 *    plausible artist statement for a placeholder — is exactly the kind of
 *    invention this build avoids everywhere else.
 * 3. The records section lists that creator's works and nothing else. A studio
 *    with no records gets an empty state that points at the catalogue, rather
 *    than a grid of somebody else's work.
 *
 * Unknown ids render the shared not-found experience, as everywhere else.
 */
export function ArtistProfilePage() {
  const { artistId } = useParams()
  const creator = getCreatorById(artistId)

  const entry = creator ? buildStudioEntry(creator) : undefined

  useDocumentTitle({
    title: entry ? entry.name : 'Studio not found',
    description: entry ? `${entry.practice ?? 'Studio'} on ArtVerse.` : undefined,
  })

  if (!entry) {
    return <NotFoundView subject="artist" reference={artistId} />
  }

  const practiceLine = studioPracticeLine(entry)
  const facts = buildStudioFacts(entry)

  return (
    <>
      <PageContainer>
        <Breadcrumb
          className={styles.crumbs}
          items={[
            { label: 'Home', to: NavRoutes.home },
            { label: 'Artists & Studios', to: NavRoutes.artists },
            { label: entry.name },
          ]}
        />
      </PageContainer>

      <Section spacing="tight" ariaLabelledBy="studio-title">
        <PageContainer>
          <article className={entry.leadWork ? styles.masthead : styles.mastheadSolo}>
            {entry.leadWork ? (
              <div className={styles.media}>
                <ArtworkFrame
                  src={entry.leadWork.image.src}
                  alt={entry.leadWork.image.alt}
                  width={entry.leadWork.image.width}
                  height={entry.leadWork.image.height}
                  aspect="portrait"
                  radius="md"
                  elevation="rest"
                  loading="eager"
                  sizes="(min-width: 1024px) 42vw, (min-width: 768px) 45vw, 92vw"
                />
                <p className={styles.caption}>
                  A sample work from this studio — shown in place of a portrait, since this build
                  holds no studio photography.
                </p>
              </div>
            ) : null}

            <div className={styles.identity}>
              {practiceLine ? <p className={styles.eyebrow}>{practiceLine}</p> : null}
              <h1 className={styles.title} id="studio-title">
                {entry.name}
              </h1>

              {entry.practiceNote ? (
                <p className={styles.bio}>{entry.practiceNote}</p>
              ) : (
                <p className={styles.bioMissing}>{NO_PRACTICE_NOTE}</p>
              )}

              {entry.illustrative ? (
                <p className={styles.notice}>
                  Illustrative placeholder profile. No biography, verification, follower count or
                  sales history is implied by this page.
                </p>
              ) : null}

              <dl className={styles.facts}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.factRow}>
                    <dt className={styles.factLabel}>{fact.label}</dt>
                    <dd className={styles.factValue}>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className={styles.actions}>
                <Button to={NavRoutes.artists} variant="secondary">
                  All artists &amp; studios
                </Button>
                <Button to={NavRoutes.discover} variant="quiet">
                  Explore Art
                </Button>
              </div>
            </div>
          </article>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="studio-works">
        <PageContainer>
          <div className={styles.worksHeading}>
            <h2 id="studio-works" className={styles.worksTitle}>
              Sample records from this studio
            </h2>
            <p className={styles.worksCount}>
              {countLabel(entry.workCount, 'record')} attributed to {entry.name}
            </p>
          </div>

          {entry.hasWorks ? (
            <ArtworkGrid
              className={styles.works}
              artworks={entry.works}
              label={`Sample records from ${entry.name}`}
            />
          ) : (
            <EmptyState
              className={styles.works}
              title="No records from this studio yet"
              description={`Nothing in this build is attributed to ${entry.name}. The catalogue holds the illustrative sample set, and its records are the only ones this page will ever list.`}
              action={<Button to={NavRoutes.discover}>Browse the catalogue</Button>}
            />
          )}

          <PhaseNote
            className={styles.note}
            phase="Phase 8"
            title="What this profile will carry later"
            description="The profile itself is in place. What follows has to come from the studio, or from accounts that do not exist yet."
            items={[
              'A practice statement written and maintained by the studio.',
              'Process and studio photography in place of a sample work.',
              'The full catalogue, with availability per work.',
              'Contact and enquiry routes once sellers hold accounts.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
