import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ArchitectureSection } from './ArchitectureSection'
import { ComponentSections } from './ComponentSections'
import { FoundationSections } from './FoundationSections'
import { MotionSection } from './MotionSection'
import styles from './DesignSystemPage.module.css'

const JUMP_LINKS = [
  { href: '#ds-foundations', label: 'Foundations' },
  { href: '#ds-components', label: 'Components' },
  { href: '#ds-motion', label: 'Motion' },
  { href: '#ds-architecture', label: 'Responsive & architecture' },
]

/**
 * Design system preview.
 *
 * An internal showcase rather than a marketing page: every specimen below is
 * the component the site actually renders, and every value is the token the
 * stylesheet actually consumes.
 */
export function DesignSystemPage() {
  useDocumentTitle({
    title: 'Design system',
    description:
      'The ArtVerse design system: colour, typography, spacing, components, motion and route architecture.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Internal reference"
        title="Design system"
        intro="The tokens, components and behaviours that every ArtVerse page is built from. Each specimen below is live — the same component, with the same tokens, that ships in the product."
      />

      <Section spacing="tight" ariaLabelledBy="ds-intro-note">
        <PageContainer>
          <h2 id="ds-intro-note" className="visually-hidden">
            How to read this page
          </h2>

          <p className={styles.introNote}>
            Nothing on this page is a screenshot or a static mock-up. The header and footer around
            it are the shared components, and the floating composition below is the exact prototype
            used on the homepage.
          </p>

          <nav className={styles.jumpNav} aria-label="Sections of the design system">
            <p className={styles.jumpLabel}>On this page</p>
            <ul className={styles.jumpList}>
              {JUMP_LINKS.map((link) => (
                <li key={link.href}>
                  <a className={styles.jumpLink} href={link.href}>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </PageContainer>
      </Section>

      <Section divided id="ds-foundations" ariaLabelledBy="ds-foundations-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Foundations"
            title="Tokens"
            id="ds-foundations-title"
            description="Colour, type, spacing, radii and elevation. Values are declared once in src/styles/tokens.css; components only ever reference them."
          />
          <FoundationSections />
        </PageContainer>
      </Section>

      <Section divided id="ds-components" ariaLabelledBy="ds-components-title" tone="surface">
        <PageContainer>
          <SectionHeading
            eyebrow="Components"
            title="Interface pieces"
            id="ds-components-title"
            description="A deliberately small set of components, each with one clear responsibility."
          />
          <ComponentSections />
        </PageContainer>
      </Section>

      <Section divided id="ds-motion" ariaLabelledBy="ds-motion-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Motion"
            title="The signature floating composition"
            id="ds-motion-title"
            description="Slow, continuous, and the only place in the interface where movement is decorative."
          />
          <MotionSection />
        </PageContainer>
      </Section>

      <Section divided id="ds-architecture" ariaLabelledBy="ds-architecture-title" tone="surface">
        <PageContainer>
          <SectionHeading
            eyebrow="Architecture"
            title="Responsive behaviour and routes"
            id="ds-architecture-title"
            description="How the layout adapts, how destinations are registered, and how this phase was verified."
          />
          <ArchitectureSection />
        </PageContainer>
      </Section>
    </>
  )
}
