import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CollectionsSection } from './sections/CollectionsSection'
import { DisciplinesSection } from './sections/DisciplinesSection'
import { HeroSection } from './sections/HeroSection'
import { SellerInvitationSection } from './sections/SellerInvitationSection'
import { SpotlightSection } from './sections/SpotlightSection'

/**
 * The ArtVerse homepage.
 *
 * Five editorial sections in a deliberate order: the hero and its floating
 * composition, the five disciplines, one work in focus, the four artistic
 * worlds, then the invitation for studios. Each section is its own component
 * with its own styles, so nothing here is a monolith.
 *
 * Every section is fed by `src/data/homepage.ts`, which names the exact sample
 * records to present. Nothing on this page claims live marketplace activity.
 */
export function HomePage() {
  useDocumentTitle({
    description:
      'Discover original works from independent creators worldwide — fine paintings, digital artwork, decorative lamps, handmade objects and custom creations. ArtVerse: Where Art Finds Its Universe.',
  })

  return (
    <>
      <HeroSection />
      <DisciplinesSection />
      <SpotlightSection />
      <CollectionsSection />
      <SellerInvitationSection />
    </>
  )
}
