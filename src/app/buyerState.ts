/**
 * The buyer journey's state context.
 *
 * The saved list and the cart belong to the visit rather than to one screen: a
 * work saved on its own page is listed on `/wishlist`, added to the cart on
 * `/cart`, summarised on `/checkout` and counted in the header — so the state
 * lives in `MainLayout`, above every page that reads it, and is passed down
 * here.
 *
 * What this is not: persistence. There is no `localStorage`, no cookie and no
 * network call behind it. The lists are held in memory for as long as the app is
 * mounted — stepping between pages keeps them, a reload does not — and every
 * screen that shows them says so in as many words.
 */
import { createContext, useContext, type Dispatch } from 'react'
import type { BuyerJourneyAction, BuyerJourneyState } from '@/utils/buyerJourney'

export interface BuyerStateValue {
  state: BuyerJourneyState
  dispatch: Dispatch<BuyerJourneyAction>
}

export const BuyerStateContext = createContext<BuyerStateValue | undefined>(undefined)

/**
 * The saved list, the cart and the reducer, for any screen in the journey.
 *
 * Throws when used outside the layout that provides it: a cart control rendered
 * without the state behind it would silently do nothing, and failing loudly is
 * better than a button that appears to work.
 */
export function useBuyerState(): BuyerStateValue {
  const value = useContext(BuyerStateContext)
  if (!value) {
    throw new Error('useBuyerState must be used inside the main layout')
  }
  return value
}
