import { useEffect, useMemo, useReducer } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { SellerDraftContext } from '@/app/sellerDraft'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { StatusTag } from '@/components/StatusTag/StatusTag'
import { TextLink } from '@/components/TextLink/TextLink'
import { initialListingDraftState, listingDraftReducer } from '@/utils/listingDraft'
import {
  PREVIEW_STUDIO_NOTE,
  STUDIO_SECTIONS,
  getPreviewStudioEntry,
  originFromPath,
} from '@/utils/sellerStudio'
import { cn } from '@/utils/cn'
import styles from './SellerStudioLayout.module.css'

/**
 * The seller workspace shell.
 *
 * One place holds what every workspace screen shares:
 *
 * 1. **The draft.** A `useReducer` over the pure listing-draft model, provided
 *    to the screens below through context. It survives navigation between
 *    workspace screens because this layout stays mounted, and it survives
 *    nothing else — no storage, no server, by design.
 * 2. **The navigation.** A sidebar from 1024px and a horizontally scrolling
 *    row of the same links below it. Both are ordinary links, so the workspace
 *    works without hover, without JavaScript-only affordances and with the
 *    keyboard, and `NavLink` marks the current section for assistive
 *    technology.
 * 3. **The framing.** The preview studio's name and the preview marker, so no
 *    screen in the workspace can be mistaken for a signed-in account.
 */
export function SellerStudioLayout() {
  const location = useLocation()

  /**
   * The draft's origin, straight from the address, so a record-backed editor
   * renders its record's fields on the very first pass in the browser and on the
   * server alike.
   */
  const origin = useMemo(() => originFromPath(location.pathname), [location.pathname])

  const [state, dispatch] = useReducer(listingDraftReducer, origin, initialListingDraftState)

  /**
   * Links between two different records reselect the origin. The reducer keeps
   * the working draft when the origin has not actually changed, so stepping away
   * from the editor and back does not throw an edit away.
   */
  useEffect(() => {
    dispatch({ type: 'selectOrigin', origin })
  }, [dispatch, origin])

  const entry = getPreviewStudioEntry()

  return (
    <SellerDraftContext.Provider value={{ state, dispatch }}>
      <div className={styles.workspace}>
        <PageContainer>
          <header className={styles.masthead}>
            <p className={styles.eyebrow}>Artist studio</p>
            <div className={styles.identity}>
              <p className={styles.studioName}>
                {entry ? entry.name : 'Studio name not recorded'}
              </p>
              <StatusTag tone="accent">Preview</StatusTag>
            </div>
            <p className={styles.mastheadNote}>{PREVIEW_STUDIO_NOTE}</p>
          </header>

          <div className={styles.shell}>
            <div className={styles.sidebar}>
              <nav className={styles.nav} aria-label="Studio workspace">
                <ul className={styles.navList}>
                  {STUDIO_SECTIONS.map((section) => (
                    <li key={section.id}>
                      <NavLink
                        className={({ isActive }) =>
                          cn(styles.navLink, isActive && styles.navLinkActive)
                        }
                        to={section.to}
                        end={section.to === NavRoutes.studio}
                      >
                        <span className={styles.navLabel}>{section.label}</span>
                        <span className={styles.navDescription}>{section.description}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={styles.sidebarFoot}>
                <TextLink to={NavRoutes.sell}>About the artist experience</TextLink>
                {entry?.href ? (
                  <TextLink to={entry.href}>Public studio profile</TextLink>
                ) : null}
              </div>
            </div>

            <div className={styles.content}>
              <Outlet />
            </div>
          </div>
        </PageContainer>
      </div>
    </SellerDraftContext.Provider>
  )
}
