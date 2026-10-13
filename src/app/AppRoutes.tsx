import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AboutPage } from '@/pages/AboutPage/AboutPage'
import { ArtistProfilePage } from '@/pages/ArtistProfilePage/ArtistProfilePage'
import { ArtistsPage } from '@/pages/ArtistsPage/ArtistsPage'
import { ArtworkDetailPage } from '@/pages/ArtworkDetailPage/ArtworkDetailPage'
import { CartPage } from '@/pages/CartPage/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage/CheckoutPage'
import { CollectionDetailPage } from '@/pages/CollectionDetailPage/CollectionDetailPage'
import { CreateAccountPage } from '@/pages/CreateAccountPage/CreateAccountPage'
import { CollectionsPage } from '@/pages/CollectionsPage/CollectionsPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage/DesignSystemPage'
import { DiscoverPage } from '@/pages/DiscoverPage/DiscoverPage'
import { HomePage } from '@/pages/HomePage/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage'
import { OrdersPage } from '@/pages/OrdersPage/OrdersPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage/ResetPasswordPage'
import { SellerApplicationPage } from '@/pages/SellerApplicationPage/SellerApplicationPage'
import { SignInPage } from '@/pages/SignInPage/SignInPage'
import { SearchPage } from '@/pages/SearchPage/SearchPage'
import { SellPage } from '@/pages/SellPage/SellPage'
import { SellerStudioLayout } from '@/layouts/SellerStudioLayout'
import { StudioCertificatePage } from '@/pages/StudioCertificatePage/StudioCertificatePage'
import { StudioListingEditorPage } from '@/pages/StudioListingEditorPage/StudioListingEditorPage'
import { StudioListingsPage } from '@/pages/StudioListingsPage/StudioListingsPage'
import { StudioOverviewPage } from '@/pages/StudioOverviewPage/StudioOverviewPage'
import { StudioProfilePreviewPage } from '@/pages/StudioProfilePreviewPage/StudioProfilePreviewPage'
import { StudioVerificationPage } from '@/pages/StudioVerificationPage/StudioVerificationPage'
import { WishlistPage } from '@/pages/WishlistPage/WishlistPage'

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
        {/* The account previews. Three screens behind one path segment, so it is
            obvious at a glance that they are one subject — and so nothing else on
            the site can be mistaken for an account area. */}
        <Route path="account">
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="create" element={<CreateAccountPage />} />
          <Route path="reset" element={<ResetPasswordPage />} />
        </Route>
        {/* The buyer journey. Four destinations that need no account, and that
            hold their state in the tab rather than anywhere else. */}
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        {/* For Artists, and the seller workspace preview beneath it. The
            workspace has its own layout, so its navigation and its in-tab draft
            stay mounted while moving between its sections. */}
        <Route path="sell">
          <Route index element={<SellPage />} />
          {/* The seller application sits outside the workspace: it is the step
              before a studio has anywhere to work. */}
          <Route path="apply" element={<SellerApplicationPage />} />
          <Route path="studio" element={<SellerStudioLayout />}>
            <Route index element={<StudioOverviewPage />} />
            <Route path="listings" element={<StudioListingsPage />} />
            <Route path="listings/new" element={<StudioListingEditorPage />} />
            <Route path="listings/:artworkId" element={<StudioListingEditorPage />} />
            <Route path="profile" element={<StudioProfilePreviewPage />} />
            <Route path="verification" element={<StudioVerificationPage />} />
            <Route path="certificate" element={<StudioCertificatePage />} />
          </Route>
        </Route>
        <Route path="about" element={<AboutPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="design-system" element={<DesignSystemPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
