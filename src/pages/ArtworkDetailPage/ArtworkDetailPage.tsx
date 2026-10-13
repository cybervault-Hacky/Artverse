import type { Crumb } from '@/types'
import { useParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { Button } from '@/components/Button/Button'
import { NotFoundView } from '@/components/NotFoundView/NotFoundView'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { PriceLine } from '@/components/PriceLine/PriceLine'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { categoryLabel, getArtworkById, getCreatorForArtwork } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PRICE_NOT_PROVIDED, PRICE_NOT_PURCHASABLE, artworkPrice } from '@/utils/pricing'
import { NO_PROVENANCE_STATEMENT, buildProvenance } from '@/utils/provenance'
import type { DetailRow } from '@/utils/artworkDetail'
import {
  buildArtworkDetails,
  buildStudioDetail,
  getPrimaryCollection,
  getRelatedArtworks,
  hasDisciplineSibling,
  hasDisplayableImage,
  imageAspectRatio,
  imagePixelLabel,
} from '@/utils/artworkDetail'
import styles from './ArtworkDetailPage.module.css'

/**
 * A single artwork, presented as a gallery would hang it.
 *
 * Four deliberate decisions:
 *
 * 1. The work is shown in full, at its own proportions, and never cropped to
 *    make the layout tidier. The grids elsewhere crop to a shared 4:5 frame so
 *    rows align; here the record is the subject, so its own ratio wins.
 * 2. Only real fields are shown. The metadata block is assembled from what the
 *    sample data carries, so a blank field produces no row rather than a
 *    placeholder that fills the gap with nothing.
 * 3. The studio is a block rather than a metadata row, because it is the one
 *    part of the record that leads somewhere — and it only links when a creator
 *    record actually resolves.
 * 4. Related works are chosen by discipline, then by shared collections. That
 *    rule is stated on the page; nothing here claims a model chose them.
 *
 * There is no purchase, favourite or share control, and the section below the
 * record says so plainly rather than dressing up an action that does not exist.
 * The record carries one image, so there is no gallery navigation to fake
 * either.
 *
 * Phase 9 added the price and provenance section. It shows a price only when the
 * record genuinely holds one with its currency, and otherwise states that none
 * has been provided; provenance is described as far as the catalogue goes and no
 * further, so attribution is never presented as authentication.
 */
