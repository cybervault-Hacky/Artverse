import { Link } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SAMPLE_CREATORS } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import styles from './ArtistsPage.module.css'

/**
 * Artists & Studios directory.
 *
 * The entries are illustrative placeholders: ArtVerse does not invent real
 * artists, biographies or verification badges. The directory is presented as
 * an editorial list rather than a wall of cards, which keeps the page calm and
 * makes the future move to real portraits straightforward.
 */
export function ArtistsPage() {
  useDocumentTitle({
    title: 'Artists & Studios',
    description:
      'The ArtVerse directory of artists and studios — currently shown with illustrative placeholder entries.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Artists & Studios"
        title="The people behind the work"
        intro="Studios, makers and independent artists will each hold a profile here — their practice, their process and the works currently available."
      />

      <Section spacing="tight" ariaLabelledBy="directory-title">
        <PageContainer>
          <h2 id="directory-title" className="visually-hidden">
            Directory
          </h2>

          <p className={styles.introNote}>
            {countLabel(SAMPLE_CREATORS.length, 'illustrative entry', 'illustrative entries')}.
            Names are deliberately generic placeholders used to test routing and typography — no
            real artist, studio or seller is represented.
          </p>

          <ul className={styles.list}>
            {SAMPLE_CREATORS.map((creator) => (
              <li key={creator.id} className={styles.row}>
                <Link className={styles.link} to={NavRoutes.artist(creator.id)}>
                  <span className={styles.name}>{creator.name}</span>
                  <span className={styles.discipline}>{creator.discipline}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <PhaseNote
            className={styles.note}
            phase="Phase 7"
            title="What the directory will hold"
            items={[
              'Real studio profiles with practice, process and location.',
              'Searchable disciplines, mediums and studio sizes.',
              'Availability signals tied to genuine listings.',
              'Following a studio and seeing new work first.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
