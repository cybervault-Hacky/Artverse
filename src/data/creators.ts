import type { CategoryOption, Creator } from '@/types'

/**
 * Illustrative creators.
 *
 * These records exist so that routing, typography and layouts can be exercised.
 * They intentionally read as placeholders: ArtVerse does not fabricate artists,
 * studios or verified sellers. Locations are placeholder values that belong to
 * no real studio.
 */
export const SAMPLE_CREATORS: Creator[] = [
  {
    id: 'sample-studio-a',
    name: 'Illustrative Studio A',
    discipline: 'Painting — placeholder record',
    location: 'Lisbon, Portugal',
    illustrative: true,
  },
  {
    id: 'sample-studio-b',
    name: 'Illustrative Studio B',
    discipline: 'Digital artwork — placeholder record',
    location: 'Kyoto, Japan',
    illustrative: true,
  },
  {
    id: 'sample-studio-c',
    name: 'Illustrative Studio C',
    discipline: 'Lighting and objects — placeholder record',
    location: 'Copenhagen, Denmark',
    illustrative: true,
  },
  {
    id: 'sample-maker-d',
    name: 'Illustrative Maker D',
    discipline: 'Ceramics — placeholder record',
    location: 'Oaxaca, Mexico',
    illustrative: true,
  },
  {
    id: 'sample-maker-e',
    name: 'Illustrative Maker E',
    discipline: 'Woodwork — placeholder record',
    location: 'Jaipur, India',
    illustrative: true,
  },
]

/**
 * Categories shown across the marketplace, with their display labels.
 *
 * These five labels are also the creative disciplines presented on the
 * homepage, so the wording is shared rather than duplicated.
 */
export const ARTWORK_CATEGORIES: CategoryOption[] = [
  { id: 'painting', label: 'Fine Paintings' },
  { id: 'digital', label: 'Digital Artwork' },
  { id: 'decor', label: 'Decorative Lamps' },
  { id: 'handmade', label: 'Handmade Products' },
  { id: 'custom', label: 'Custom Creations' },
]

export function categoryLabel(category: CategoryOption['id']): string {
  return ARTWORK_CATEGORIES.find((option) => option.id === category)?.label ?? 'Artwork'
}
