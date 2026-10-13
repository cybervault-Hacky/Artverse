import { Link } from 'react-router-dom'
import { NavRoutes } from '@/app/routes'
import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { getDisciplineShowcases } from '@/data'
import styles from './DisciplineNav.module.css'

/**
 * Creative discipline navigation for the discovery catalogue.
 *
 * A deliberate routing decision: ArtVerse has no per-discipline route yet, and
 * the catalogue cannot be filtered by discipline until a later phase. Rather
 * than send every discipline to the same placeholder or invent a query
 * parameter that does nothing, each discipline links to a real, working
 * destination — the artwork page of the work that represents it — and the link
 * is labelled with that work's title, so the destination is never a surprise
 * and no filtering behaviour is implied.
 *
 * Distinct from the homepage's editorial discipline showcase, which presents the
 * same five directions as large feature images and sends visitors here.
 */
export function DisciplineNav() {
  const showcases = getDisciplineShowcases()

  return (
    <nav className={styles.nav} aria-label="Creative disciplines">
      <ul className={styles.list}>
        {showcases.map(({ discipline, artwork }) =>
          artwork ? (
            <li key={discipline.id} className={styles.item}>
              <Link className={styles.link} to={NavRoutes.artwork(artwork.id)}>
                <ArtworkFrame
                  className={styles.thumb}
                  src={artwork.image.src}
                  alt={artwork.image.alt}
                  width={artwork.image.width}
                  height={artwork.image.height}
                  aspect="portrait"
                  ratio={artwork.image.width / artwork.image.height}
                  sizes="(min-width: 768px) 10rem, 8.5rem"
                />
                <span className={styles.label}>{discipline.label}</span>
                <span className={styles.work}>{artwork.title}</span>
                <span className="visually-hidden">— view artwork</span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </nav>
  )
}
