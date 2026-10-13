import type { ReactNode } from 'react'
import { Button } from '@/components/Button/Button'
import { PageContainer } from '@/components/PageContainer/PageContainer'
import { TextLink } from '@/components/TextLink/TextLink'
import { cn } from '@/utils/cn'
import styles from './NotFoundView.module.css'

/** What the visitor was looking for, which shapes the copy. */
export type NotFoundSubject = 'page' | 'artwork' | 'collection' | 'artist'

const SUBJECT_COPY: Record<NotFoundSubject, { title: string; description: string }> = {
  page: {
    title: 'This page doesn’t exist',
    description:
      'The address may have been mistyped, or the page may have been moved or renamed.',
  },
  artwork: {
    title: 'We couldn’t find that artwork',
    description:
      'This artwork reference doesn’t match anything on ArtVerse. It may have been withdrawn, or the link may be incomplete.',
  },
  collection: {
    title: 'We couldn’t find that collection',
    description:
      'This collection reference doesn’t match anything on ArtVerse. It may have been retired, or the link may be incomplete.',
  },
  artist: {
    title: 'We couldn’t find that artist or studio',
    description:
      'This profile reference doesn’t match anything on ArtVerse. The studio may have been renamed, or the link may be incomplete.',
  },
}

interface NotFoundViewProps {
  subject?: NotFoundSubject
  /** The id or path that was requested, shown so the visitor can check it. */
  reference?: string
  /** Extra content rendered under the description. */
  children?: ReactNode
  className?: string
}

/**
 * The single not-found experience. It is used both by the `/404` route and by
 * detail pages when an artwork, collection or artist id has no record, so
 * unknown links always land somewhere honest and navigable.
 */
export function NotFoundView({
  subject = 'page',
  reference,
  children,
  className,
}: NotFoundViewProps) {
  const copy = SUBJECT_COPY[subject]

  return (
    <div className={cn(styles.notFound, className)}>
      <PageContainer>
        <div className={styles.inner}>
          <p className={styles.code}>Error 404</p>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>

          {reference ? (
            <p className={styles.reference}>
              Requested: <code>{reference}</code>
            </p>
          ) : null}

          {children}

          <div className={styles.actions}>
            <Button to="/" variant="secondary">
              Back to home
            </Button>
            <Button to="/discover">Explore Art</Button>
          </div>

          <div className={styles.divider}>
            <nav aria-label="Useful destinations" className={styles.links}>
              <TextLink to="/artists">Artists &amp; Studios</TextLink>
              <TextLink to="/collections">Collections</TextLink>
              <TextLink to="/search">Search</TextLink>
            </nav>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
