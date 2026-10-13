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
    title: 'Smart explore, search and filters',
    detail:
      'Live search across the sample catalogue, discipline filtering, sorting and honest empty states — with every criterion carried in the address so a view can be shared and stepped back through.',
    status: 'Delivered',
  },
  {
    label: 'Phase 5',
    title: 'Immersive artwork detail experiences',
    detail:
      'Each work presented in full at its own proportions, its record assembled only from real fields, its studio linked, and related works chosen by discipline and shared collection.',
    status: 'Delivered',
  },
  {
    label: 'Phase 6',
    title: 'Artist directory and studio profiles',
    detail:
      'Every creator listed and profiled from real fields, each with its own records and a clear route back to the directory.',
    status: 'Delivered',
  },
  {
    label: 'Phase 7',
    title: 'Collections and curated worlds',
    detail:
      'The collection directory composed as an editorial spread, and a collection page that opens on its own work — with counts that always match the works actually rendered.',
    status: 'Delivered',
  },
  {
    label: 'Phase 8',
    title: 'Curation and catalogue growth',
    detail:
      'Editorial notes with context for each grouping, ordering controls, pagination and deeper filters as the catalogue outgrows one page.',
    status: 'Not started',
  },
  {
    label: 'Phase 9',
    title: 'Studio and seller accounts',
    detail:
      'Seller onboarding with an honest verification step, and profiles the studios maintain themselves. The workspace these will live in exists now as a frontend preview: it holds no account and stores nothing.',
    status: 'Preview',
  },
  {
    label: 'Phase 10',
    title: 'Listings and inventory',
    detail:
      'Listing tools for images, metadata, dimensions and availability, with drafts before anything is published. The listing draft editor exists as a preview — it validates every field and saves none of them.',
    status: 'Preview',
  },
  {
    label: 'Phase 11',
    title: 'Orders, fulfilment and payouts',
    detail:
      'Order handling, shipping options, fees stated plainly and payouts to the studios. The buyer-facing side exists as a preview ahead of its place in the plan: a checkout that validates every section and keeps its order action disabled, and an orders page whose reference, date and despatch lines are placeholders rather than an invented history.',
    status: 'Preview',
  },
  {
    label: 'Phase 12',
    title: 'Artwork commerce and provenance',
    detail:
      'Availability, pricing and currency handling; enquiry and purchase flows; certificates, edition records and provenance history. Pricing, provenance and the certificate design are in place as presentation, and a cart totals only what it can honestly total — nothing here can be bought yet.',
    status: 'Preview',
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
            description="Each phase ships something complete. This page reports the status plainly rather than implying that later phases already exist. Preview means the frontend experience is in place — sometimes ahead of its place in the plan — and says so; the capability behind it is not built."
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
