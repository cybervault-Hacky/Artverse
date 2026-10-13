import { useReducer } from 'react'
import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/app/ScrollToTop'
import { BuyerStateContext } from '@/app/buyerState'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { SkipLink } from '@/components/SkipLink/SkipLink'
import { EMPTY_BUYER_JOURNEY, buyerJourneyReducer } from '@/utils/buyerJourney'
import styles from './MainLayout.module.css'

/**
 * Shared shell for every route: skip link, header, the routed page and footer.
 * Exactly one `main` landmark exists per document.
 *
 * It also owns the buyer journey state — the saved list and the cart — because
 * that state belongs to the visit rather than to one screen: the header counts
 * it, an artwork page adds to it, and four destinations read it. It is a
 * `useReducer` over a pure model and nothing else: no storage API is touched, so
 * a reload starts over, and every page that shows the lists says so.
 */
export function MainLayout() {
  const [buyerState, dispatch] = useReducer(buyerJourneyReducer, EMPTY_BUYER_JOURNEY)

  return (
    <BuyerStateContext.Provider value={{ state: buyerState, dispatch }}>
      <div className={styles.app}>
        <ScrollToTop />
        <SkipLink />
        <SiteHeader />
        <main className={styles.main} id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </BuyerStateContext.Provider>
  )
}
