import { ArtworkFrame } from '@/components/ArtworkFrame/ArtworkFrame'
import { CheckIcon } from '@/components/icons/Icons'
import { buildDisciplineFacets, type DisciplineFilter } from '@/utils/catalogue'
import { cn } from '@/utils/cn'
import { countLabel } from '@/utils/text'
import styles from './DisciplineNav.module.css'

interface DisciplineNavProps {
  /** The active search text, so the tile counts describe what is findable now. */
  needle: string
  selected: DisciplineFilter
  onSelect: (discipline: DisciplineFilter) => void
  className?: string
}

/**
 * The discipline selector for the discovery catalogue.
 *
 * Phase 3 used this row as an index: with no per-discipline route, each entry
 * had to link to a representative work so that no filtering was implied. The
 * catalogue can now genuinely filter, so the same row — same artwork covers,
 * same rhythm — became the control itself: six toggles covering the five
 * disciplines plus “All Art”. Nothing was thrown away and nothing competes
 * with it; the homepage keeps its own large editorial showcase.
 *
 * Accessibility notes:
 * - `role="group"` rather than `nav`, because these toggle the catalogue
 *   instead of navigating to another page.
 * - Each tile is a real `<button>` carrying `aria-pressed`, so its selected
 *   state reaches assistive technology and the row is keyboard-operable.
 * - The cover sits inside an `aria-hidden` wrapper: the image still has its
 *   real alternative text for the automated checks and for any context where
 *   it stands alone, but it never pads the button's accessible name, which
 *   stays “Fine Paintings 2 works”.
 * - Selection is shown by a ring, a check badge and an underlined label — never
 *   by colour alone.
 */
export function DisciplineNav({ needle, selected, onSelect, className }: DisciplineNavProps) {
  const facets = buildDisciplineFacets(needle)

  return (
    <div
      className={cn(styles.nav, className)}
      role="group"
      aria-label="Filter the catalogue by discipline"
    >
      <ul className={styles.list}>
        {facets.map((facet) => {
          const isSelected = facet.id === selected

          return (
            <li key={facet.id} className={styles.item}>
              <button
                type="button"
                className={styles.tile}
                aria-pressed={isSelected}
                onClick={() => onSelect(facet.id)}
              >
                <span className={styles.cover} aria-hidden="true">
                  {facet.artwork ? (
                    <ArtworkFrame
                      className={styles.thumb}
                      src={facet.artwork.image.src}
                      alt={facet.artwork.image.alt}
                      width={facet.artwork.image.width}
                      height={facet.artwork.image.height}
                      aspect="portrait"
                      sizes="(min-width: 1024px) 8.5rem, (min-width: 768px) 6.5rem, 8.5rem"
                    />
                  ) : (
                    <span className={styles.allMark}>All</span>
                  )}
                  {isSelected ? (
                    <span className={styles.check}>
                      <CheckIcon width={14} height={14} />
                    </span>
                  ) : null}
                </span>

                <span className={styles.label}>{facet.label}</span>
                <span className={styles.count}>{countLabel(facet.count, 'work')}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
