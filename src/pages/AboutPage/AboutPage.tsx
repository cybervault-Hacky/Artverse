import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './AboutPage.module.css'

const PRINCIPLES = [
  {
    title: 'Clarity over decoration',
    text: 'No badges, counters or effects that are not doing real work. Every element on a page has to earn its place.',
  },
  {
    title: 'Space as a material',
    text: 'Warm white, restrained borders and generous rhythm, so a single work can hold a page on its own.',
  },
  {
    title: 'Honest states',
    text: 'If something is not built yet, the page says so. Nothing on ArtVerse imitates a finished marketplace.',
  },
]

const PHASES = [
  {
    label: 'Phase 1',
    title: 'Foundation and design system',
    detail:
      'Project setup, design tokens, shared components, route architecture and the page foundations behind every destination.',
    status: 'Delivered',
  },
  {
    label: 'Phase 2',
    title: 'Homepage and floating art',
    detail:
      'The editorial homepage: the floating-art hero, the five creative disciplines, the artwork spotlight and the artist invitation.',
    status: 'Delivered',
  },
  {
    label: 'Phase 3',
    title: 'Art universe and immersive discovery',
    detail:
      'The discovery catalogue: a discipline index, every sample record in one balanced grid, and the collection groupings.',
    status: 'Delivered',
  },
  {
    label: 'Phase 4',
    title: 'Catalogue filtering and search',
    detail: 'Filtering, sorting, pagination and indexed search across the whole catalogue.',
    status: 'Not started',
  },
  {
    label: 'Phase 5',
    title: 'Collections and curation',
    detail: 'Editorial collections, studio series and the curation tools behind them.',
    status: 'Not started',
  },
  {
    label: 'Phase 6',
    title: 'Artwork detail and commerce',
    detail: 'Provenance, certificates, availability and the purchase journey.',
    status: 'Not started',
  },
  {
    label: 'Phase 7',
    title: 'Studios and sellers',
    detail: 'Seller accounts, studio profiles, listing tools, orders and payouts.',
    status: 'Not started',
  },
]

export function AboutPage() {
  useDocumentTitle({
    title: 'About',
    description:
      'What ArtVerse is, the principles behind it, and exactly what has been delivered so far.',
  })

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A marketplace built calmly, in the open"
        intro="ArtVerse is a global marketplace for paintings, digital works and handmade objects. It is being built in phases so that each part is finished properly before the next begins."
        actions={
          <>
            <Button to={NavRoutes.designSystem} variant="secondary">
              Design system
            </Button>
            <Button to={NavRoutes.discover} variant="quiet">
              Explore Art
            </Button>
          </>
        }
      />

      <Section spacing="tight" ariaLabelledBy="about-intent">
        <PageContainer>
          <div className={styles.block}>
            <SectionHeading
              eyebrow="Intent"
              title="What ArtVerse is for"
              id="about-intent"
            />
            <div className={styles.prose}>
              <p>
                <strong>
                  Where Art Finds Its Universe.
                </strong>{' '}
                The tagline is the brief: a place where a single work can be seen properly, and
                where the studios behind it are easy to find — from a phone, on a slow connection,
                in any city.
              </p>
              <p>
                Most art marketplaces optimise for volume. ArtVerse optimises for attention: fewer
                elements on a page, a quieter palette, typography that carries a work rather than
                competing with it.
              </p>
            </div>
          </div>

          <div className={styles.principles}>
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className={styles.principle}>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleText}>{principle.text}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" tone="surface" ariaLabelledBy="about-phases">
        <PageContainer>
          <SectionHeading
            eyebrow="Roadmap"
            title="How the build is sequenced"
            id="about-phases"
            description="Each phase ships something complete. This page reports the status plainly rather than implying that later phases already exist."
          />

          <div className={styles.phases}>
            {PHASES.map((phase) => (
              <div key={phase.label} className={styles.phaseRow}>
                <span className={styles.phaseLabel}>{phase.label}</span>
                <div>
                  <p className={styles.phaseTitle}>{phase.title}</p>
                  <p className={styles.phaseDetail}>{phase.detail}</p>
                  <p className={styles.status}>
                    <span className={styles.statusDot} aria-hidden="true" />
                    {phase.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.sampleNote}>
            Sample artwork records and creator names across ArtVerse are illustrative placeholders
            created for layout and routing work. They are not real artists, listings, sales or
            testimonials. See how they are used on the{' '}
            <TextLink to={NavRoutes.designSystem}>design system</TextLink> page.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
