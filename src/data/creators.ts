import type { CategoryOption, Creator } from '@/types'

/**
 * Illustrative creators.
 *
 * These records exist so that routing, typography and layouts can be exercised.
 * They intentionally read as placeholders: ArtVerse does not fabricate artists,
 * studios or verified sellers. Locations are placeholder values that belong to
 * no real studio.
 *
 * The practice notes describe the sample records attributed to each entry and
 * how those pieces were made — the only thing this build can honestly say about
 * a placeholder. None of them invents a person, a studio history, an exhibition,
 * an award or a career.
 */
export const SAMPLE_CREATORS: Creator[] = [
  {
    id: 'sample-studio-a',
    name: 'Illustrative Studio A',
    discipline: 'Painting — placeholder record',
    location: 'Lisbon, Portugal',
    bio: 'An illustrative painting entry. Its two sample canvases are built from layered colour and a low horizon — one in oil, one in acrylic on linen. Both are placeholder pieces made for this build, not a real studio’s catalogue.',
    illustrative: true,
  },
  {
    id: 'sample-studio-b',
    name: 'Illustrative Studio B',
    discipline: 'Digital artwork — placeholder record',
    location: 'Kyoto, Japan',
    bio: 'An illustrative digital practice entry. Its single sample piece is a rising arc held inside a wide, warm field — a placeholder made for this build rather than a published edition.',
    illustrative: true,
  },
  {
    id: 'sample-studio-c',
    name: 'Illustrative Studio C',
    discipline: 'Lighting and objects — placeholder record',
    location: 'Copenhagen, Denmark',
    bio: 'An illustrative lighting entry. Its sample piece is a hand-built stoneware base in a matte sand glaze, paired with a natural linen shade — a placeholder object made for this build.',
    illustrative: true,
  },
  {
    id: 'sample-maker-d',
    name: 'Illustrative Maker D',
    discipline: 'Ceramics — placeholder record',
    location: 'Oaxaca, Mexico',
    bio: 'An illustrative ceramics entry. Its sample piece is a thrown and faceted stoneware vessel in a speckled glaze that keeps the making marks visible.',
    illustrative: true,
  },
  {
    id: 'sample-maker-e',
    name: 'Illustrative Maker E',
    discipline: 'Woodwork — placeholder record',
    location: 'Jaipur, India',
    bio: 'An illustrative woodwork entry. Its sample piece is a panel carved in shallow relief, where the grain and the geometry carry equal weight.',
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
