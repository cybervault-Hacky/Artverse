import type { Collection } from '@/types'

/**
 * Illustrative sample groupings — the four "artistic worlds" the homepage
 * features, and the full set shown in the collections directory.
 *
 * Every grouping draws on the placeholder records in `artworks.ts`. They are
 * hand-assembled sample sets, not editorial marketplace collections, and every
 * record carries `sample: true`.
 */
export const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: 'quiet-landscapes',
    title: 'Quiet Landscapes',
    summary: 'Horizons, fields and standing light.',
    description:
      'A sample grouping of abstract works that hold the qualities of landscape — layered ground, a low horizon and light left standing in the open.',
    artworkIds: ['sample-painting-02', 'sample-painting-01', 'sample-digital-01'],
    sample: true,
  },
  {
    id: 'objects-for-living',
    title: 'Objects for Living',
    summary: 'Pieces made to be used, not only looked at.',
    description:
      'A sample grouping of studio objects — ceramics, lighting and carved wood — chosen for rooms that are actually lived in.',
    artworkIds: ['sample-handmade-01', 'sample-decor-01', 'sample-custom-01'],
    sample: true,
  },
  {
    id: 'contemporary-colour',
    title: 'Contemporary Colour',
    summary: 'Ochre, charcoal and warm ivory, used with intent.',
    description:
      'A sample grouping built on a deliberately narrow palette, where colour is carried by surface and scale rather than by brightness.',
    artworkIds: ['sample-painting-01', 'sample-digital-01', 'sample-painting-02'],
    sample: true,
  },
  {
    id: 'thoughtful-spaces',
    title: 'Art for Thoughtful Spaces',
    summary: 'Slower work for rooms that ask for it.',
    description:
      'A sample grouping of pieces that reward a second look — a carved relief, a single ochre form and an arc of quiet light.',
    artworkIds: ['sample-custom-01', 'sample-painting-02', 'sample-digital-01'],
    sample: true,
  },
]
