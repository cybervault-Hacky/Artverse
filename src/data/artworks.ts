import type { Artwork } from '@/types'

/**
 * Illustrative sample artwork records.
 *
 * These are placeholders used to test frames, grids and typography — they are
 * not listings, and no sales, prices, provenance or marketplace activity is
 * implied. Every record carries `sample: true`, and the imagery in
 * `public/artworks/` was created specifically for this project.
 */
export const SAMPLE_ARTWORKS: Artwork[] = [
  {
    id: 'sample-painting-01',
    title: 'Layered Light, Study I',
    category: 'painting',
    medium: 'Oil on canvas',
    year: 2024,
    dimensions: '60 × 90 cm',
    description:
      'Thick, layered brushwork in cream, ochre and charcoal, built up until the surface appears to hold its own light.',
    image: {
      src: '/artworks/sample-01.jpg',
      width: 768,
      height: 1376,
      alt: 'Abstract oil painting in cream, ochre and charcoal with heavily layered brushwork.',
    },
    aspect: 'portrait',
    creatorId: 'sample-studio-a',
    sample: true,
  },
  {
    id: 'sample-digital-01',
    title: 'Arc of Quiet Light',
    category: 'digital',
    medium: 'Digital artwork, single edition',
    year: 2025,
    dimensions: '40 × 40 cm as a print',
    description:
      'A digital study of a single rising arc, held inside a wide, quiet field of warm off-white.',
    image: {
      src: '/artworks/sample-02.jpg',
      width: 1024,
      height: 1024,
      alt: 'Minimal digital artwork with a soft gold arc rising over a warm cream field.',
    },
    aspect: 'square',
    creatorId: 'sample-studio-b',
    sample: true,
  },
  {
    id: 'sample-decor-01',
    title: 'Sandstone Table Lamp',
    category: 'decor',
    medium: 'Hand-glazed stoneware, linen shade',
    year: 2025,
    dimensions: '38 × 24 cm',
    description:
      'A hand-built base finished in a matte sandstone glaze, paired with a natural linen shade that softens the light it carries.',
    image: {
      src: '/artworks/sample-03.jpg',
      width: 768,
      height: 1376,
      alt: 'Handcrafted stoneware table lamp with a speckled sand glaze and a natural linen drum shade.',
    },
    aspect: 'portrait',
    creatorId: 'sample-studio-c',
    sample: true,
  },
  {
    id: 'sample-handmade-01',
    title: 'Speckled Stoneware Vessel',
    category: 'handmade',
    medium: 'Hand-thrown stoneware',
    year: 2025,
    dimensions: '22 × 18 cm',
    description:
      'Thrown and gently faceted, then finished in a speckled sand glaze that keeps the maker’s marks visible.',
    image: {
      src: '/artworks/sample-04.jpg',
      width: 1024,
      height: 1024,
      alt: 'Hand-thrown speckled stoneware vessel with a matte sand glaze on a warm white backdrop.',
    },
    aspect: 'square',
    creatorId: 'sample-maker-d',
    sample: true,
  },
  {
    id: 'sample-custom-01',
    title: 'Carved Oak Relief Panel',
    category: 'custom',
    medium: 'Hand-carved oak',
    year: 2024,
    dimensions: '50 × 70 cm',
    description:
      'A panel carved in shallow relief so that the grain and the geometry carry equal weight.',
    image: {
      src: '/artworks/sample-05.jpg',
      width: 768,
      height: 1376,
      alt: 'Hand-carved oak relief panel with fine geometric carving in warm natural tones.',
    },
    aspect: 'portrait',
    creatorId: 'sample-maker-e',
    sample: true,
  },
  {
    id: 'sample-painting-02',
    title: 'Ochre Field',
    category: 'painting',
    medium: 'Acrylic on linen',
    year: 2023,
    dimensions: '45 × 80 cm',
    description:
      'A single ochre form held inside a wide off-white field — a quiet painting about balance and empty space.',
    image: {
      src: '/artworks/sample-06.jpg',
      width: 768,
      height: 1376,
      alt: 'Tall minimal painting with a single soft ochre form floating in a warm off-white field.',
    },
    aspect: 'tall',
    creatorId: 'sample-studio-a',
    sample: true,
  },
]
