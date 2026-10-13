import type { CategoryOption, Creator } from '@/types'

/**
 * Illustrative creators.
 *
 * These records exist so that routing, typography and layouts can be exercised
 * in Phase 1. They intentionally read as placeholders: ArtVerse does not
 * fabricate artists, studios or verified sellers.
 */
export const SAMPLE_CREATORS: Creator[] = [
  {
    id: 'sample-studio-a',
    name: 'Illustrative Studio A',
    discipline: 'Painting — placeholder record',
    illustrative: true,
  },
  {
    id: 'sample-studio-b',
    name: 'Illustrative Studio B',
    discipline: 'Digital artwork — placeholder record',
    illustrative: true,
  },
  {
    id: 'sample-studio-c',
    name: 'Illustrative Studio C',
    discipline: 'Lighting and objects — placeholder record',
    illustrative: true,
  },
  {
    id: 'sample-maker-d',
    name: 'Illustrative Maker D',
    discipline: 'Ceramics — placeholder record',
    illustrative: true,
  },
  {
    id: 'sample-maker-e',
    name: 'Illustrative Maker E',
    discipline: 'Woodwork — placeholder record',
    illustrative: true,
  },
]

/** Categories shown across the marketplace, with their display labels. */
export const ARTWORK_CATEGORIES: CategoryOption[] = [
  { id: 'painting', label: 'Painting' },
  { id: 'digital', label: 'Digital artwork' },
  { id: 'decor', label: 'Lighting & decor' },
  { id: 'handmade', label: 'Handmade objects' },
  { id: 'custom', label: 'Custom creations' },
]

export function categoryLabel(category: CategoryOption['id']): string {
  return ARTWORK_CATEGORIES.find((option) => option.id === category)?.label ?? 'Artwork'
}
