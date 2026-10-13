import { useParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { NotFoundView } from '@/components/NotFoundView/NotFoundView'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import {
  SAMPLE_ARTWORKS,
  categoryLabel,
  getArtworkById,
  getCreatorForArtwork,
} from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './ArtworkDetailPage.module.css'

/**
 * A single artwork.
 *
 * The work is shown in full at its intrinsic ratio, with the metadata a
 * visitor genuinely needs today. Commerce — price, availability,
 * certificates — is deliberately absent and stated as such.
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
  const relatedWorks = SAMPLE_ARTWORKS.filter(
    (candidate) => candidate.creatorId === artwork.creatorId && candidate.id !== artwork.id,
  )

  return (
    <>
      <PageContainer>
        <Breadcrumb
          className={styles.crumbs}
          items={[
            { label: 'Home', to: NavRoutes.home },
            { label: 'Explore Art', to: NavRoutes.discover },
            { label: artwork.title },
          ]}
        />
      </PageContainer>

      <Section spacing="tight" ariaLabelledBy="artwork-title">
        <PageContainer>
          <div className={styles.layout}>
            <div className={styles.media}>
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
                sizes="(max-width: 1023px) 92vw, 55vw"
              />
            </div>

            <div className={styles.details}>
              <p className={styles.eyebrow}>{categoryLabel(artwork.category)}</p>
              <h1 className={styles.title} id="artwork-title">
                {artwork.title}
              </h1>
              <p className={styles.description}>{artwork.description}</p>

              <dl className={styles.meta}>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Medium</dt>
                  <dd className={styles.metaValue}>{artwork.medium}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Year</dt>
                  <dd className={styles.metaValue}>{artwork.year}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Dimensions</dt>
                  <dd className={styles.metaValue}>{artwork.dimensions}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Studio</dt>
                  <dd className={styles.metaValue}>
                    {creator ? (
                      <TextLink to={NavRoutes.artist(creator.id)}>{creator.name}</TextLink>
                    ) : (
                      'Illustrative record'
                    )}
                  </dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Reference</dt>
                  <dd className={styles.metaValue}>
                    <code className={styles.reference}>{artwork.id}</code>
                  </dd>
                </div>
              </dl>

              <p className={styles.sampleNote}>
                Illustrative sample record. There is no price, availability or provenance attached
                to this entry, and no purchase flow exists yet.
              </p>
            </div>
          </div>
        </PageContainer>
      </Section>

      {relatedWorks.length > 0 ? (
        <Section divided spacing="tight" ariaLabelledBy="related-works">
          <PageContainer>
            <SectionHeading
              eyebrow="Same studio"
              title="More sample records from this creator"
              id="related-works"
            />
            <ArtworkGrid
              className={styles.related}
              artworks={relatedWorks}
              label="Related sample artworks"
            />
          </PageContainer>
        </Section>
      ) : null}

      <Section divided spacing="tight" ariaLabelledBy="artwork-later">
        <PageContainer>
          <PhaseNote
            phase="Phase 6"
            title="What this artwork page will become"
            description="Commerce and provenance are the subjects of a later phase; nothing here pretends to offer them yet."
            items={[
              'Availability, pricing and currency handling.',
              'Enquiry and purchase flows with shipping detail.',
              'Certificates, edition records and provenance history.',
              'Viewing the work in context, at scale and in detail.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
