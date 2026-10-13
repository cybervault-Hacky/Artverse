import { useEffect } from 'react'

const BRAND = 'ArtVerse'
const TAGLINE = 'Where Art Finds Its Universe.'

interface DocumentTitleOptions {
  /** Page title. When omitted, the brand title and tagline are used (home). */
  title?: string
  /** Replaces the meta description while the page is mounted. */
  description?: string
}

/**
 * Sets the document title and description for a page.
 *
 * Every page is a separate route component, so each one owns its own
 * metadata rather than relying on a central title map.
 */
export function useDocumentTitle({ title, description }: DocumentTitleOptions): void {
  useEffect(() => {
    document.title = title ? `${title} — ${BRAND}` : `${BRAND} — ${TAGLINE}`

    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      meta?.setAttribute('content', description)
    }
  }, [title, description])
}
