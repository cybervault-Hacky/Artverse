import { NavRoutes } from '@/app/routes'
import { useSellerDraft } from '@/app/sellerDraft'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel, hasText } from '@/utils/text'
import { getCollectionsForArtwork } from '@/utils/artworkDetail'
import { categoryLabel } from '@/data'
import {
  LISTING_FIELDS,
  listingDraftFilledCount,
  listingDraftSummary,
  listingOriginLabel,
} from '@/utils/listingDraft'
import { WORKSPACE_PREVIEW_NOTICE, buildStudioOverview } from '@/utils/sellerStudio'
import styles from './StudioListingsPage.module.css'

/**
 * Artwork listings.
 *
 * The table is deliberately small, because the claim it makes is small: it
 * lists the records attributed to the preview studio and nothing else. The two
 * actions that matter are preparing a new draft and opening a draft from a
 * record — neither of which changes the record, which is why each row also
 * links to the public page where the record actually lives.
 */
export function StudioListingsPage() {
  const overview = buildStudioOverview()
  const { state, dispatch } = useSellerDraft()

  const summary = listingDraftSummary(state)
  const filled = listingDraftFilledCount(state.draft)
  const draftTarget =
    state.origin.kind === 'new' ? NavRoutes.studioNewListing : NavRoutes.studioListing(state.origin.artworkId)

  useDocumentTitle({
    title: 'Artwork listings',
    description:
      'The sample records attributed to the preview studio, and a listing draft held in this browser tab only.',
  })

  return (
    <>
      <PageHeader
        eyebrow="Artwork listings"
        title="Listings"
        intro="Every listing in this build starts as an illustrative sample record. Preparing one here writes a draft in this browser tab — the record itself is never touched, and nothing is published."
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'For Artists', to: NavRoutes.sell },
          { label: 'Studio workspace', to: NavRoutes.studio },
          { label: 'Listings' },
        ]}
        actions={
          <Button to={NavRoutes.studioNewListing}>Draft a new listing</Button>
        }
      />

      <PreviewNotice>{WORKSPACE_PREVIEW_NOTICE}</PreviewNotice>

      {summary ? (
        <Section spacing="tight" ariaLabelledBy="studio-draft">
          <PageContainer>
            <div className={styles.draft}>
              <div className={styles.draftBody}>
                <div className={styles.draftHead}>
                  <h2 id="studio-draft" className={styles.draftTitle}>
                    A draft is open in this tab
                  </h2>
                  <StatusTag tone={summary.tone}>{summary.label}</StatusTag>
                </div>
                <p className={styles.draftOrigin}>{listingOriginLabel(state.origin)}</p>
                <p className={styles.draftMeta}>
                  {`${filled} of ${LISTING_FIELDS.length} fields filled in`}
                  {state.checked && state.outcome === 'complete'
                    ? ' · every field checked out'
                    : ''}
                  {' · '}
                  nothing has been saved or published
                </p>
              </div>

              <div className={styles.draftActions}>
                <Button to={draftTarget} variant="secondary">
                  Continue editing
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => dispatch({ type: 'reset' })}
                  type="button"
                >
                  {state.origin.kind === 'new' ? 'Clear the draft' : 'Reset to the sample record'}
                </Button>
              </div>
            </div>
          </PageContainer>
        </Section>
      ) : null}

      <Section
        divided={Boolean(summary)}
        spacing="tight"
        ariaLabelledBy="studio-listings"
      >
        <PageContainer>
          <h2 id="studio-listings" className={styles.sectionTitle}>
            {`Records attributed to ${overview.entry ? overview.entry.name : 'this studio'}`}
          </h2>

          {overview.workCount > 0 ? (
            <>
              <p className={styles.sectionIntro}>
                {countLabel(overview.workCount, 'record')} of the{' '}
                {countLabel(overview.catalogueCount, 'sample record')} in this build.{' '}
                {countLabel(overview.otherStudioCount, 'record')} belong to other illustrative
                studios and never appear in this workspace.
              </p>

              <ul className={styles.rows}>
                {overview.works.map((artwork) => {
                  const collections = getCollectionsForArtwork(artwork)
                  const isDraftOrigin =
                    state.origin.kind === 'artwork' && state.origin.artworkId === artwork.id

                  return (
                    <li className={styles.row} key={artwork.id}>
                      <div className={styles.rowMedia}>
                        {hasText(artwork.image?.src) ? (
                          <ArtworkFrame
                            className={styles.rowFrame}
                            src={artwork.image.src}
                            alt={artwork.image.alt}
                            width={artwork.image.width}
                            height={artwork.image.height}
                            aspect="square"
                            radius="sm"
                            sizes="(max-width: 767px) 30vw, 9rem"
                          />
                        ) : (
                          <span className={styles.rowNoImage}>No image attached</span>
                        )}
                      </div>

                      <div className={styles.rowBody}>
                        <div className={styles.rowHead}>
                          <h3 className={styles.rowTitle}>{artwork.title}</h3>
                          <StatusTag tone="quiet">Sample record</StatusTag>
                          {isDraftOrigin ? (
                            <StatusTag tone="accent">Draft in this tab</StatusTag>
                          ) : null}
                        </div>

                        <dl className={styles.rowFacts}>
                          <div className={styles.rowFact}>
                            <dt>Discipline</dt>
                            <dd>{categoryLabel(artwork.category)}</dd>
                          </div>
                          <div className={styles.rowFact}>
                            <dt>Medium</dt>
                            <dd>{hasText(artwork.medium) ? artwork.medium : 'Not recorded'}</dd>
                          </div>
                          <div className={styles.rowFact}>
                            <dt>Dimensions</dt>
                            <dd>
                              {hasText(artwork.dimensions) ? artwork.dimensions : 'Not recorded'}
                            </dd>
                          </div>
                          <div className={styles.rowFact}>
                            <dt>Year</dt>
                            <dd>
                              {typeof artwork.year === 'number' && Number.isFinite(artwork.year)
                                ? String(artwork.year)
                                : 'Not recorded'}
                            </dd>
                          </div>
                          <div className={styles.rowFact}>
                            <dt>Collections</dt>
                            <dd>
                              {collections.length > 0
                                ? collections.map((collection) => collection.title).join(', ')
                                : 'In none yet'}
                            </dd>
                          </div>
                        </dl>

                        <div className={styles.rowActions}>
                          <TextLink to={NavRoutes.studioListing(artwork.id)}>
                            Prepare a draft from this record
                          </TextLink>
                          <TextLink to={NavRoutes.artwork(artwork.id)}>
                            Open the public page
                          </TextLink>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <EmptyState
              title="No records attributed to this studio"
              description="The listings section shows a studio's own records and nothing else, so it is empty until this studio has work in the catalogue."
              action={<Button to={NavRoutes.discover}>Browse the catalogue</Button>}
            />
          )}

          <p className={styles.honesty}>
            A listing in this preview is a form and a draft: there is no upload and no storage, a
            price prepared here is never published, and preparing one has no effect on any other
            page of ArtVerse.
          </p>
        </PageContainer>
      </Section>
    </>
  )
}
