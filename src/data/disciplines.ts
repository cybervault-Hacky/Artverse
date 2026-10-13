import type { Discipline } from '@/types'
import { ARTWORK_CATEGORIES } from './creators'

/**
 * The five creative disciplines.
 *
 * Each discipline reuses the marketplace category labels and points at one
 * sample record that carries its cover image, so the homepage section is
 * driven by data. Descriptions stay factual about what the sample set holds —
 * no claims about catalogue size or availability.
 */
const DISCIPLINE_DESCRIPTIONS: Record<Discipline['id'], string> = {
  painting: 'Original canvases and works on linen, in oil and acrylic.',
  digital: 'Digital pieces made for screens, and for print at a considered scale.',
  decor: 'Hand-built lighting in glazed stoneware and natural linen.',
  handmade: 'Thrown, carved and built objects where the making stays visible.',
  custom: 'Pieces made to a space, a scale or a brief.',
}

const DISCIPLINE_COVERS: Record<Discipline['id'], string> = {
  painting: 'sample-painting-01',
  digital: 'sample-digital-01',
  decor: 'sample-decor-01',
  handmade: 'sample-handmade-01',
  custom: 'sample-custom-01',
}

export const SAMPLE_DISCIPLINES: Discipline[] = ARTWORK_CATEGORIES.map((category) => ({
  id: category.id,
  label: category.label,
  description: DISCIPLINE_DESCRIPTIONS[category.id],
  sampleArtworkId: DISCIPLINE_COVERS[category.id],
}))
