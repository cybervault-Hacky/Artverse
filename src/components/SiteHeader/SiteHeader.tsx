import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MOBILE_NAV, PRIMARY_NAV } from '@/app/navigation'
import { NavRoutes } from '@/app/routes'
import { Brand } from '@/components/Brand/Brand'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { CloseIcon, MenuIcon, SearchIcon } from '@/components/icons/Icons'
import { cn } from '@/utils/cn'
import styles from './SiteHeader.module.css'

/**
 * Site-wide header.
 *
 * Desktop shows a balanced horizontal row: brand, primary destinations, then
 * search and the seller link. Below 1024px the primary destinations move into
 * an accessible panel that closes on navigation or Escape.
 */
export function SiteHeader() {
  const location = useLocation()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  /**
   * The open menu remembers the path it was opened on, so any navigation —
   * including browser back and forward — closes it without extra effects.
   */
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const isMenuOpen = menuPath === location.pathname

  const openMenu = () => setMenuPath(location.pathname)
  const closeMenu = () => setMenuPath(null)

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuPath(null)
        menuButtonRef.current?.focus()
      }
    }

    /**
     * The panel is hidden by CSS from 1024px, but the scroll lock is applied by
     * this effect. Without closing on the breakpoint, rotating a device or
     * resizing a window while the panel is open would leave the page unscrollable.
     */
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuPath(null)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    desktopQuery.addEventListener('change', handleBreakpointChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      desktopQuery.removeEventListener('change', handleBreakpointChange)
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(styles.navLink, isActive && styles.navLinkActive)

  const panelLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(styles.panelLink, isActive && styles.panelLinkActive)

  return (
    <header className={styles.header}>
      <PageContainer className={styles.inner}>
        <Brand className={styles.brand} />

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <NavLink className={navLinkClass} to={item.to} end={item.to === NavRoutes.home}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <NavLink
            to={NavRoutes.search}
            className={styles.iconButton}
            aria-label="Search ArtVerse"
            title="Search ArtVerse"
          >
            <SearchIcon />
            <span className={styles.searchLabel} aria-hidden="true">
              Search
            </span>
          </NavLink>

          {/* One seller entry point, leading to the page that explains the
              artist workflow and what the workspace preview contains. */}
          <Button className={styles.sellerLink} to={NavRoutes.sell} variant="secondary" size="sm">
            For Artists
          </Button>

          <button
            ref={menuButtonRef}
            type="button"
            className={cn(styles.iconButton, styles.menuButton)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={isMenuOpen ? closeMenu : openMenu}
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </PageContainer>

      {/* A disclosure panel rather than a modal dialog: focus is never
          trapped, and Escape or a navigation click closes it. */}
      {isMenuOpen ? (
        <div className={styles.panel} id="mobile-navigation">
          <nav aria-label="Mobile">
            <ul className={styles.panelList}>
              {MOBILE_NAV.map((item) => (
                <li key={item.to} className={styles.panelItem}>
                  <NavLink
                    className={panelLinkClass}
                    to={item.to}
                    end={item.to === NavRoutes.home}
                    onClick={closeMenu}
                  >
                    {item.label}
                    <span aria-hidden="true">→</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.panelFooter}>
            <Button to={NavRoutes.search} variant="secondary" block onClick={closeMenu}>
              Search ArtVerse
            </Button>
            <p className={styles.panelNote}>
              Browse the sample records. Every artwork, studio and collection here is an
              illustrative placeholder.
            </p>
          </div>
        </div>
      ) : null}
    </header>
  )
}
