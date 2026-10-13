import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { categoryLabel, getArtworkById, getCreatorForArtwork } from '@/data'
import { SPOTLIGHT_ARTWORK_ID } from '@/data/homepage'
import styles from './SpotlightSection.module.css'

/**
 * Editorial artwork spotlight.
 *
 * One real sample record, shown large, with the attribution and metadata that
 * genuinely exist for it. No price, no availability and no verification claim
 * is invented — the note under the action says so plainly.
 */
export function SpotlightSection() {
  const artwork = getArtworkById(SPOTLIGHT_ARTWORK_ID)

  if (!artwork) return null

  const creator = getCreatorForArtwork(artwork)

  return (
    <Section divided ariaLabelledBy="spotlight-title">
      <PageContainer>
        <SectionHeading
          eyebrow="Spotlight"
          title="One work in focus"
          id="spotlight-title"
          description="A closer look at a single record from the sample catalogue — its medium, its scale, and the idea it holds."
        />

        <article className={styles.feature} aria-labelledby="spotlight-artwork-title">
          <div className={styles.media}>
            <ArtworkFrame
              src={artwork.image.src}
              alt={artwork.image.alt}
              width={artwork.image.width}
              height={artwork.image.height}
              aspect="portrait"
              ratio={artwork.image.width / artwork.image.height}
              radius="md"
              elevation="rest"
              sizes="(max-width: 1023px) 92vw, 46vw"
            />
          </div>

          <div className={styles.details}>
            <p className={styles.category}>{categoryLabel(artwork.category)}</p>
            <h3 className={styles.title} id="spotlight-artwork-title">
              {artwork.title}
            </h3>

            <p className={styles.byline}>
              {creator ? (
                <TextLink to={NavRoutes.artist(creator.id)}>{creator.name}</TextLink>
              ) : (
                <span>Illustrative record</span>
              )}
              {creator?.location ? (
                <>
                  <span className={styles.bylineDivider} aria-hidden="true">
                    ·
                  </span>
                  <span>{creator.location}</span>
                </>
              ) : null}
            </p>

            <p className={styles.description}>{artwork.description}</p>

            <p className={styles.meta}>
              {artwork.medium} · {artwork.dimensions} · {artwork.year}
            </p>

            <div className={styles.actions}>
              <Button to={NavRoutes.artwork(artwork.id)} variant="secondary">
                View Artwork
              </Button>
            </div>

            <p className={styles.note}>
              Illustrative sample record created for the ArtVerse build — no price, availability or
              provenance is attached to it.
            </p>
          </div>
        </article>
      </PageContainer>
    </Section>
  )
}
