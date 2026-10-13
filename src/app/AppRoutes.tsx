import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AboutPage } from '@/pages/AboutPage/AboutPage'
import { ArtistProfilePage } from '@/pages/ArtistProfilePage/ArtistProfilePage'
import { ArtistsPage } from '@/pages/ArtistsPage/ArtistsPage'
import { ArtworkDetailPage } from '@/pages/ArtworkDetailPage/ArtworkDetailPage'
import { CollectionDetailPage } from '@/pages/CollectionDetailPage/CollectionDetailPage'
import { CollectionsPage } from '@/pages/CollectionsPage/CollectionsPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage/DesignSystemPage'
import { DiscoverPage } from '@/pages/DiscoverPage/DiscoverPage'
import { HomePage } from '@/pages/HomePage/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage'
import { SearchPage } from '@/pages/SearchPage/SearchPage'
import { SellPage } from '@/pages/SellPage/SellPage'

/**
 * The route tree itself, kept separate from the router so it can be mounted
 * with any router — `BrowserRouter` in the app, `MemoryRouter` in route
 * verification.
 *
 * `MainLayout` is the shared element route, so the header, footer, skip link
 * and scroll restoration wrap every destination exactly once. Nested paths are
 * relative to the layout root, and the catch-all renders the not-found
 * experience for unknown routes.
 *
 * Pages are imported statically: Phase 1 ships one small bundle, which keeps
 * first paint predictable. Route-level code splitting is a later optimisation.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="discover/:collectionId" element={<CollectionDetailPage />} />
        <Route path="artwork/:artworkId" element={<ArtworkDetailPage />} />
        <Route path="artists" element={<ArtistsPage />} />
        <Route path="artists/:artistId" element={<ArtistProfilePage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="sell" element={<SellPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="design-system" element={<DesignSystemPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
