import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/AppRoutes'

/**
 * Application root: the router plus the shared route tree.
 *
 * `BrowserRouter` gives every destination a real URL — browser history, direct
 * access and refresh all work without a hash.
 */
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
