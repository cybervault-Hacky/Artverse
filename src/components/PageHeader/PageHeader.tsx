import type { ReactNode } from 'react'
import type { Crumb } from '@/types'
import { cn } from '@/utils/cn'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  /** The page's single `h1`. */
  title: string
  /** Small editorial label above the title. */
  eyebrow?: string
  intro?: ReactNode
  crumbs?: Crumb[]
  actions?: ReactNode
  className?: string
}

/**
 * Consistent opening for every page: breadcrumb when relevant, one `h1`,
 * an optional intro paragraph and up to a couple of actions.
 */
export function PageHeader({
  title,
  eyebrow,
  intro,
  crumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn(styles.header, className)}>
      <PageContainer>
        {crumbs && crumbs.length > 0 ? (
          <Breadcrumb items={crumbs} className={styles.crumbs} />
        ) : null}
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </PageContainer>
    </header>
  )
}
