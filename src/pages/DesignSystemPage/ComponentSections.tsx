import { useMemo } from 'react'
import { NavRoutes } from '@/app/routes'
import { ArtworkCard } from '@/components/ArtworkCard/ArtworkCard'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { Button } from '@/components/Button/Button'
import { CollectionCard } from '@/components/CollectionCard/CollectionCard'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { FormField } from '@/components/FormField/FormField'
import { LoadingIndicator } from '@/components/LoadingIndicator/LoadingIndicator'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { PriceLine } from '@/components/PriceLine/PriceLine'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { StudioCard } from '@/components/StudioCard/StudioCard'
import { TextLink } from '@/components/TextLink/TextLink'
import { SAMPLE_ARTWORKS, SAMPLE_COLLECTIONS, SAMPLE_CREATORS } from '@/data'
import { buildCollectionEntry } from '@/utils/collections'
import { buildStudioEntry } from '@/utils/studioProfile'
import { ILLUSTRATIVE_PRICE, ILLUSTRATIVE_PRICE_LABEL, formatPrice } from '@/utils/pricing'
import { cartTotal } from '@/utils/buyerJourney'
import { PreviewBlock } from './PreviewBlock'
import styles from './ComponentSections.module.css'

/**
 * Live specimens of every shared component. Each example is the real component
 * with real props — nothing here is a mock-up.
 */
export function ComponentSections() {
  const sample = SAMPLE_ARTWORKS[0]
  const cartWorks = useMemo(() => SAMPLE_ARTWORKS.slice(0, 3), [])
  const sampleStudio = useMemo(() => buildStudioEntry(SAMPLE_CREATORS[0]), [])
  const sampleCollectionEntry = useMemo(() => buildCollectionEntry(SAMPLE_COLLECTIONS[0]), [])
  const samplePrice = useMemo(() => formatPrice(ILLUSTRATIVE_PRICE), [])

  /*
   * The four states a cart total can be in, built from the model the cart uses.
   * They are specimens, not data: the two priced carts below are assembled here
   * from the illustrative amount, and no record in the catalogue carries one.
   */
  const pricedSpecimen = (amount: number, currency: string) => ({
    ...SAMPLE_ARTWORKS[0],
    price: { amount, currency },
  })
  const totalSpecimens = useMemo(
    () => [
      { label: 'A cart with no prices in it', total: cartTotal(SAMPLE_ARTWORKS.slice(0, 2)) },
      { label: 'A cart priced in one currency', total: cartTotal([pricedSpecimen(2400, 'USD'), pricedSpecimen(600, 'USD')]) },
      { label: 'A cart priced in two currencies', total: cartTotal([pricedSpecimen(2400, 'USD'), pricedSpecimen(600, 'INR')]) },
      { label: 'A cart priced in one currency, with an unpriced work beside it', total: cartTotal([pricedSpecimen(2400, 'USD'), SAMPLE_ARTWORKS[1]]) },
    ],
    [],
  )

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
          <CollectionCard entry={sampleCollectionEntry} />
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
          <PreviewNotice>
            The preview notice states what a screen is not, before anything on it is used. Every
            seller workspace screen carries one.
          </PreviewNotice>
          <div className={styles.row}>
            <StatusTag tone="accent">Preview</StatusTag>
            <StatusTag tone="neutral">Draft in progress</StatusTag>
            <StatusTag tone="quiet">Sample record</StatusTag>
          </div>
          <div className={styles.formSpecimen}>
            <FormField
              id="ds-field-plain"
              label="Title"
              hint="Hints explain the field before it is filled in."
            >
              <input type="text" defaultValue="A field with a hint" />
            </FormField>
            <FormField
              id="ds-field-error"
              label="Year"
              hint="Optional fields stay optional."
              error="Enter a four-digit year, e.g. 2024."
            >
              <input type="text" defaultValue="12" />
            </FormField>
          </div>
          {samplePrice ? (
            <PriceLine price={samplePrice} note={ILLUSTRATIVE_PRICE_LABEL} />
          ) : null}
          <p className={styles.caption}>
            A price is always an amount *and* its ISO 4217 code, never a symbol on its own, and
            nothing in the build converts one currency into another. The amount above is the only
            one in the repository: it belongs to no record, which is why the label says so. Every
            sample record without a price states that instead — provenance works the same way, so
            attribution is presented as a catalogue record rather than an authentication, and a
            record with no statement says it has none rather than being given one.
          </p>
          <p className={styles.caption}>
            The loading indicator is reserved for asynchronous moments such as a lazily loaded route
            chunk. ArtVerse currently ships one static bundle, so page content does not use it yet.
          </p>
        </div>
      </PreviewBlock>

      <PreviewBlock
        id="ds-cart-totals"
        title="Cart totals"
        description="A cart total is either one figure or one of four named states. A figure is only produced when every work is priced in a single currency; every other case names itself and explains why no number can be shown. Nothing is converted, and no shipping, tax, discount or fee is ever added."
      >
        <div className={styles.stack}>
          {totalSpecimens.map((specimen) => (
            <div key={specimen.label} className={styles.specimen}>
              <p className={styles.specimenLabel}>{specimen.label}</p>
              <p className={styles.specimenHeading}>{specimen.total.heading}</p>
              {specimen.total.groups.map((group) => (
                <PriceLine key={group.code} price={group.subtotal} />
              ))}
              <p className={styles.specimenNote}>{specimen.total.message}</p>
            </div>
          ))}
          <p className={styles.caption}>
            The priced carts above are built from the single illustrative amount, which belongs to no
            record. A cart holding the catalogue's own records is the first specimen: no sample work
            carries a price, so no total exists for it and none is shown.
          </p>
        </div>
      </PreviewBlock>
    </>
  )
}
