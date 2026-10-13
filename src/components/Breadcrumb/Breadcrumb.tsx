import { Link } from 'react-router-dom'
import type { Crumb } from '@/types'
import { cn } from '@/utils/cn'
import styles from './Breadcrumb.module.css'

interface BreadcrumbProps {
  items: Crumb[]
  className?: string
}

/**
 * Breadcrumb trail for nested routes such as collection, artwork and artist
 * pages. The final entry is the current page and is not a link.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn(styles.nav, className)}>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={`${item.label}-${item.to ?? 'current'}`} className={styles.item}>
            {item.to ? (
              <Link className={styles.link} to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
