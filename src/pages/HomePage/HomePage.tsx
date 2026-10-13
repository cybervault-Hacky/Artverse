import { NavRoutes } from '@/app/routes'
import { Button } from '@/components/Button/Button'
import { FloatingArtwork } from '@/components/FloatingArtwork/FloatingArtwork'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { getArtworkById } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './HomePage.module.css'

/** Four records that give the floating composition a balanced mix of shapes. */
const HERO_WORK_IDS = [
  'sample-painting-01',
  'sample-handmade-01',
  'sample-decor-01',
  'sample-digital-01',
]

const PILLARS = [
  {
    title: 'A calm design system',
    text: 'Warm whites, near-black type and one champagne accent, with a single typographic scale shared by every page.',
    link: 'See the design system',
    to: NavRoutes.designSystem,
  },
  {
    title: 'Components with one job',
    text: 'Frames, cards, headings and controls are built once and composed, so nothing drifts between destinations.',
    link: 'Review the components',
    to: NavRoutes.designSystem,
  },
  {
    title: 'Routes that stand alone',
    text: 'Every destination is its own page with real URLs, browser history, refresh support and an honest 404.',
    link: 'Start exploring',
    to: NavRoutes.discover,
  },
]

export function HomePage() {
  useDocumentTitle({
    description:
      'ArtVerse — Where Art Finds Its Universe. A global marketplace for paintings, digital works and handmade objects.',
  })

  const heroWorks = HERO_WORK_IDS.map((id) => getArtworkById(id)).filter(
    (artwork) => artwork !== undefined,
  )

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <PageContainer>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Phase 1 foundation</p>
              <h1 className={styles.title} id="hero-title">
                Where Art Finds Its Universe.
              </h1>
              <p className={styles.lead}>
                ArtVerse is being built as a global marketplace for paintings, digital works and
                handmade objects — calm, spacious and easy to browse, from a phone in any city.
              </p>
              <div className={styles.actions}>
                <Button to={NavRoutes.discover} size="lg">
                  Explore Art
                </Button>
                <Button to={NavRoutes.artists} variant="secondary" size="lg">
                  Meet the studios
                </Button>
              </div>
              <p className={styles.phaseNote}>
                This is the Phase 1 build: the design system, layout and route architecture are in
                place, and the works shown here are illustrative sample records rather than live
                listings.
              </p>
            </div>

            <FloatingArtwork works={heroWorks} />
          </div>
        </PageContainer>
      </section>

      <Section divided aria-labelledby="foundation-title">
        <PageContainer>
          <SectionHeading
            eyebrow="The foundation"
            title="Built as a system, not as a set of pages"
            description="Phase 1 establishes the parts that every later phase will reuse. Nothing here imitates a finished marketplace."
            as="h2"
            id="foundation-title"
          />

          <div className={styles.pillars}>
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className={styles.pillar}>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarText}>{pillar.text}</p>
                <TextLink to={pillar.to} arrow>
                  {pillar.link}
                </TextLink>
              </div>
            ))}
          </div>

          <PhaseNote
            className={styles.foundationNote}
            phase="the next phases"
            title="Still to be built"
            description="These are intentionally absent from Phase 1 — no partial versions, no placeholders that pretend to work."
            items={[
              'The complete homepage with its editorial sections and curated rows.',
              'Full Explore Art browsing with filters, sorting and pagination.',
              'Artwork detail experiences with provenance, certificates and enquiry flows.',
              'Seller onboarding, studio profiles and listing tools.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
