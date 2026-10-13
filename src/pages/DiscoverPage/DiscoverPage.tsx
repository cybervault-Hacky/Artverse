import type { ChangeEvent, FormEvent } from 'react'
import { NavRoutes } from '@/app/routes'
import { ArtworkGrid } from '@/components/ArtworkGrid/ArtworkGrid'
import { Button } from '@/components/Button/Button'
import { CollectionGrid } from '@/components/CollectionGrid/CollectionGrid'
import { DisciplineNav } from '@/components/DisciplineNav/DisciplineNav'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { PhaseNote } from '@/components/PhaseNote/PhaseNote'
import { Section } from '@/components/Section/Section'
import { SectionHeading } from '@/components/SectionHeading/SectionHeading'
import { TextLink } from '@/components/TextLink/TextLink'
import { ChevronDownIcon, CloseIcon, SearchIcon } from '@/components/icons/Icons'
import { SAMPLE_COLLECTIONS, getArtworkById } from '@/data'
import { useCatalogueParams } from '@/hooks/useCatalogueParams'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SORT_OPTIONS, disciplineLabel, isSortOption } from '@/utils/catalogue'
import { cn } from '@/utils/cn'
import { countLabel } from '@/utils/text'
import styles from './DiscoverPage.module.css'

/**
 * Explore Art — the discovery catalogue.
 *
 * The page still reads top to bottom as one idea: what can be explored, then
 * the works themselves, then the groupings. What changed in Phase 4 is that the
 * catalogue is now something you can actually interrogate:
 *
 * 1. The discipline row is a filter. It used to be an index pointing at a
 *    representative work, because nothing could be filtered yet; now those same
 *    tiles — plus “All Art” — narrow the catalogue for real.
 * 2. Search is live and unsubmitted. Results follow each keystroke, and the
 *    criteria live in the address, so any view can be linked, refreshed and
 *    stepped back through.
 * 3. Only the orders the data can support are offered: the curated order the
 *    catalogue was written in, title either way, and artist A–Z. No price,
 *    popularity or rating sort exists because no such data exists.
 * 4. An empty result is a real answer, not a dead end: it says what was
 *    searched, keeps every control in place and offers one way back.
 */
