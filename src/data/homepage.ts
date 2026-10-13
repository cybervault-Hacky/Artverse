/**
 * Homepage curation.
 *
 * The homepage does not query the catalogue: it names the exact records it
 * presents, so the editorial selection is readable in one place and the page
 * components stay presentational. Every id below exists in the sample data,
 * and `getArtworksByIds` / `getCollectionsByIds` skip anything that does not.
 */

/**
 * Floating hero composition, in slot order:
 * dominant painting, upper-right artwork, lower-left object, right-hand lamp.
 */
export const HERO_WORK_IDS = [
  'sample-painting-01',
  'sample-digital-01',
  'sample-handmade-01',
  'sample-decor-01',
]

/** The single work featured in the editorial spotlight. */
export const SPOTLIGHT_ARTWORK_ID = 'sample-painting-02'

/** The four collections presented as artistic worlds on the homepage. */
export const HOMEPAGE_COLLECTION_IDS = [
  'quiet-landscapes',
  'objects-for-living',
  'contemporary-colour',
  'thoughtful-spaces',
]

/** Cropped work used as material texture in the artist invitation band. */
export const INVITATION_ARTWORK_ID = 'sample-custom-01'
