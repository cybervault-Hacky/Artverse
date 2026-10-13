import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import { buildStudioFacts, studioPracticeLine } from '@/utils/studioProfile'
import {
  STUDIO_SECTIONS,
  WORKSPACE_NOT_INCLUDED,
  WORKSPACE_PREVIEW_NOTICE,
  buildStudioOverview,
} from '@/utils/sellerStudio'
import styles from './StudioOverviewPage.module.css'

/**
 * The workspace overview.
 *
 * A workspace is easy to make dishonest: a grid of panels with numbers in them
 * implies data that does not exist. This page shows only figures it can derive
 * — how many records the preview studio holds, and how many of them carry each
 * field — and states plainly that ArtVerse has no sales, revenue, orders or
 * engagement of any kind to report.
 */
export function StudioOverviewPage() {
  const overview = buildStudioOverview()
  const entry = overview.entry

  useDocumentTitle({
    title: 'Studio workspace',
    description:
      'The ArtVerse seller studio workspace preview: what it holds today, what the records carry, and what is deliberately absent.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Artist studio"
        title="Studio workspace"
        intro="This is where an artist will present work, prepare listings and keep a studio profile. Today it is a frontend preview — a real workspace behind it needs accounts, storage and a catalogue of its own."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'For Artists', to: NavRoutes.sell },
          { label: 'Studio workspace' },
        ]}
      />

      <PreviewNotice>{WORKSPACE_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="studio-preview-studio">
        <PageContainer>
          <div className={styles.panels}>
            <article className={styles.panel}>
              <h2 id="studio-preview-studio" className={styles.panelTitle}>
                The studio this preview shows
              </h2>

              {entry ? (
                <>
                  <div className={styles.identity}>
                    {entry.leadWork ? (
                      <ArtworkFrame
                        className={styles.identityFrame}
                        src={entry.leadWork.image.src}
                        alt={entry.leadWork.image.alt}
                        width={entry.leadWork.image.width}
                        height={entry.leadWork.image.height}
                        aspect="portrait"
                        radius="sm"
                        sizes="(max-width: 767px) 40vw, 12rem"
                      />
                    ) : null}

                    <div className={styles.identityBody}>
                      <h3 className={styles.identityName}>{entry.name}</h3>
                      {studioPracticeLine(entry) ? (
                        <p className={styles.identityPractice}>{studioPracticeLine(entry)}</p>
                      ) : null}
                      {entry.leadWork ? (
                        <p className={styles.identityCaption}>
                          Sample work: {entry.leadWork.title}
                        </p>
                      ) : null}
                    </div>
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
                        View the public profile
                      </Button>
                    ) : null}
                    <Button to={NavRoutes.studioProfile} variant="quiet">
                      Profile preview
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No studio record found"
                  description="The preview studio could not be resolved from the sample data, so there is nothing to show here."
                  headingLevel="h3"
                />
              )}
            </article>

            <article className={styles.panel}>
              <h2 className={styles.panelTitle}>What the records carry</h2>
              <p className={styles.panelIntro}>
                Counted from {countLabel(overview.workCount, 'sample record')} attributed to{' '}
                {entry ? entry.name : 'this studio'} in this build. These are field counts from the
                data — not sales, revenue, views or any other measure of a marketplace.
              </p>

              {overview.workCount > 0 ? (
                <dl className={styles.coverage}>
                  {overview.coverage.map((row) => (
                    <div className={styles.coverageRow} key={row.label}>
                      <dt className={styles.coverageLabel}>{row.label}</dt>
                      <dd
                        className={
                          row.recorded === row.total ? styles.coverageFull : styles.coveragePartial
                        }
                      >
                        {`${row.recorded} of ${row.total}`}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={styles.panelIntro}>
                  No records are attributed to this studio, so there is nothing to count.
                </p>
              )}

              <p className={styles.panelNote}>
                The rest of the catalogue belongs to other illustrative studios:{' '}
                {countLabel(overview.otherStudioCount, 'record')} of{' '}
                {countLabel(overview.catalogueCount, 'record')} are not this studio&rsquo;s. The
                listings section shows only its own.
              </p>
            </article>
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="studio-sections">
        <PageContainer>
          <SectionHeading
            id="studio-sections"
            eyebrow="Inside the workspace"
            title="Three sections, all of them previews"
            description="Each one is a real screen with real layout and real validation — and none of them is connected to anything that stores data."
          />

          <ul className={styles.sections}>
            {STUDIO_SECTIONS.map((section) => (
              <li className={styles.section} key={section.id}>
                <h3 className={styles.sectionTitle}>
                  <TextLink to={section.to}>{section.label}</TextLink>
                </h3>
                <p className={styles.sectionText}>{section.description}</p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="studio-absent">
        <PageContainer>
          <SectionHeading
            id="studio-absent"
            eyebrow="Deliberately absent"
            title="What this workspace does not do"
            description="Stated here rather than left to be discovered by clicking."
          />

          <ul className={styles.absent}>
            {WORKSPACE_NOT_INCLUDED.map((item) => (
              <li className={styles.absentItem} key={item}>
                {item}
              </li>
            ))}
          </ul>

          <p className={styles.closing}>
            {overview.workCount === 0
              ? 'When records are added to this studio, they appear here automatically.'
              : 'Everything on this page is derived from the sample data in this build. When real studios arrive, the same layout will carry their own records.'}{' '}
            See <TextLink to={NavRoutes.sell}>how the artist experience is being built</TextLink>{' '}
            for what comes next.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
