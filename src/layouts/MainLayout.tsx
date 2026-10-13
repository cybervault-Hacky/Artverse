import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/app/ScrollToTop'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { SkipLink } from '@/components/SkipLink/SkipLink'
import styles from './MainLayout.module.css'

/**
 * Shared shell for every route: skip link, header, the routed page and footer.
 * Exactly one `main` landmark exists per document.
 */
export function MainLayout() {
  return (
    <div className={styles.app}>
      <ScrollToTop />
      <SkipLink />
      <SiteHeader />
      <main className={styles.main} id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