export function ArtworkDetailPage() {
  const { artworkId } = useParams()
  const artwork = getArtworkById(artworkId)

  useDocumentTitle({
    title: artwork ? artwork.title : 'Artwork not found',
    description: artwork?.description,
  })

  if (!artwork) {
    return <NotFoundView subject="artwork" reference={artworkId} />
  }

  const creator = getCreatorForArtwork(artwork)
  const studio = buildStudioDetail(creator)
  const details = buildArtworkDetails(artwork)
  const primaryCollection = getPrimaryCollection(artwork)
  const related = getRelatedArtworks(artwork)
  const imagePixels = imagePixelLabel(artwork)
  const price = artworkPrice(artwork)
  const provenance = buildProvenance(artwork, creator)

  const crumbs: Crumb[] = [
    { label: 'Home', to: NavRoutes.home },
    { label: 'Explore Art', to: NavRoutes.discover },
  ]

  // The work sits inside its collection, so the collection belongs in the trail.
  if (primaryCollection) {
    crumbs.push({ label: primaryCollection.title, to: NavRoutes.collection(primaryCollection.id) })
  }

  crumbs.push({ label: artwork.title })

  return (
    <>
      <PageContainer>
        <Breadcrumb className={styles.crumbs} items={crumbs} />
      </PageContainer>

      <Section spacing="tight" ariaLabelledBy="artwork-title">
        <PageContainer>
          <article className={styles.layout}>
            <div className={styles.media}>
              {hasDisplayableImage(artwork) ? (
                <ArtworkFrame
                  src={artwork.image.src}
                  alt={artwork.image.alt}
                  width={artwork.image.width}
                  height={artwork.image.height}
                  aspect="natural"
                  ratio={artwork.image.width / artwork.image.height}
                  radius="md"
                  elevation="rest"
                  loading="eager"
                  sizes="(min-width: 1024px) 48vw, (min-width: 768px) 45vw, 92vw"
                />
              ) : (
                <div className={styles.placeholder} style={{ aspectRatio: imageAspectRatio(artwork) }}>
                  <p className={styles.placeholderText}>
                    No image is attached to this record. The catalogued details are still below.
                  </p>
                </div>
              )}

              <p className={styles.caption}>
                Illustrative sample image
                {imagePixels ? ` · ${imagePixels}` : ''} — shown in full, at the work’s own
                proportions rather than cropped to the catalogue’s grid frame.
              </p>
            </div>

            <div className={styles.details}>
              <p className={styles.eyebrow}>{categoryLabel(artwork.category)}</p>
              <h1 className={styles.title} id="artwork-title">
                {artwork.title}
              </h1>
              <p className={styles.description}>{artwork.description}</p>

              <div className={styles.studio}>
                <p className={styles.blockLabel}>Studio</p>
                {studio.href ? (
                  <TextLink className={styles.studioName} to={studio.href}>
                    {studio.name}
                  </TextLink>
                ) : (
                  <p className={styles.studioName}>{studio.name}</p>
                )}
                {studio.practice || studio.location ? (
                  <p className={styles.studioMeta}>
                    {[studio.practice, studio.location].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                {studio.illustrative ? (
                  <p className={styles.studioNote}>
                    Illustrative placeholder record — not a real studio or listing.
                  </p>
                ) : null}
              </div>

              {details.length > 0 ? (
                <dl className={styles.meta}>
                  {details.map((row) => (
                    <InfoRow key={row.label} row={row} />
                  ))}
                </dl>
              ) : null}

              <p className={styles.sampleNote}>
                Illustrative sample record — not a real listing. What the catalogue does and does
                not hold for it, including its price and provenance, is set out below.
              </p>
            </div>
          </article>

          <div className={styles.returnRow}>
            <Button to={NavRoutes.discover} variant="secondary">
              Back to Explore Art
            </Button>
            <Button to={NavRoutes.collections} variant="quiet">
              All collections
            </Button>
          </div>
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="info-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Record"
            title="Price and provenance"
            id="info-title"
            description="Only what this catalogue holds. Where something has not been provided, this page says so rather than filling the gap."
          />

          <dl className={styles.meta}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Price</dt>
              <dd className={styles.metaValue}>
                {price ? (
                  <PriceLine price={price} note={PRICE_NOT_PURCHASABLE} />
                ) : (
                  <span className={styles.absentValue}>{PRICE_NOT_PROVIDED}</span>
                )}
              </dd>
            </div>
            {provenance.rows.map((row) => (
              <InfoRow key={row.label} row={row} />
            ))}
          </dl>

          {provenance.statement ? (
            <div className={styles.statement}>
              <p className={styles.statementLabel}>Provenance statement</p>
              <p className={styles.statementText}>{provenance.statement}</p>
              {provenance.source ? (
                <p className={styles.statementSource}>Source: {provenance.source}</p>
              ) : null}
            </div>
          ) : (
            <p className={styles.infoNote}>{NO_PROVENANCE_STATEMENT}</p>
          )}

          {price ? null : <p className={styles.infoNote}>{PRICE_NOT_PURCHASABLE}</p>}
        </PageContainer>
      </Section>

      {related.length > 0 ? (
        <Section divided spacing="tight" ariaLabelledBy="related-title">
          <PageContainer>
            <SectionHeading
              eyebrow="Related"
              title="Explore Related Art"
              id="related-title"
              description={
                hasDisciplineSibling(artwork)
                  ? `Chosen from what this catalogue records — other works in ${categoryLabel(artwork.category).toLowerCase()} first, then pieces held alongside this one in a collection. No recommendation model is involved.`
                  : 'Chosen from what this catalogue records — the pieces this work is held alongside in a collection. No recommendation model is involved.'
              }
            />
            <ArtworkGrid
              className={styles.related}
              artworks={related}
              label={`Related sample records for ${artwork.title}`}
              aspect="portrait"
            />
          </PageContainer>
        </Section>
      ) : null}

      <Section divided spacing="tight" ariaLabelledBy="artwork-later">
        <PageContainer>
          <PhaseNote
            phase="Phase 12"
            title="Still to come on this page"
            description="The presentation is in place — the rules above say exactly what is shown and what is absent. Everything behind it has to come from a real seller, a real catalogue and a backend that does not exist yet."
            items={[
              'A seller-supplied price, in the seller’s own currency, on records that are genuinely for sale.',
              'Availability, and an enquiry or purchase flow with shipping and payment — none of which exists.',
              'Verification, certificate issuance and edition records, which need a workflow before anything can be issued.',
              'Viewing the work at scale — the record carries one image today, so there is no gallery to navigate yet.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}

/**
 * One labelled row: a value, or the links a row leads to.
 *
 * Shared by the record list and the provenance list so a row can only ever be
 * rendered one way — and so a row that carries links renders them identically in
 * both places.
 */
function InfoRow({ row }: { row: DetailRow }) {
  const links = row.links

  return (
    <div className={styles.metaRow}>
      <dt className={styles.metaLabel}>{row.label}</dt>
      <dd className={styles.metaValue}>
        {links ? (
          <span className={styles.linkList}>
            {links.map((link, index) => (
              <span key={link.to} className={styles.linkItem}>
                <TextLink to={link.to}>{link.label}</TextLink>
                {/* Trailing, so a wrapped line never starts with a separator. */}
                {index < links.length - 1 ? (
                  <span className={styles.linkDivider} aria-hidden="true">
                    ·
                  </span>
                ) : null}
              </span>
            ))}
          </span>
        ) : (
          row.value
        )}
      </dd>
    </div>
  )
}
