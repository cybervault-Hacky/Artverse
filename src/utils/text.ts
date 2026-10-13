/** Counts with a readable singular/plural noun, e.g. `1 record`, `6 records`. */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Trims and collapses repeated whitespace in user-supplied text. */
export function normaliseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}
