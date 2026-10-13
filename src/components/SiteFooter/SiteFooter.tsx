import { Link } from 'react-router-dom'
import { FOOTER_NAV } from '@/app/navigation'
import { NavRoutes } from '@/app/routes'
import { Brand } from '@/components/Brand/Brand'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import styles from './SiteFooter.module.css'

const CURRENT_YEAR = new Date().getFullYear()

/**
 * Site footer.
 *
 * Only destinations that genuinely exist are listed — no invented policies,
 * support addresses or social accounts.
 */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <PageContainer>
        <div className={styles.top}>
          <div className={styles.intro}>
            <Brand size="md" />
            <p className={styles.tagline}>Where Art Finds Its Universe.</p>
            <p className={styles.note}>
              Artwork records and creator names on these pages are illustrative placeholders —
              there are no live listings, prices or transactions anywhere on ArtVerse yet.
            </p>
          </div>

          {FOOTER_NAV.map((group) => (
            <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
              <h2 className={styles.groupTitle} id={`footer-${group.title}`}>
                {group.title}
              </h2>
              <ul className={styles.groupList}>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link className={styles.groupLink} to={item.to}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© {CURRENT_YEAR} ArtVerse — Where Art Finds Its Universe.</p>
          <p>
            <Link className={styles.groupLink} to={NavRoutes.designSystem}>
              Design system preview
            </Link>
          </p>
        </div>
      </PageContainer>
    </footer>
  )
}