export function DiscoverPage() {
  const {
    criteria,
    artworks,
    total,
    // The field's own value: urgent, so typing is never at the mercy of a
    // transition. Everything below the field comes from `criteria`.
    query,
    hasQuery,
    hasDiscipline,
    isNarrowed,
    isAdjusted,
    setQuery,
    setDiscipline,
    setSort,
    clearQuery,
    resetAll,
  } = useCatalogueParams()

  useDocumentTitle({
    title: hasQuery ? `Explore Art — ${criteria.needle}` : 'Explore Art',
    description:
      'Discover works across five creative disciplines — fine paintings, digital artwork, decorative lamps, handmade products and custom creations — with live search, discipline filters and sorting.',
  })

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (isSortOption(event.target.value)) setSort(event.target.value)
  }

  // Live results mean no submit action; Enter is simply absorbed.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault()

  // Only search and discipline hide anything; a sort change reorders the same
  // six records, so the count keeps saying “showing all” and never implies that
  // work has gone missing.
  const resultsText = isNarrowed
    ? `${artworks.length} of ${countLabel(total, 'sample record')} match`
    : `Showing all ${countLabel(total, 'sample record')}`

  const activeCriteria = [
    hasQuery ? `“${criteria.needle}”` : null,
    hasDiscipline ? `the ${disciplineLabel(criteria.discipline)} discipline` : null,
  ]
    .filter(Boolean)
    .join(' in ')

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Explore Art"
        intro="Works from independent creators across five disciplines — fine paintings, digital artwork, decorative lamps, handmade products and custom creations. Every record here is an illustrative placeholder made for this build."
      />

      <Section spacing="tight" ariaLabelledBy="disciplines-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Disciplines"
            title="Explore by discipline"
            id="disciplines-title"
            description={`Choose a discipline to narrow the catalogue, or stay with all art. The counts describe the ${countLabel(total, 'illustrative record')} in this build.`}
          />

          <DisciplineNav needle={criteria.needle} selected={criteria.discipline} onSelect={setDiscipline} />
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="catalogue-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Catalogue"
            title="The catalogue"
            id="catalogue-title"
            description="Search the sample set by title, medium, description, discipline or studio, then set the order you want to read it in."
          />

          <div className={styles.controls}>
            <form className={styles.search} role="search" onSubmit={handleSubmit}>
              <label className={styles.controlLabel} htmlFor="catalogue-search">
                Search the catalogue
              </label>
              <span className={styles.inputWrap}>
                <SearchIcon className={styles.searchIcon} width={18} height={18} />
                <input
                  className={cn(styles.input, query !== '' && styles.inputWithClear)}
                  id="catalogue-search"
                  name="q"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search artworks, artists, or styles"
                  autoComplete="off"
                />
                {query !== '' ? (
                  <button
                    className={styles.clearInput}
                    type="button"
                    onClick={clearQuery}
                    aria-label="Clear search"
                  >
                    <CloseIcon width={18} height={18} />
                  </button>
                ) : null}
              </span>
            </form>

            <div className={styles.sort}>
              <label className={styles.controlLabel} htmlFor="catalogue-sort">
                Sort by
              </label>
              <span className={styles.selectWrap}>
                <select
                  className={styles.select}
                  id="catalogue-sort"
                  value={criteria.sort}
                  onChange={handleSortChange}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className={styles.chevron} width={18} height={18} />
              </span>
            </div>

            <div className={styles.status}>
              <p className={styles.resultsCount} aria-live="polite">
                {resultsText}
              </p>
              {isAdjusted ? (
                <Button variant="quiet" onClick={resetAll}>
                  Clear all
                </Button>
              ) : null}
            </div>
          </div>

          {artworks.length > 0 ? (
            <>
              <ArtworkGrid
                className={styles.catalogue}
                artworks={artworks}
                label={isNarrowed ? 'Artwork records matching the filters' : 'All artwork records'}
                aspect="portrait"
                eagerCount={Math.min(3, artworks.length)}
              />
              <p className={styles.note}>
                The grid holds every work in a 4:5 frame so rows stay aligned; each artwork page
                shows the piece in full, at its own proportions. The studios behind these records
                are listed under <TextLink to={NavRoutes.artists}>Artists &amp; Studios</TextLink>.
              </p>
            </>
          ) : (
            <EmptyState
              className={styles.catalogue}
              title="No works match these filters"
              description={`None of the ${countLabel(total, 'illustrative record')} match ${activeCriteria}. Try a broader word, or clear the filters to see the whole catalogue.`}
              action={
                <Button variant="secondary" onClick={resetAll}>
                  Clear search and filters
                </Button>
              }
            />
          )}
        </PageContainer>
      </Section>

      <Section divided spacing="tight" ariaLabelledBy="collections-title">
        <PageContainer>
          <SectionHeading
            eyebrow="Collections"
            title="Collections to start from"
            id="collections-title"
            description="Four sample groupings that hold works together by mood, material and light rather than by category."
            action={
              <TextLink to={NavRoutes.collections} arrow>
                All collections
              </TextLink>
            }
          />

          <CollectionGrid
            className={styles.collections}
            collections={SAMPLE_COLLECTIONS}
            label="Sample collections"
            leadArtworkFor={(collection) => getArtworkById(collection.artworkIds[0])}
          />

          <PhaseNote
            className={styles.phase}
            phase="Phase 7"
            title="Still to come on this page"
            description="Search, discipline filtering and sorting now work across the sample set. These are the parts that need a real catalogue behind them."
            items={[
              'Filtering by medium, size and material, not only discipline.',
              'Pagination as the catalogue outgrows a single page.',
              'Saved searches and recently viewed work.',
              'Indexed search across a real catalogue rather than six sample records.',
            ]}
          />
        </PageContainer>
      </Section>
    </>
  )
}
