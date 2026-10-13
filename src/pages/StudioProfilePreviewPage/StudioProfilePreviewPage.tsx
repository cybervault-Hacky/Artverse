import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import { buildStudioFacts, studioPracticeLine } from '@/utils/studioProfile'
import { PREVIEW_STUDIO_NOTE, WORKSPACE_PREVIEW_NOTICE, getPreviewStudioEntry } from '@/utils/sellerStudio'
import styles from './StudioProfilePreviewPage.module.css'

/** What a signed-in seller would eventually be able to edit — none of it yet. */
const EDITABLE_LATER = [
  {
    field: 'Name and practice',
    detail: 'The studio name and the discipline line, as they appear in the directory.',
  },
  {
    field: 'Location',
    detail: 'Where the studio works from, shown beside its practice.',
  },
  {
    field: 'Practice note',
    detail: 'A short note in the studio’s own voice about how the work is made.',
  },
  {
    field: 'Works',
    detail: 'Which records are published, and the images that represent them.',
  },
]

/**
 * The studio profile preview.
 *
 * The public studio page already exists, so this screen does not rebuild it: it
 * renders the *same* model — `buildStudioEntry` and `buildStudioFacts`, the
 * functions the directory and profile use — and puts the two states side by
 * side, so the difference between an illustrative sample record and an editable
 * seller profile is stated rather than implied.
 */
export function StudioProfilePreviewPage() {
  // The preview studio, resolved from the real creator record and built with
  // the same model the public directory uses — never a stand-in object.
  const entry = getPreviewStudioEntry()

  useDocumentTitle({
    title: 'Studio profile preview',
    description:
      'How a studio appears publicly on ArtVerse, rendered from the same model the directory uses, beside the profile a seller would eventually edit.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Artist studio"
        title="Studio profile preview"
        intro="This is the public side of the workspace: the same record the directory shows, rendered with the same components. A signed-in seller would edit the fields below it."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'For Artists', to: NavRoutes.sell },
          { label: 'Studio workspace', to: NavRoutes.studio },
          { label: 'Studio profile' },
        ]}
      />

      <PreviewNotice>{WORKSPACE_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="profile-public">
        <PageContainer>
          <div className={styles.columns}>
            <article className={styles.publicPanel}>
              <div className={styles.panelHead}>
                <h2 id="profile-public" className={styles.panelTitle}>
                  What the public profile shows
                </h2>
                <StatusTag tone="quiet">Sample record</StatusTag>
              </div>
              <p className={styles.panelNote}>{PREVIEW_STUDIO_NOTE}</p>

              {entry ? (
                <>
                  <div className={styles.identity}>
                    <h3 className={styles.identityName}>{entry.name}</h3>
                    {studioPracticeLine(entry) ? (
                      <p className={styles.identityPractice}>{studioPracticeLine(entry)}</p>
                    ) : null}
                    {entry.practiceNote ? (
                      <p className={styles.identityNote}>{entry.practiceNote}</p>
                    ) : (
                      <p className={styles.identityEmpty}>
                        This record carries no practice note, and none is invented for it.
                      </p>
                    )}
                  </div>

                  <dl className={styles.facts}>
                    {buildStudioFacts(entry).map((fact) => (
                      <div className={styles.factRow} key={fact.label}>
                        <dt className={styles.factLabel}>{fact.label}</dt>
                        <dd className={styles.factValue}>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className={styles.actions}>
                    {entry.href ? (
                      <Button to={entry.href} variant="secondary">
                        Open the live public profile
                      </Button>
                    ) : null}
                    <Button to={NavRoutes.artists} variant="quiet">
                      Studio directory
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No studio record found"
                  description="The preview studio could not be resolved from the sample data."
                  headingLevel="h3"
                />
              )}
            </article>

            <article className={styles.editPanel}>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>What a seller would edit</h2>
                <StatusTag tone="neutral">Not built yet</StatusTag>
              </div>
              <p className={styles.panelNote}>
                Editable profiles arrive with seller accounts. This build holds one record per studio
                and no account to own it, so every field below is read-only for now.
              </p>

              <dl className={styles.editable}>
                {EDITABLE_LATER.map((item) => (
                  <div className={styles.editableRow} key={item.field}>
                    <dt className={styles.editableField}>{item.field}</dt>
                    <dd className={styles.editableDetail}>{item.detail}</dd>
                  </div>
                ))}
              </dl>

              <p className={styles.editClosing}>
                Until then, a studio’s record is written into the sample data. Nothing on this page
                can change it — not the workspace, and not this preview.
              </p>
            </article>
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="profile-works">
        <PageContainer>
          <SectionHeading
            id="profile-works"
            eyebrow="On the public page"
            title="The records this studio shows"
            description={
              entry
                ? `${countLabel(entry.workCount, 'sample record')}, taken from the same relationship the directory and the catalogue use.`
                : 'No records resolved for this studio.'
            }
          />

          {entry?.hasWorks ? (
            <ArtworkGrid
              className={styles.works}
              artworks={entry.works}
              label={`Sample records attributed to ${entry.name}`}
              aspect="portrait"
            />
          ) : (
            <EmptyState
              className={styles.works}
              title="No sample records attributed to this studio"
              description="The profile lists a studio's own works and nothing else, so it stays empty rather than showing somebody else's."
              headingLevel="h3"
            />
          )}

          <p className={styles.closing}>
            The public profile is generated from this record on every visit — the same fields, the
            same components, the same order.{' '}
            <TextLink to={NavRoutes.studioListings}>Prepare a listing draft</TextLink> to see the
            editing side.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
