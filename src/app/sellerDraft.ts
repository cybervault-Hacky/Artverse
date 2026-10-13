/**
 * The workspace's draft context.
 *
 * A listing draft belongs to the workspace rather than to one screen: the
 * listings section shows what the editor holds, and the editor keeps its work
 * when you step back to the listings. The state therefore lives in the
 * workspace layout and is passed down here.
 *
 * What this is not: persistence. There is no storage API behind it, no
 * `localStorage` and no network call — the draft exists for as long as the
 * workspace is mounted, and a reload discards it. Every screen says so.
 */
import { createContext, useContext, type Dispatch } from 'react'
import type { ListingDraftAction, ListingDraftState } from '@/utils/listingDraft'

export interface SellerDraftValue {
  state: ListingDraftState
  dispatch: Dispatch<ListingDraftAction>
}

export const SellerDraftContext = createContext<SellerDraftValue | undefined>(undefined)

/**
 * The draft and its dispatcher, for any screen inside the workspace.
 *
 * Throws when used outside the workspace layout: a listing editor rendered
 * without its workspace would be a bug in the route tree, and failing loudly is
 * better than silently editing a draft nobody can see.
 */
export function useSellerDraft(): SellerDraftValue {
  const value = useContext(SellerDraftContext)
  if (!value) {
    throw new Error('useSellerDraft must be used inside the seller studio workspace')
  }
  return value
}
