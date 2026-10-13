import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { useSellerDraft } from '@/app/sellerDraft'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { FormField } from '@/components/FormField/FormField'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PreviewNotice } from '@/components/PreviewNotice/PreviewNotice'
import { Section } from '@/components/Section/Section'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { TextLink } from '@/components/TextLink/TextLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ARTWORK_CATEGORIES, getArtworkById } from '@/data'
import { hasText } from '@/utils/text'
import {
  LISTING_FIELDS,
  LISTING_LIMITS,
  emptyListingDraft,
  listingCollectionOptions,
  listingDraftFilledCount,
  listingDraftImage,
  listingDraftIsDirty,
  listingImageOptions,
  sameListingOrigin,
  type ListingFieldName,
} from '@/utils/listingDraft'
import { WORKSPACE_PREVIEW_NOTICE, originFromPath } from '@/utils/sellerStudio'
import styles from './StudioListingEditorPage.module.css'

/**
 * The listing editor.
 *
 * Three things shape it:
 *
 * 1. **A draft is local.** Every keystroke goes through the shared draft reducer
 *    — no request, no storage, no optimistic “saved” state to be wrong about.
 *    The screen says what it is doing instead: the draft is held in this tab.
 * 2. **Validation is explicit.** Nothing is checked as you type; pressing the
 *    button runs the pure validator and reports a message per field, linked to
 *    that field. Optional fields stay optional — blank dimensions are valid.
 * 3. **Nothing is published.** There is no publish action, because there is
 *    nowhere for it to publish to. The closing note says so in as many words.
 */
