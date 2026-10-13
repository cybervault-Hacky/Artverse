import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ALL_DISCIPLINES,
  DEFAULT_SORT,
  buildCatalogueView,
  parseCatalogueCriteria,
  writeCatalogueCriteria,
  type CatalogueCriteria,
  type CatalogueView,
  type DisciplineFilter,
  type SortOption,
} from '@/utils/catalogue'

type CriteriaPatch = Partial<Pick<CatalogueCriteria, 'query' | 'discipline' | 'sort'>>

export interface CatalogueParams extends CatalogueView {
  criteria: CatalogueCriteria
  /**
   * The search field's own value, updated on the keystroke rather than when the
   * address catches up. See the note in the hook.
   */
  query: string
  /** Called on every keystroke, so results keep up with the field. */
  setQuery: (query: string) => void
  setDiscipline: (discipline: DisciplineFilter) => void
  setSort: (sort: SortOption) => void
  clearQuery: () => void
  /** Returns search, discipline and sort to their defaults in one step. */
  resetAll: () => void
}

/**
 * Keeps the catalogue's criteria in the URL and derives the visible records.
 *
 * The URL is the single source of truth, which is what makes a filtered view
 * shareable and makes browser back and forward work without extra wiring: the
 * address changes, the criteria are re-read, the grid re-renders. Typing writes
 * with `replace`, so a search does not bury the previous page under one history
 * entry per letter; choosing a discipline, changing the order or clearing
 * pushes an entry, so back undoes it.
 *
 * The search text is the one value deliberately *not* read back out of the
 * address on its way to the field. React Router wraps navigations in
 * `startTransition`, so a value controlled by the address would make each
 * keystroke wait on that transition — and a controlled input whose prop has not
 * caught up yet can have the character the visitor just typed rewound out of
 * it. So the field keeps its own urgent state and the address follows, while
 * everything the visitor sees below the field — the count, the grid, the empty
 * state — is derived from the address and can trail by a frame without anyone
 * noticing.
 *
 * When the address changes for any other reason — back, forward, a shared link,
 * the clear control — the field catches up during render. That is the pattern
 * React recommends for adjusting state when an input to it changes, and it
 * keeps the two in step without an effect that writes state.
 */
export function useCatalogueParams(): CatalogueParams {
  const [searchParams, setSearchParams] = useSearchParams()
  const criteria = parseCatalogueCriteria(searchParams)
  const view = buildCatalogueView(criteria)

  const [query, setTypedQuery] = useState(criteria.query)
  const [queryFromAddress, setQueryFromAddress] = useState(criteria.query)

  if (queryFromAddress !== criteria.query) {
    setQueryFromAddress(criteria.query)
    setTypedQuery(criteria.query)
  }

  const commit = useCallback(
    (patch: CriteriaPatch, replace: boolean) => {
      setSearchParams(
        writeCatalogueCriteria({
          query: patch.query ?? criteria.query,
          discipline: patch.discipline ?? criteria.discipline,
          sort: patch.sort ?? criteria.sort,
        }),
        { replace },
      )
    },
    [criteria.query, criteria.discipline, criteria.sort, setSearchParams],
  )

  const setQuery = useCallback(
    (value: string) => {
      setTypedQuery(value)
      commit({ query: value }, true)
    },
    [commit],
  )

  const clearQuery = useCallback(() => {
    setTypedQuery('')
    commit({ query: '' }, false)
  }, [commit])

  const resetAll = useCallback(() => {
    setTypedQuery('')
    commit({ query: '', discipline: ALL_DISCIPLINES, sort: DEFAULT_SORT }, false)
  }, [commit])

  const setDiscipline = useCallback(
    (discipline: DisciplineFilter) => commit({ discipline }, false),
    [commit],
  )
  const setSort = useCallback((sort: SortOption) => commit({ sort }, false), [commit])

  return {
    criteria,
    ...view,
    query,
    setQuery,
    setDiscipline,
    setSort,
    clearQuery,
    resetAll,
  }
}
