/** Counts with a readable singular/plural noun, e.g. `1 record`, `6 records`. */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Trims and collapses repeated whitespace in user-supplied text. */
export function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/**
 * True when a value is a string with something in it.
 *
 * The single place ArtVerse decides whether an optional field is worth showing.
 * A field holding only spaces is treated as absent, so a record can never
 * render a label above nothing.
 */
export function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}
