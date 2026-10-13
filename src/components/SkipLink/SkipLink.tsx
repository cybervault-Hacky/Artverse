import styles from './SkipLink.module.css'

/**
 * Lets keyboard visitors jump straight past the header into page content.
 * Visible only while focused.
 */
export function SkipLink() {
  return (
    <a className={styles.skipLink} href="#main">
      Skip to content
    </a>
  )
}
