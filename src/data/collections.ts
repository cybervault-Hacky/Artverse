import type { Collection } from '@/types'

/**
 * Illustrative sample groupings.
 *
 * Collections in Phase 1 are curated-by-hand placeholder sets that let the
 * collections directory and collection detail routes be built and reviewed.
 * They are not editorial marketplace collections.
 */
export const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: 'warm-minimalism',
    title: 'Warm Minimalism',
    summary: 'Quiet surfaces, warm neutrals and space left deliberately empty.',
    description:
      'A sample grouping built around restraint: two paintings and a thrown vessel that share a low-contrast, warm palette.',
    artworkIds: ['sample-painting-01', 'sample-painting-02', 'sample-handmade-01'],
    sample: true,
  },
  {
    id: 'light-and-form',
    title: 'Light and Form',
    summary: 'Objects that shape the light they sit in.',
    description:
      'A sample grouping of pieces whose subject is light itself — a lamp, a digital arc and a carved panel.',
    artworkIds: ['sample-decor-01', 'sample-digital-01', 'sample-custom-01'],
    sample: true,
  },
  {
    id: 'handmade-objects',
    title: 'Handmade Objects',
    summary: 'Studio-made pieces where the process stays visible.',
    description:
      'A sample grouping of ceramics, lighting and woodwork in which tool marks are part of the finish rather than something polished away.',
    artworkIds: ['sample-handmade-01', 'sample-decor-01', 'sample-custom-01'],
    sample: true,
  },
]
