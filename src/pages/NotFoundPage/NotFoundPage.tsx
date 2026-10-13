import { useLocation } from 'react-router-dom'
import { NotFoundView } from '@/components/NotFoundView/NotFoundView'
import { NavRoutes } from '@/app/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * Not-found route.
 *
 * Serves both `/404` and the catch-all, so an unknown address always lands on
 * the same honest experience. The requested path is shown back to the visitor
 * so they can see what went wrong.
 */
export function NotFoundPage() {
  const { pathname } = useLocation()

  useDocumentTitle({
    title: 'Page not found',
    description: 'That ArtVerse address does not exist.',
  })

  const showReference = pathname !== NavRoutes.notFound

  return <NotFoundView subject="page" reference={showReference ? pathname : undefined} />
}
