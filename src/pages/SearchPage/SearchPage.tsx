import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Button } from '@/components/Button/Button'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { TextLink } from '@/components/TextLink/TextLink'
import { searchSampleArtworks } from '@/data'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { countLabel } from '@/utils/text'
import styles from './SearchPage.module.css'

const SUGGESTIONS = ['ceramic', 'ochre', 'digital', 'hand-carved']

/**
 * Search results.
 *
 * The query lives in the URL, so a search is shareable and survives a refresh.
 * What is searched is stated plainly: the six illustrative sample records, not
 * a marketplace index — because a real index does not exist yet.
 */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const results = searchSampleArtworks(query)

  useDocumentTitle({
    title: query ? `Search — ${query}` : 'Search',
    description: 'Search the illustrative ArtVerse sample records by title, medium or category.',
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('q')
    const next = typeof value === 'string' ? value.trim() : ''
    setSearchParams(next ? { q: next } : {})
  }

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Find a work, a medium or a studio"
        intro="Search runs against the illustrative sample records shipped in this phase — six placeholder works and five placeholder creators."
      />

      <Section spacing="tight" ariaLabelledBy="search-results-heading">
        <PageContainer>
          <form className={styles.form} role="search" onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="search-input">
                Search terms
              </label>
              <input
                className={styles.input}
                id="search-input"
                name="q"
                type="search"
                /* Remounts when the URL query changes, so back and forward
                   navigation always shows the query the results belong to. */
                key={query}
                defaultValue={query}
                placeholder="Try “ceramic” or “ochre”"
                autoComplete="off"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <h2 id="search-results-heading" className="visually-hidden">
            Results
          </h2>

          {query === '' ? (
            <div className={styles.results}>
              <EmptyState
                title="Nothing searched yet"
                description="Enter a term above, or start from one of these."
                action={
                  <div className={styles.suggestions}>
                    <ul className={styles.suggestionsList}>
                      {SUGGESTIONS.map((suggestion) => (
                        <li key={suggestion}>
                          <Link to={`${NavRoutes.search}?q=${encodeURIComponent(suggestion)}`}>
                            <TextLink arrow>{suggestion}</TextLink>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
            </div>
          ) : results.length === 0 ? (
            <div className={styles.results}>
              <EmptyState
                title={`No sample records match “${query}”`}
                description="Nothing in the placeholder set matches that term. Try a broader word such as a medium, a material or a category."
                action={<Button to={NavRoutes.discover}>Browse all sample records</Button>}
              />
            </div>
          ) : (
            <>
              <div className={styles.resultsMeta}>
                <span>
                  {countLabel(results.length, 'sample record')} for “{query}”
                </span>
                <span>Illustrative placeholders, not listings</span>
              </div>
              <ArtworkGrid
                className={styles.results}
                artworks={results}
                label={`Search results for ${query}`}
              />
            </>
          )}

          <p className={styles.scopeNote}>
            This searches the sample set only, so a small result count is expected. Marketplace-wide
            search across real studios and listings is planned for a later phase.
          </p>

          <PhaseNote
            className={styles.results}
            phase="Phase 7"
            description="Explore Art now carries live search, discipline filtering and sorting over the same six records. This page stays as the direct search destination until a real index replaces it."
            items={[
              'Deeper filters for medium, size and material.',
              'Saved searches and recently viewed work.',
              'Faster, server-backed results as the catalogue grows.',
              'One search experience rather than two reading the same sample set.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
