import { useMemo } from 'react'
import { NavRoutes } from '@/app/routes'
import { ArtworkCard } from '@/components/ArtworkCard/ArtworkCard'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { Button } from '@/components/Button/Button'
import { CollectionCard } from '@/components/CollectionCard/CollectionCard'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator/LoadingIndicator'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { StudioCard } from '@/components/StudioCard/StudioCard'
import { TextLink } from '@/components/TextLink/TextLink'
import { SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, SAMPLE_CREATORS, getArtworkById } from '@/data'
import { buildStudioEntry } from '@/utils/studioProfile'
import { PreviewBlock } from './PreviewBlock'
import styles from './ComponentSections.module.css'

/**
 * Live specimens of every shared component. Each example is the real component
 * with real props — nothing here is a mock-up.
 */
export function ComponentSections() {
  const sample = SAMPLE_ARTWORKS[0]
  const cartWorks = useMemo(() => SAMPLE_ARTWORKS.slice(0, 3), [])
  const sampleCollection = SAMPLE_COLLECTIONS[0]
  const sampleStudio = useMemo(() => buildStudioEntry(SAMPLE_CREATORS[0]), [])

  return (
    <>
      <PreviewBlock
        id="ds-buttons"
        title="Buttons"
        description="One component covers actions and navigation, so dimensions, focus rings and hover behaviour can never drift apart. Minimum height is 40px at the smallest size and 52px at the largest — comfortable touch targets."
      >
        <div className={styles.stack}>
          <div className={styles.row}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="quiet">Quiet</Button>
            <Button disabled>Disabled</Button>
          </div>

          <div className={styles.inverseBed}>
            <Button variant="inverse">Inverse</Button>
            <span className={styles.inverseCaption}>
              Used on the charcoal contrast band, where a dark button would disappear.
            </span>
          </div>

          <div className={styles.row}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div className={styles.row}>
            <Button to={NavRoutes.discover}>Router link</Button>
            <Button href="https://example.com" variant="secondary">
              External anchor
            </Button>
            <Button to={NavRoutes.sell} disabled variant="secondary">
              Disabled link
            </Button>
          </div>

          <p className={styles.caption}>
            Variants: primary, secondary, quiet, inverse. Sizes: sm, md, lg. A disabled link stays visible
            with <code>aria-disabled</code> rather than disappearing.
          </p>
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-links"
        title="Text links"
        description="Inline links for secondary navigation and copy. The arrow glyph is decorative and nudges on hover; reduced-motion visitors see no movement."
      >
        <div className={styles.row}>
          <TextLink to={NavRoutes.collections}>Plain text link</TextLink>
          <TextLink to={NavRoutes.discover} arrow>
            With arrow
          </TextLink>
          <TextLink href="https://example.com" accent>
            Accent, external
          </TextLink>
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-navigation"
        title="Navigation"
        description="The header and footer are the live components: the bar above and the footer below are exactly what every page renders. Below 1024px the primary destinations move into a disclosure panel."
      >
        <div className={styles.stack}>
          <Breadcrumb
            items={[
              { label: 'Home', to: NavRoutes.home },
              { label: 'Explore Art', to: NavRoutes.discover },
              { label: 'A work' },
            ]}
          />
          <p className={styles.navNote}>
            Breadcrumbs appear on nested routes — artwork, collection and artist pages — and the
            final entry is never a link. Skip link: press Tab from the top of the page to reveal
            “Skip to content”.
          </p>
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-headings"
        title="Section heading"
        description="Eyebrow, title, description and an optional trailing action. The heading level is a prop, so page outlines stay hierarchical."
      >
        <SectionHeading
          eyebrow="Eyebrow label"
          title="A section heading with its action"
          description="Descriptions are capped at a readable measure rather than stretching across the viewport."
          action={
            <TextLink to={NavRoutes.discover} arrow>
              Trailing action
            </TextLink>
          }
        />
      </PreviewBlock>

      <PreviewBlock
        id="ds-frames"
        title="Artwork frame"
        description="The primitive behind every artwork presentation. A frame reserves its space from the ratio, so nothing shifts as images load."
      >
        <div className={styles.frameRow}>
          <div className={styles.frameItem}>
            <ArtworkFrame
              src={sample.image.src}
              alt={sample.image.alt}
              width={sample.image.width}
              height={sample.image.height}
              aspect="portrait"
              radius="md"
              elevation="rest"
              sizes="240px"
            />
            <span className={styles.caption}>Portrait · elevated</span>
          </div>
          <div className={styles.frameItem}>
            <ArtworkFrame
              src={SAMPLE_ARTWORKS[1].image.src}
              alt={SAMPLE_ARTWORKS[1].image.alt}
              width={SAMPLE_ARTWORKS[1].image.width}
              height={SAMPLE_ARTWORKS[1].image.height}
              aspect="square"
              radius="md"
              sizes="240px"
            />
            <span className={styles.caption}>Square · radius md</span>
          </div>
          <div className={styles.frameItem}>
            <ArtworkFrame
              src={SAMPLE_ARTWORKS[4].image.src}
              alt={SAMPLE_ARTWORKS[4].image.alt}
              width={SAMPLE_ARTWORKS[4].image.width}
              height={SAMPLE_ARTWORKS[4].image.height}
              aspect="tall"
              radius="sm"
              elevation="rest"
              sizes="240px"
            />
            <span className={styles.caption}>Tall · radius sm, elevated</span>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-cards"
        title="Cards and grids"
        description="Cards are used where grouping genuinely helps: an artwork with its title and medium, a collection with its lead work. The grid is one column on phones, two from 540px and three from 900px."
      >
        <div className={styles.gridSample}>
          <ArtworkCard artwork={sample} sizes="320px" />
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-grid"
        title="Artwork grid"
        description="Used by discover, collection and artist pages. Resize the window to watch the columns change without any content reflow inside the cards."
      >
        <ArtworkGrid artworks={cartWorks} label="Grid specimen" className={styles.gridSample} />
      </PreviewBlock>

      <PreviewBlock
        id="ds-collection-card"
        title="Collection card"
        description="Collections lead with a landscape crop of one work, plus a summary and an honest record count."
      >
        <div className={styles.gridSample}>
          <CollectionCard
            collection={sampleCollection}
            leadArtwork={getArtworkById(sampleCollection.artworkIds[0])}
          />
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-studio-card"
        title="Studio card"
        description="A studio entry leads with that studio's own work — labelled as a sample work, because this build holds no studio photography — followed by its practice, location and record count. A creator with no usable id renders as a static card rather than a link to nowhere."
      >
        <div className={styles.gridSample}>
          <StudioCard entry={sampleStudio} />
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-states"
        title="Empty, loading and placeholder states"
        description="Honest states for areas without content yet. Nothing here imitates live data or activity."
      >
        <div className={styles.stack}>
          <EmptyState
            title="Empty state"
            description="Used where a list genuinely has no content — for example a search with no sample matches."
            action={<Button to={NavRoutes.discover}>A single action</Button>}
          />
          <div className={styles.row}>
            <LoadingIndicator label="Loading route…" />
            <LoadingIndicator label="Preparing works…" />
          </div>
          <p className={styles.caption}>
            The loading indicator is reserved for asynchronous moments such as a lazily loaded route
            chunk. ArtVerse currently ships one static bundle, so page content does not use it yet.
          </p>
        </div>
      </PreviewBlock>
    </>
  )
}