export function StudioListingEditorPage() {
  const { artworkId } = useParams()
  const { state, dispatch } = useSellerDraft()

  const origin = useMemo(
    () => originFromPath(`/sell/studio/listings/${artworkId ?? 'new'}`),
    [artworkId],
  )
  const artwork = getArtworkById(artworkId)

  /**
   * The reducer owns the draft, and the workspace syncs its origin from the
   * address. Until that sync lands — one render after a link between two
   * different records — this screen reads straight from the draft the origin
   * starts from, so the fields never show another record's values.
   */
  const inSync = sameListingOrigin(state.origin, origin)
  const draft = inSync ? state.draft : emptyListingDraft()
  const errors = inSync ? state.errors : {}
  const checked = inSync && state.checked

  useEffect(() => {
    dispatch({ type: 'selectOrigin', origin })
  }, [dispatch, origin])

  const imageOptions = listingImageOptions()
  const collections = listingCollectionOptions()
  const selectedImage = listingDraftImage(draft)
  const filled = listingDraftFilledCount(draft)
  const dirty = inSync && listingDraftIsDirty(state)
  const errorCount = Object.keys(errors).length

  const isNew = !artworkId
  const title = artwork ? `Draft from “${artwork.title}”` : 'New listing draft'

  useDocumentTitle({
    title: isNew ? 'New listing draft' : artwork ? `Draft — ${artwork.title}` : 'Listing draft',
    description:
      'Prepare an artwork listing in the ArtVerse studio workspace preview. Nothing is uploaded, saved or published.',
  })

  const setField = (field: ListingFieldName, value: string) =>
    dispatch({ type: 'setField', field, value })

  // An unknown id is explained inside the workspace rather than thrown as a
  // page not found: the workspace is still the right place to be.
  if (artworkId && !artwork) {
    return (
      <>
        <PageHeader
          eyebrow="Artwork listings"
          title="That record isn’t in this build"
          intro={`No sample record has the id “${artworkId}”, so there is no draft to prepare from it. The six records in this build are all listed in the workspace.`}
          crumbs={[
            { label: 'Home', to: NavRoutes.home },
            { label: 'Studio workspace', to: NavRoutes.studio },
            { label: 'Listings', to: NavRoutes.studioListings },
            { label: 'Unknown record' },
          ]}
        />
        <Section spacing="tight" ariaLabelledBy="unknown-record">
          <PageContainer>
            <h2 id="unknown-record" className="visually-hidden">
              What you can do instead
            </h2>
            <EmptyState
              title="No record matches that id"
              description="Nothing was changed, and the workspace is unaffected. Start a new draft, or prepare one from a record that exists."
              action={
                <div className={styles.emptyActions}>
                  <Button to={NavRoutes.studioListings}>All listings</Button>
                  <Button to={NavRoutes.studioNewListing} variant="secondary">
                    Start a new draft
                  </Button>
                </div>
              }
            />
          </PageContainer>
        </Section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Artist studio"
        title={title}
        intro={
          artwork
            ? `The fields below start from the sample record “${artwork.title}”. Editing them changes the draft in this tab only — the record on ArtVerse keeps its own values.`
            : 'A new listing, prepared field by field. Every field here is one the catalogue already reads: nothing is invented, and nothing is stored.'
        }
        crumbs={[
          { label: 'Home', to: NavRoutes.home },
          { label: 'Studio workspace', to: NavRoutes.studio },
          { label: 'Listings', to: NavRoutes.studioListings },
          { label: isNew ? 'New draft' : 'Draft' },
        ]}
      />

      <PreviewNotice>{WORKSPACE_PREVIEW_NOTICE}</PreviewNotice>

      <Section spacing="tight" ariaLabelledBy="listing-draft-heading">
        <PageContainer>
          <div className={styles.layout}>
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                dispatch({ type: 'check' })
              }}
            >
              <div className={styles.formHead}>
                <h2 id="listing-draft-heading" className={styles.formTitle}>
                  Listing draft
                </h2>
                <StatusTag tone={dirty ? 'neutral' : 'quiet'}>
                  {dirty ? 'Edited in this tab' : 'Held in this tab'}
                </StatusTag>
              </div>

              <p className={styles.formNote}>
                {`${filled} of ${LISTING_FIELDS.length} fields filled in. Required fields are marked with an asterisk.`}
              </p>

              <div className={styles.fields}>
                <FormField
                  id="listing-title"
                  label="Title"
                  hint={fieldHint('title')}
                  error={errors.title}
                  required
                >
                  <input
                    type="text"
                    name="title"
                    value={draft.title}
                    maxLength={LISTING_LIMITS.titleMax + 20}
                    onChange={(event) => setField('title', event.target.value)}
                  />
                </FormField>

                <FormField
                  id="listing-discipline"
                  label="Discipline"
                  error={errors.discipline}
                  required
                >
                  <select
                    name="discipline"
                    value={draft.discipline}
                    onChange={(event) => setField('discipline', event.target.value)}
                  >
                    <option value="">Not chosen yet</option>
                    {ARTWORK_CATEGORIES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  id="listing-medium"
                  label="Medium"
                  hint={fieldHint('medium')}
                  error={errors.medium}
                  required
                >
                  <input
                    type="text"
                    name="medium"
                    value={draft.medium}
                    maxLength={LISTING_LIMITS.mediumMax + 20}
                    onChange={(event) => setField('medium', event.target.value)}
                  />
                </FormField>

                <FormField
                  id="listing-dimensions"
                  label="Dimensions"
                  hint={fieldHint('dimensions')}
                  error={errors.dimensions}
                >
                  <input
                    type="text"
                    name="dimensions"
                    value={draft.dimensions}
                    maxLength={LISTING_LIMITS.dimensionsMax + 20}
                    onChange={(event) => setField('dimensions', event.target.value)}
                  />
                </FormField>

                <FormField id="listing-year" label="Year" hint={fieldHint('year')} error={errors.year}>
                  <input
                    type="text"
                    name="year"
                    inputMode="numeric"
                    value={draft.year}
                    onChange={(event) => setField('year', event.target.value)}
                  />
                </FormField>

                <FormField
                  id="listing-collection"
                  label="Collection"
                  hint={fieldHint('collectionId')}
                  error={errors.collectionId}
                  className={styles.fieldWide}
                >
                  <select
                    name="collection"
                    value={draft.collectionId}
                    onChange={(event) => setField('collectionId', event.target.value)}
                  >
                    <option value="">Not in a collection</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  id="listing-description"
                  label="Description"
                  hint={fieldHint('description')}
                  error={errors.description}
                  required
                  className={styles.fieldWide}
                >
                  <textarea
                    name="description"
                    value={draft.description}
                    maxLength={LISTING_LIMITS.descriptionMax + 60}
                    onChange={(event) => setField('description', event.target.value)}
                  />
                </FormField>
              </div>

              {/* The image chooser: a radio group, so it works with the keyboard
                  as a single control with arrow keys. */}
              <fieldset
                className={styles.imageField}
                aria-describedby={
                  errors.imageId
                    ? 'listing-imageId-hint listing-imageId-error'
                    : 'listing-imageId-hint'
                }
              >
                <legend className={styles.imageLegend}>
                  Image
                  <span className={styles.requiredMark} aria-hidden="true">
                    {' '}
                    *
                  </span>
                  <span className="visually-hidden"> (required)</span>
                </legend>
                <p className={styles.imageHint} id="listing-imageId-hint">
                  {fieldHint('imageId')} Uploading a file needs storage, which this build does not
                  have.
                </p>

                <div className={styles.imageChoices}>
                  <label className={styles.imageChoice} htmlFor="listing-image-none">
                    <input
                      type="radio"
                      id="listing-image-none"
                      name="listing-image"
                      value=""
                      checked={!hasText(draft.imageId)}
                      onChange={() => setField('imageId', '')}
                    />
                    <span className={styles.imageChoiceLabel}>No image selected</span>
                  </label>

                  {imageOptions.map((option) => (
                    <label
                      className={styles.imageChoice}
                      htmlFor={`listing-image-${option.id}`}
                      key={option.id}
                    >
                      <input
                        type="radio"
                        id={`listing-image-${option.id}`}
                        name="listing-image"
                        value={option.id}
                        checked={draft.imageId === option.id}
                        onChange={() => setField('imageId', option.id)}
                      />
                      <span className={styles.imageChoiceLabel}>{option.label}</span>
                    </label>
                  ))}
                </div>

                {errors.imageId ? (
                  <p className={styles.imageError} id="listing-imageId-error">
                    <span className="visually-hidden">Error: </span>
                    {errors.imageId}
                  </p>
                ) : null}
              </fieldset>

              <div className={styles.actions}>
                <Button type="submit">Check this draft</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => dispatch({ type: 'reset' })}
                >
                  {isNew ? 'Clear the form' : 'Reset to the sample record'}
                </Button>
                <TextLink to={NavRoutes.studioListings}>Back to listings</TextLink>
              </div>

              {/* The verdict: a polite live region, and never a claim of saving. */}
              <div className={styles.verdict} role="status">
                {!checked ? (
                  <p className={styles.verdictIdle}>
                    Nothing is checked until you ask. Pressing the button runs the same validation
                    the seller tools will use.
                  </p>
                ) : errorCount === 0 ? (
                  <p className={styles.verdictOk}>
                    <StatusTag tone="accent">Draft complete</StatusTag>{' '}
                    Every field checks out. Nothing has been saved, uploaded or published — this
                    build has no account, no storage and no marketplace behind it.
                  </p>
                ) : (
                  <p className={styles.verdictWarn}>
                    <StatusTag tone="neutral">
                      {`${errorCount} field${errorCount === 1 ? '' : 's'} need attention`}
                    </StatusTag>{' '}
                    Each message is listed beside its field below.
                  </p>
                )}
              </div>
            </form>

            {/* The preview column: the one image relationship the draft can
                hold, shown at the frame's proportions. */}
            <aside className={styles.preview} aria-labelledby="listing-preview-heading">
              <h2 id="listing-preview-heading" className={styles.previewTitle}>
                Listing preview
              </h2>
              <p className={styles.previewNote}>
                How the image in this draft would be framed. Nothing else on this page is served to
                anyone.
              </p>

              <div className={styles.previewMedia}>
                {selectedImage ? (
                  <ArtworkFrame
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    width={selectedImage.width}
                    height={selectedImage.height}
                    aspect="portrait"
                    radius="sm"
                    sizes="(max-width: 1023px) 60vw, 22rem"
                  />
                ) : (
                  <span className={styles.previewEmpty}>
                    No image selected — a listing needs one, and this build has no upload
                  </span>
                )}
              </div>

              <dl className={styles.previewFacts}>
                <div className={styles.previewFact}>
                  <dt>Title</dt>
                  <dd>{hasText(draft.title) ? draft.title : 'Not filled in yet'}</dd>
                </div>
                <div className={styles.previewFact}>
                  <dt>Discipline</dt>
                  <dd>
                    {hasText(draft.discipline)
                      ? (ARTWORK_CATEGORIES.find((option) => option.id === draft.discipline)
                          ?.label ?? draft.discipline)
                      : 'Not chosen yet'}
                  </dd>
                </div>
                <div className={styles.previewFact}>
                  <dt>Medium</dt>
                  <dd>{hasText(draft.medium) ? draft.medium : 'Not filled in yet'}</dd>
                </div>
                <div className={styles.previewFact}>
                  <dt>Dimensions</dt>
                  <dd>{hasText(draft.dimensions) ? draft.dimensions : 'Not recorded'}</dd>
                </div>
                <div className={styles.previewFact}>
                  <dt>Year</dt>
                  <dd>{hasText(draft.year) ? draft.year : 'Not recorded'}</dd>
                </div>
                <div className={styles.previewFact}>
                  <dt>Collection</dt>
                  <dd>
                    {hasText(draft.collectionId)
                      ? (collections.find((collection) => collection.id === draft.collectionId)
                          ?.title ?? 'Unknown collection')
                      : 'Not in a collection'}
                  </dd>
                </div>
              </dl>

              <p className={styles.priceNote}>
                There is no price, availability or publication field here. ArtVerse has no commerce
                yet, so a draft cannot claim any of them.
              </p>
            </aside>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}

/** The hint text a field was defined with, so the form and the model agree. */
function fieldHint(name: ListingFieldName): string | undefined {
  return LISTING_FIELDS.find((field) => field.name === name)?.hint
}
